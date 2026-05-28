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

async function pageFor(urlPart, fallbackUrl) {
  let p = context.pages().find(p => p.url().includes(urlPart))
  if (!p) p = await context.newPage()
  await p.setViewportSize({ width: 1512, height: 895 })
  await p.goto(fallbackUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await p.waitForTimeout(2500)
  return p
}

async function bbox(locator, name) {
  const loc = locator.first()
  await loc.waitFor({ state: 'visible', timeout: 30_000 })
  const b = await loc.boundingBox()
  if (!b) throw new Error(`No bbox: ${name}`)
  return { name, x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.width), height: Math.round(b.height), centerX: Math.round(b.x + b.width / 2), centerY: Math.round(b.y + b.height / 2) }
}

async function textBoxByName(page, re) {
  const role = page.getByRole('textbox', { name: re })
  if (await role.count()) return role.first()
  return page.locator('[contenteditable="true"], textarea, input').first()
}

const manifests = []
function mdFor(title, url, screenshot, boxes) {
  const lines = [`# ${title}`, '', `URL: ${url}`, `Screenshot: ${screenshot}`, '', '| 요소 | box | click center |', '|---|---:|---:|']
  for (const b of boxes) lines.push(`| ${b.name} | x:${b.x}, y:${b.y}, w:${b.width}, h:${b.height} | ${b.centerX}, ${b.centerY} |`)
  return lines.join('\n') + '\n'
}

// Gemini: real logged-in Chrome profile through CDP.
const gemini = await pageFor('gemini.google.com/app', 'https://gemini.google.com/app')
const geminiPrompt = await textBoxByName(gemini, /Gemini 프롬프트 입력|Gemini에게 물어보기/i)
const geminiHomeBoxes = [
  await bbox(geminiPrompt, '프롬프트 입력창'),
  await bbox(gemini.getByRole('button', { name: /모드 선택 도구 열기|Flash/i }), 'Flash 모드 선택'),
  await bbox(gemini.getByRole('button', { name: /파일 업로드|업로드 및 도구|도구/i }).first(), '업로드/도구'),
]
await gemini.screenshot({ path: path.join(outDir, 'gemini-home.raw.png'), fullPage: false })
manifests.push({ title: 'Gemini 접속 후 Flash 모드 확인', url: gemini.url(), screenshot: 'public/walkthroughs/gemini-home.raw.png', boxes: geminiHomeBoxes })

const prompt = `당신은 본사 경영관리팀의 업무 요청 분류 담당자입니다.\n아래 예시 데이터를 계약/정산/인사/기타로 분류하고, 긴급도, 근거, 확인 질문, 답장 초안을 표로 작성해 주세요.\n근거가 부족하면 확인 필요라고 표시하세요.\n\n요청: 해외법인 월간 비용 정산 파일에 누락 행이 있는 것 같습니다. 이번 주 금요일 보고 전까지 확인 가능한가요?`
await geminiPrompt.click()
try { await geminiPrompt.fill(prompt) } catch { await gemini.keyboard.insertText(prompt) }
await gemini.waitForTimeout(600)
let send = gemini.getByRole('button', { name: /메시지 보내기|보내기|Submit|Send/i }).last()
const sendBox = await bbox(send, '메시지 보내기')
await send.click()
await gemini.waitForTimeout(3000)
await gemini.waitForFunction(() => /업무 요청|정산|Medium|긴급도|확인 질문/.test(document.body.innerText), null, { timeout: 120_000 }).catch(() => {})
await gemini.waitForTimeout(2500)
const resultBoxes = [sendBox]
for (const [label, pattern] of [
  ['응답 제목/분석', /업무 요청 분석|처리 안|경영관리팀 업무 요청/],
  ['분류 값', /정산/],
  ['긴급도 값', /Medium|긴급도/],
  ['확인 질문', /확인 질문/],
]) {
  const loc = gemini.getByText(pattern).first()
  if (await loc.count()) resultBoxes.push(await bbox(loc, label).catch(() => null))
}
const geminiResultBoxes = resultBoxes.filter(Boolean)
await gemini.screenshot({ path: path.join(outDir, 'gemini-result.raw.png'), fullPage: false })
manifests.push({ title: 'Gemini 실습 1 결과 확인', url: gemini.url(), screenshot: 'public/walkthroughs/gemini-result.raw.png', boxes: geminiResultBoxes })

