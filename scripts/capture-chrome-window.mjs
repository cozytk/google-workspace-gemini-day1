#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const args = new Map()
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i]
  if (arg.startsWith('--')) {
    const key = arg.slice(2)
    const next = process.argv[i + 1]
    if (!next || next.startsWith('--')) args.set(key, 'true')
    else {
      args.set(key, next)
      i += 1
    }
  }
}

const swift = `
import CoreGraphics
let opts = CGWindowListOption.optionAll
if let arr = CGWindowListCopyWindowInfo(opts, kCGNullWindowID) as? [[String: Any]] {
  for w in arr {
    let owner = w[kCGWindowOwnerName as String] as? String ?? ""
    let name = w[kCGWindowName as String] as? String ?? ""
    let number = w[kCGWindowNumber as String] ?? ""
    let bounds = w[kCGWindowBounds as String] as? [String: Any] ?? [:]
    let height = bounds["Height"] ?? ""
    let width = bounds["Width"] ?? ""
    let x = bounds["X"] ?? ""
    let y = bounds["Y"] ?? ""
    if owner.contains("Chrome") {
      print("\\(number)\\t\\(owner)\\t\\(name)\\tHeight=\\(height);Width=\\(width);X=\\(x);Y=\\(y)")
    }
  }
}
`

const lines = execFileSync('swift', ['-e', swift], { encoding: 'utf8' })
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)

if (args.has('list')) {
  console.log(lines.join('\n'))
  process.exit(0)
}

const title = args.get('title')
const out = args.get('out')
if (!title || !out) {
  console.error('Usage: node scripts/capture-chrome-window.mjs --title "Google Gemini" --out public/walkthroughs/name.raw.png')
  console.error('       node scripts/capture-chrome-window.mjs --list')
  process.exit(2)
}

const candidates = lines
  .map((line) => {
    const [id, owner, name, ...rest] = line.split('\t')
    return { id, owner, name, raw: line, bounds: rest.join('\t') }
  })
  .filter((w) => w.id && w.name && w.name.includes(title))
  .filter((w) => !w.bounds.includes('Height=1;'))

if (!candidates.length) {
  console.error(`No Chrome window title matched: ${title}`)
  console.error(lines.join('\n'))
  process.exit(1)
}

const target = candidates[0]
mkdirSync(path.dirname(out), { recursive: true })
execFileSync('screencapture', ['-x', `-l${target.id}`, out], { stdio: 'inherit' })
console.log(JSON.stringify({ ok: true, id: target.id, title: target.name, out }, null, 2))
