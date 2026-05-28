#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright-chromium'
import sharp from 'sharp'

const args = new Map()
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i]
  if (arg === '--') continue
  if (!arg.startsWith('--')) continue
  const key = arg.slice(2)
  const next = process.argv[i + 1]
  if (!next || next.startsWith('--')) args.set(key, 'true')
  else {
    args.set(key, next)
    i += 1
  }
}

const root = path.resolve(new URL('..', import.meta.url).pathname)
const port = Number(args.get('port') || process.env.SLIDEV_PORT || 3030)
const viewportWidth = Number(args.get('width') || 1280)
const viewportHeight = Number(args.get('height') || 720)
const routeBase = args.get('url') || `http://localhost:${port}`
const runId = args.get('run-id') || new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T').replace('Z', 'Z')
const outDir = path.resolve(root, args.get('out-dir') || path.join('.omx', 'visual-checks', runId))
const keepServer = args.get('keep-server') === 'true'
const maxSlidesOverride = args.has('slides') ? Number(args.get('slides')) : null

function log(message) {
  console.log(`[visual-qa] ${message}`)
}

async function exists(url) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1000)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    return res.ok
  } catch {
    return false
  }
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await exists(url)) return true
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return false
}

function startSlidev() {
  const child = spawn('pnpm', ['exec', 'slidev', '--port', String(port), '--log', 'warn'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '0' },
  })
  child.stdout.on('data', (chunk) => process.stdout.write(chunk))
  child.stderr.on('data', (chunk) => process.stderr.write(chunk))
  return child
}

function rectOf(r) {
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
}

const auditScript = () => {
  const layouts = [...document.querySelectorAll('.slidev-layout')].filter((el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length))
  const layout = layouts.at(-1) || document.querySelector('.slidev-layout')
  const lr = layout?.getBoundingClientRect()
  const overflowElements = []
  const scrollElements = []
  const ignoredTags = new Set(['path', 'symbol', 'defs', 'clipPath', 'linearGradient', 'stop'])
  const elems = [...(layout?.querySelectorAll('*') ?? [])]

  for (const el of elems) {
    const style = getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    const tag = el.tagName.toLowerCase()
    const cls = typeof el.className === 'string' ? el.className : String(el.className || '')
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120)

    if (lr && (r.left < lr.left - 2 || r.top < lr.top - 2 || r.right > lr.right + 2 || r.bottom > lr.bottom + 2)) {
      if (!ignoredTags.has(tag)) {
        overflowElements.push({
          tag,
          cls: cls.slice(0, 100),
          text,
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        })
      }
    }

    if ((el.scrollWidth > el.clientWidth + 3 || el.scrollHeight > el.clientHeight + 3) && !['svg', 'path', 'br'].includes(tag)) {
      if (text && !cls.includes('shiki')) {
        scrollElements.push({
          tag,
          cls: cls.slice(0, 100),
          text,
          overflow: `${style.overflow}/${style.overflowX}/${style.overflowY}`,
          client: { w: el.clientWidth, h: el.clientHeight },
          scroll: { w: el.scrollWidth, h: el.scrollHeight },
        })
      }
    }
  }

  const visibleH1 = [...(layout?.querySelectorAll('h1') ?? [])].find((h) => !!(h.offsetWidth || h.offsetHeight || h.getClientRects().length))
  const h1 = visibleH1?.innerText?.trim() || '(no h1)'
  const body = layout?.innerText || document.body.innerText || ''
  return {
    h1,
    textLen: body.length,
    overflowElements: overflowElements.slice(0, 12),
    scrollElements: scrollElements.slice(0, 12),
    hasErrorText: /Failed to load|Cannot find module|Internal server error/i.test(body),
    bodySample: body.slice(0, 220),
  }
}