// NotebookLM: create/open source workflow if logged in.
const nb = await pageFor('notebooklm.google.com', 'https://notebooklm.google.com/')
const bodyText = await nb.locator('body').innerText({ timeout: 20_000 }).catch(() => '')
if (/로그인|Sign in|이메일 또는 휴대전화/.test(bodyText)) {
  manifests.push({ title: 'NotebookLM 로그인 필요', url: nb.url(), screenshot: '(not captured)', boxes: [] })
} else {
  // Prefer an existing/new notebook surface. This path is intentionally tolerant
  // because NotebookLM labels change frequently.
  const createCandidates = [
    nb.getByRole('button', { name: /새 노트북|Create new|New notebook|노트북 만들기/i }),
    nb.getByText(/새 노트북|Create new|New notebook|노트북 만들기/i),
  ]
  for (const c of createCandidates) {
    if (await c.count()) { await c.first().click().catch(() => {}); await nb.waitForTimeout(2500); break }
  }
  const addSource = nb.getByRole('button', { name: /소스 추가|Add source|Add sources/i }).or(nb.getByText(/소스 추가|Add source|Add sources/i)).first()
  if (await addSource.count()) { await addSource.click().catch(() => {}); await nb.waitForTimeout(1500) }
  const copiedText = nb.getByText(/복사한 텍스트|Copied text|Paste text|텍스트/i).first()
  if (await copiedText.count()) { await copiedText.click().catch(() => {}); await nb.waitForTimeout(1000) }
  const nbBoxes1 = []
  for (const [label, loc] of [
    ['소스 추가', addSource],
    ['복사한 텍스트', copiedText],
    ['텍스트 붙여넣기 영역', nb.locator('textarea, [contenteditable="true"]').first()],
    ['삽입 버튼', nb.getByRole('button', { name: /삽입|Insert|추가|Add/i }).last()],
  ]) {
    if (await loc.count()) nbBoxes1.push(await bbox(loc, label).catch(() => null))
  }
  await nb.screenshot({ path: path.join(outDir, 'notebooklm-source-dialog.raw.png'), fullPage: false })
  manifests.push({ title: 'NotebookLM 복사 텍스트 소스 추가', url: nb.url(), screenshot: 'public/walkthroughs/notebooklm-source-dialog.raw.png', boxes: nbBoxes1.filter(Boolean) })

  const textArea = nb.locator('textarea, [contenteditable="true"]').first()
  if (await textArea.count()) {
    await textArea.click().catch(() => {})
    const sourceText = `Overseas Subsidiary Monthly Expense Settlement Regulations\n\n해외 법인의 월간 비용 정산 파일은 매월 28일까지 증빙 서류와 함께 제출해야 합니다. 누락 행이나 데이터 오류가 발견되면 본사 경영관리팀은 금요일 보고 전날까지 대상 법인, 비용 항목, 기간을 확인한 뒤 정정 요청을 발송합니다.`
    try { await textArea.fill(sourceText) } catch { await nb.keyboard.insertText(sourceText) }
    await nb.waitForTimeout(500)
    const insert = nb.getByRole('button', { name: /삽입|Insert|추가|Add/i }).last()
    if (await insert.count()) await insert.click().catch(() => {})
    await nb.waitForTimeout(7000)
  }
  const nbBoxes2 = []
  for (const [label, loc] of [
    ['소스 목록', nb.getByText(/Overseas|붙여넣은 텍스트|Pasted text|소스/i).first()],
    ['근거 기반 요약', nb.getByText(/Overseas Subsidiary|요약|정산|월간 비용/i).first()],
    ['Studio 산출물', nb.getByText(/Studio|오디오|Audio|마인드맵|보고서|Briefing/i).first()],
    ['질문 입력창', nb.locator('textarea, [contenteditable="true"]').last()],
  ]) {
    if (await loc.count()) nbBoxes2.push(await bbox(loc, label).catch(() => null))
  }
  await nb.screenshot({ path: path.join(outDir, 'notebooklm-summary.raw.png'), fullPage: false })
  manifests.push({ title: 'NotebookLM 소스 요약 확인', url: nb.url(), screenshot: 'public/walkthroughs/notebooklm-summary.raw.png', boxes: nbBoxes2.filter(Boolean) })
}

let report = '# DOM/accessibility bbox 기반 실습 캡처 로그\n\n'
for (const m of manifests) report += mdFor(m.title, m.url, m.screenshot, m.boxes) + '\n'
await fs.writeFile(path.join(reportDir, 'dom-bbox-walkthroughs.md'), report)
console.log(report)
await browser.close()
