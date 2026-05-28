import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright-core'

const root = new URL('..', import.meta.url).pathname
const outDir = path.join(root, 'public', 'walkthroughs')
const reportDir = path.join(root, '.omx', 'reports')
await fs.mkdir(outDir, { recursive: true })
await fs.mkdir(reportDir, { recursive: true })

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9222'
const browser = await chromium.connectOverCDP(endpoint)
const context = browser.contexts()[0] ?? await browser.newContext()

async function pageMatching(re, fallbackUrl) {
  let page = context.pages().find((p) => re.test(p.url()))
  if (!page) page = await context.newPage()
  await page.setViewportSize({ width: 1512, height: 895 })
  if (fallbackUrl && !re.test(page.url())) {
    await page.goto(fallbackUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  }
  await page.bringToFront()
  await page.waitForTimeout(2500)
  return page
}

function roundBox(name, b, note = '') {
  if (!b) return null
  return {
    name,
    x: Math.round(b.x),
    y: Math.round(b.y),
    width: Math.round(b.width),
    height: Math.round(b.height),
    centerX: Math.round(b.x + b.width / 2),
    centerY: Math.round(b.y + b.height / 2),
    note,
  }
}

async function bbox(name, locator, note = '') {
  const loc = locator.first()
  await loc.waitFor({ state: 'visible', timeout: 30_000 })
  return roundBox(name, await loc.boundingBox(), note)
}

async function maybeClick(locator) {
  if (await locator.count().catch(() => 0)) {
    await locator.first().click({ force: true }).catch(() => {})
    await locator.first().page().waitForTimeout(600).catch(() => {})
  }
}

const manifests = []

function addManifest(title, url, screenshot, boxes, notes = []) {
  manifests.push({ title, url, screenshot, boxes: boxes.filter(Boolean), notes })
}

// 1) Google Sheets: create a real blank spreadsheet and select A1.
const sheets = await pageMatching(/docs\.google\.com\/spreadsheets/, 'https://docs.google.com/spreadsheets/create')
await sheets.waitForFunction(() => /스프레드시트|Sheets/.test(document.title), null, { timeout: 60_000 }).catch(() => {})
await maybeClick(sheets.getByRole('button', { name: /^확인$/ }))
if (/테이블|표 생성 지원/.test(await sheets.locator('body').innerText().catch(() => ''))) {
  // The Sheets "Tables" suggestion side panel covers the right edge of the
  // walkthrough. It has no stable accessible close label in every locale, so
  // close it from the visible panel close button coordinates after verifying
  // the panel text exists.
  await sheets.mouse.click(1468, 94).catch(() => {})
}
await sheets.waitForTimeout(1000)
const canvasBox = await bbox('Sheets grid canvas', sheets.locator('canvas').first(), 'Google Sheets grid is canvas-rendered, not per-cell DOM.')
const shareBox = await bbox('공유 버튼', sheets.locator('[aria-label*="공유하기"], [aria-label*="Share"]').first())
const a1Box = roundBox(
  'A1 셀 선택',
  {
    x: canvasBox.x + 52,
    y: canvasBox.y + 25,
    width: 98,
    height: 22,
  },
  'A1 is derived from the Sheets canvas box because cells are not exposed as individual DOM boxes.'
)
await sheets.mouse.click(a1Box.centerX, a1Box.centerY)
await sheets.waitForTimeout(700)
await sheets.screenshot({ path: path.join(outDir, 'sheets-blank.raw.png'), fullPage: false })
addManifest(
  'Sheets 실습 2: 분석 테이블 만들기',
  sheets.url(),
  'public/walkthroughs/sheets-blank.raw.png',
  [a1Box, shareBox, canvasBox],
  ['A1 셀은 DOM/accessibility 개별 노드가 아니라 canvas 위에 렌더링되어 canvas bbox에서 계산했다.']
)

// 2) Apps Script: create/run a no-auth log function and capture execution log.
const appscript = await pageMatching(/script\.google\.com\/home\/projects\//, 'https://script.google.com/home/projects/create')
await appscript.waitForFunction(() => !!globalThis.monaco?.editor?.getModels?.().length, null, { timeout: 60_000 })
await appscript.evaluate((code) => {
  globalThis.monaco.editor.getModels()[0].setValue(code)
}, `function myFunction() {\n  console.log('Gemini Workspace 실습 로그: 권한 없는 실행 확인');\n}\n`)
await appscript.keyboard.press('Meta+S')
await appscript.waitForTimeout(2500)
await maybeClick(appscript.locator('[aria-label="선택한 기능 실행"]'))
await appscript.waitForFunction(() => /실행이 완료됨|Execution completed|실행 로그/.test(document.body.innerText), null, { timeout: 60_000 }).catch(() => {})
await appscript.waitForTimeout(1500)
const runBox = await bbox('실행 버튼', appscript.locator('[aria-label="선택한 기능 실행"]'))
const functionBox = await bbox('myFunction 선택', appscript.getByText('myFunction').first()).catch(() => null)
const codeBox = await bbox('코드 편집기', appscript.locator('.monaco-editor').first())
const logTextBox = await bbox('실행 로그 결과', appscript.getByText(/Gemini Workspace 실습 로그|실행이 완료됨/).first())
await appscript.screenshot({ path: path.join(outDir, 'appscript-run-log.raw.png'), fullPage: false })
addManifest(
  'Apps Script 실습 4: 권한 없는 로그 실행',
  appscript.url(),
  'public/walkthroughs/appscript-run-log.raw.png',
  [runBox, functionBox, codeBox, logTextBox]
)

// 3) Data Studio / Looker Studio home: use the actual configured account state.
const studio = await pageMatching(/\/navigation\/reporting/, 'https://lookerstudio.google.com/navigation/reporting')
await studio.waitForTimeout(3500)
await maybeClick(studio.getByRole('button', { name: /^닫기$/ }))
await maybeClick(studio.locator('a[aria-label="Close"]'))
await maybeClick(studio.locator('[aria-label="선택 항목 지우기"]'))
await maybeClick(studio.getByRole('button', { name: /^나중에$/ }))
await studio.waitForTimeout(800)
const createBox = await bbox('왼쪽 만들기', studio.locator('button[aria-label="메뉴 열기"]').first())
const reportCreateBox = await bbox('보고서 만들기', studio.getByRole('button', { name: /보고서 만들기/ }).first())
const settingsBox = await bbox('환경설정', studio.locator('[aria-label*="환경설정"], [aria-label*="preferences"]').first())
const accountBox = await bbox('계정 전환', studio.locator('[aria-label*="계정"], [aria-label*="account"]').first())
const floatingReportBox = await bbox('새 보고서 작성', studio.getByRole('button', { name: /새 보고서 작성/ }).first()).catch(() => null)
await studio.screenshot({ path: path.join(outDir, 'datastudio-setup.raw.png'), fullPage: false })
addManifest(
  'Data Studio 계정 설정 상태 확인',
  studio.url(),
  'public/walkthroughs/datastudio-setup.raw.png',
  [settingsBox, accountBox, reportCreateBox],
  ['현재 계정은 이미 1회 설정이 완료되어 first-run 약관/국가 선택 화면 대신 실제 홈 진입 상태를 캡처했다.']
)
await studio.screenshot({ path: path.join(outDir, 'datastudio-home.raw.png'), fullPage: false })
addManifest(
  'Data Studio 실습 5: 보고서 만들기 진입',
  studio.url(),
  'public/walkthroughs/datastudio-home.raw.png',
  [createBox, reportCreateBox, floatingReportBox]
)

// 4) Data Studio report editor: open a blank report and capture the connector panel.
await reportCreateBox && studio.mouse.click(reportCreateBox.centerX, reportCreateBox.centerY)
await studio.waitForTimeout(9000)
await studio.waitForFunction(() => /보고서에 데이터 추가|Google Sheets|데이터에 연결/.test(document.body.innerText), null, { timeout: 60_000 }).catch(() => {})
const addDataBox = await bbox('보고서에 데이터 추가 패널', studio.getByText(/보고서에 데이터 추가|데이터에 연결/).first())
const searchBox = await bbox('검색 입력창', studio.locator('mat-form-field').filter({ hasText: /검색/ }).first())
const sheetsConnectorBox = await bbox('Google Sheets 커넥터', studio.getByText('Google Sheets').first())
await studio.screenshot({ path: path.join(outDir, 'datastudio-report.raw.png'), fullPage: false })
addManifest(
  'Data Studio 실습 5: Google Sheets 연결',
  studio.url(),
  'public/walkthroughs/datastudio-report.raw.png',
  [addDataBox, searchBox, sheetsConnectorBox]
)

let report = '# NotebookLM 이후 실습 DOM/accessibility bbox 캡처 로그\n\n검증일: 2026-05-27\n\n'
for (const m of manifests) {
  report += `## ${m.title}\n\nURL: ${m.url}\nScreenshot: \`${m.screenshot}\`\n\n`
  if (m.notes.length) report += m.notes.map((n) => `- ${n}`).join('\n') + '\n\n'
  report += '| 요소 | box | click center | note |\n|---|---:|---:|---|\n'
  for (const b of m.boxes) {
    report += `| ${b.name} | x:${b.x}, y:${b.y}, w:${b.width}, h:${b.height} | ${b.centerX}, ${b.centerY} | ${b.note ?? ''} |\n`
  }
  report += '\n'
}

await fs.writeFile(path.join(reportDir, 'after-notebook-dom-bboxes.md'), report)
console.log(report)
await browser.close()