async function makeContactSheet(files, output, { columns = 4, thumbWidth = 320, thumbHeight = 180 } = {}) {
  if (!files.length) {
    const empty = Buffer.from(`<svg width="${thumbWidth}" height="${thumbHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f4f7fb"/><text x="24" y="92" font-size="24" fill="#172033" font-family="Arial" font-weight="700">No issue slides</text></svg>`)
    await sharp(empty).jpeg({ quality: 86 }).toFile(output)
    return
  }

  const labelHeight = 28
  const cellHeight = thumbHeight + labelHeight
  const rows = Math.ceil(files.length / columns)
  const base = sharp({ create: { width: columns * thumbWidth, height: rows * cellHeight, channels: 3, background: '#f4f7fb' } })
  const composites = []

  for (let idx = 0; idx < files.length; idx += 1) {
    const file = files[idx]
    const slideNo = path.basename(file).match(/slide-(\d+)\.png/)?.[1] ?? String(idx + 1).padStart(2, '0')
    const x = (idx % columns) * thumbWidth
    const y = Math.floor(idx / columns) * cellHeight
    const thumb = await sharp(file).resize(thumbWidth, thumbHeight, { fit: 'cover' }).png().toBuffer()
    const label = Buffer.from(`<svg width="${thumbWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#172033"/><text x="10" y="20" font-size="16" fill="#fff" font-family="Arial" font-weight="700">Slide ${Number(slideNo)}</text></svg>`)
    composites.push({ input: label, left: x, top: y })
    composites.push({ input: thumb, left: x, top: y + labelHeight })
  }

  await base.composite(composites).jpeg({ quality: 84 }).toFile(output)
}

await fs.mkdir(outDir, { recursive: true })

let server = null
let serverStartedByScript = false
try {
  if (!(await waitForServer(routeBase, 1500))) {
    log(`starting Slidev on port ${port}`)
    server = startSlidev()
    serverStartedByScript = true
    const ready = await waitForServer(routeBase, 60_000)
    if (!ready) throw new Error(`Slidev server did not become ready at ${routeBase}`)
  } else {
    log(`reusing existing Slidev server at ${routeBase}`)
  }

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: viewportWidth, height: viewportHeight }, deviceScaleFactor: 1 })
  await page.goto(`${routeBase}/1`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  const slidevTotal = await page.evaluate(() => window.__slidev__?.nav?.total ?? 0)
  const total = maxSlidesOverride || slidevTotal
  if (!Number.isFinite(total) || total <= 0) throw new Error(`Unable to determine Slidev slide total from ${routeBase}`)

  const results = []
  for (let i = 1; i <= total; i += 1) {
    await page.goto(`${routeBase}/${i}`, { waitUntil: 'networkidle' })
    await page.waitForFunction((n) => window.__slidev__?.nav?.currentPage === n, i, { timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(450)
    const file = path.join(outDir, `slide-${String(i).padStart(2, '0')}.png`)
    await page.screenshot({ path: file, fullPage: false })
    const data = await page.evaluate(auditScript)
    const routePage = await page.evaluate(() => window.__slidev__?.nav?.currentPage ?? null)
    results.push({ slide: i, routePage, file: path.relative(root, file), ...data })
    const issueCount = data.overflowElements.length + data.scrollElements.length + (data.hasErrorText ? 1 : 0)
    log(`${String(i).padStart(2, '0')}/${total} ${data.h1.replace(/\n/g, ' / ')} issues=${issueCount}`)
  }

  await browser.close()

  const pngs = results.map((r) => path.resolve(root, r.file))
  for (let i = 0; i < pngs.length; i += 20) {
    await makeContactSheet(pngs.slice(i, i + 20), path.join(outDir, `contact-${String(Math.floor(i / 20) + 1).padStart(2, '0')}.jpg`))
  }
  const issuePngs = results
    .filter((r) => r.overflowElements.length || r.scrollElements.length || r.hasErrorText)
    .map((r) => path.resolve(root, r.file))
  await makeContactSheet(issuePngs, path.join(outDir, 'contact-issues.jpg'))

  const summary = {
    capturedAt: new Date().toISOString(),
    runId,
    routeBase,
    viewport: { width: viewportWidth, height: viewportHeight },
    total,
    issueSlides: results.filter((r) => r.overflowElements.length || r.scrollElements.length || r.hasErrorText).map((r) => ({
      slide: r.slide,
      title: r.h1,
      overflowCount: r.overflowElements.length,
      scrollCount: r.scrollElements.length,
      hasErrorText: r.hasErrorText,
    })),
    results,
  }
  await fs.writeFile(path.join(outDir, 'visual-audit.json'), JSON.stringify(summary, null, 2))
  log(`wrote ${path.relative(root, outDir)}`)
  log(`issue slides: ${summary.issueSlides.length ? summary.issueSlides.map((s) => s.slide).join(', ') : 'none'}`)
} finally {
  if (serverStartedByScript && server && !keepServer) {
    server.kill('SIGTERM')
  }
}
