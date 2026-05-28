import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { chromium } from 'playwright-chromium'

const root = new URL('..', import.meta.url).pathname
const outDir = path.join(root, 'public', 'walkthroughs')
const reportDir = path.join(root, '.omx', 'team_reports')
await fs.mkdir(outDir, { recursive: true })
await fs.mkdir(reportDir, { recursive: true })

const viewport = { width: 1512, height: 895 }
const synthetic = {
  requestId: 'REQ-001',
  email: 'trainee@example.com',
  title: 'VPN 접속 오류 · 오늘 오후 고객 미팅',
  type: 'IT지원',
  due: '2026-06-01',
  folder: 'REQ-001_VPN_지원_합성데이터',
}

const baseCss = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif; color: #1f2937; background: #f6f7fb; }
  .browser { width: 1512px; height: 895px; background: #fff; overflow: hidden; position: relative; }
  .topbar { height: 64px; display: flex; align-items: center; gap: 16px; padding: 0 26px; border-bottom: 1px solid #e5e7eb; background: #fff; }
  .app-logo { width: 34px; height: 34px; border-radius: 10px; display:grid; place-items:center; color:#fff; font-weight:900; }
  .app-title { font-size: 21px; font-weight: 760; letter-spacing: -0.02em; }
  .url-pill { margin-left: auto; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 999px; padding: 9px 18px; color: #64748b; font-size: 14px; }
  .workspace { display: grid; grid-template-columns: 260px 1fr; height: 831px; }
  .side { background: #f8fafc; border-right: 1px solid #e5e7eb; padding: 24px 18px; }
  .side .item { padding: 12px 16px; border-radius: 14px; font-size: 15px; color: #475569; margin-bottom: 7px; }
  .side .item.active { background: #e8f0fe; color: #1a73e8; font-weight: 750; }
  .main { padding: 32px 40px; position: relative; }
  .card { background:#fff; border: 1px solid #e5e7eb; border-radius: 24px; box-shadow: 0 18px 50px rgba(15, 23, 42, .08); }
  .muted { color:#64748b; }
  .btn { border: 0; border-radius: 999px; padding: 12px 20px; font-weight: 760; background: #1a73e8; color: #fff; display: inline-flex; align-items: center; gap: 8px; }
  .btn.secondary { background:#eef2ff; color:#3730a3; }
  .btn.danger-boundary { background:#fff7ed; color:#c2410c; border:1px solid #fed7aa; }
  .field { border: 1px solid #dbe3ef; border-radius: 14px; padding: 13px 16px; background:#fff; min-height: 46px; }
  .label { font-size: 13px; color:#64748b; margin-bottom: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
  .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .banner { border-radius: 18px; padding: 14px 18px; background:#ecfeff; color:#155e75; font-weight:700; }
  [data-bbox] { outline: 0 solid transparent; }
`

function html(title, logoColor, logoText, body) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${baseCss}</style></head><body>
    <div class="browser">
      <div class="topbar"><div class="app-logo" style="background:${logoColor}">${logoText}</div><div class="app-title">${title}</div><div class="url-pill">synthetic.local · 실제 Google 계정 아님</div></div>
      ${body}
    </div>
  </body></html>`
}

const screens = [
  {
    name: 'request-intake-forms',
    title: 'Google Forms 요청 접수 화면',
    html: html('Google Forms · 요청 접수', '#7248b9', 'F', `
      <div class="workspace">
        <aside class="side"><div class="item active">질문</div><div class="item" data-bbox="응답 탭">응답 0</div><div class="item">설정</div><div class="item">미리보기</div></aside>
        <main class="main" style="background:#f4effc">
          <section class="card" style="max-width: 920px; padding: 28px 34px; border-top: 12px solid #7248b9;">
            <div class="field" data-bbox="양식 제목" style="font-size:32px; font-weight:800; border:none; border-bottom:1px solid #e5e7eb; border-radius:0; padding-left:0;">공용 요청함 자동화 실습</div>
            <p class="muted">실제 회사 정보가 아닌 합성 요청 데이터만 입력합니다.</p>
            <div class="field" data-bbox="요청자 이메일 질문" style="margin-top:28px;"><b>요청자 이메일</b><br><span class="muted">단답형 · 필수 · 예: ${synthetic.email}</span></div>
            <div class="field" style="margin-top:16px;"><b>요청 제목</b><br><span class="muted">${synthetic.title}</span></div>
            <div class="grid2" style="margin-top:16px;"><div class="field"><b>요청 유형</b><br><span class="muted">${synthetic.type}</span></div><div class="field"><b>희망 처리 기한</b><br><span class="muted">${synthetic.due}</span></div></div>
          </section>
          <div data-bbox="질문 추가" style="position:absolute; left:1010px; top:248px; width:54px; height:54px; border-radius:50%; background:#fff; border:1px solid #d1d5db; display:grid; place-items:center; font-size:30px; color:#7248b9; box-shadow:0 8px 20px rgba(0,0,0,.12);">+</div>
          <button class="btn secondary" data-bbox="Sheets 연결" style="position:absolute; left:910px; top:108px;">응답을 Sheets에 연결</button>
        </main>
      </div>`),
  },
  {
    name: 'request-intake-gmail-draft',
    title: 'Gmail draft reply',
    html: html('Gmail · Draft only', '#ea4335', 'M', `
      <div class="workspace">
        <aside class="side"><button class="btn" style="width:100%; justify-content:center; margin-bottom:20px;">편지쓰기</button><div class="item">받은편지함</div><div class="item active" data-bbox="임시보관함 라벨">임시보관함 1</div><div class="item">보낸편지함</div></aside>
        <main class="main" style="background:#f8fafc">
          <section class="card" style="width: 890px; margin: 48px auto 0; overflow:hidden;">
            <div style="height:48px; background:#f1f5f9; display:flex; align-items:center; padding:0 20px; font-weight:800;">새 메일 · 초안</div>
            <div style="padding:22px 26px; display:grid; gap:14px;">
              <div class="field" data-bbox="수신자"><span class="muted">To</span> ${synthetic.email}</div>
              <div class="field" data-bbox="Draft subject"><span class="muted">Subject</span> [실습] ${synthetic.requestId} 접수 확인</div>
              <div class="field" data-bbox="Draft body" style="height:260px; line-height:1.7;">안녕하세요. ${synthetic.requestId} 요청을 접수했습니다.<br><br>요청 제목: ${synthetic.title}<br>담당 후보: IT지원<br>확인 질문: 외부망/사내망 중 어느 환경에서 오류가 발생했나요?<br><br><b>실습 안전 경계:</b> 이 화면은 초안 확인용이며 실제 발송하지 않습니다.</div>
              <div style="display:flex; align-items:center; gap:12px;"><button class="btn danger-boundary" data-bbox="Send button - do not click">보내기 금지 · draft only</button><span class="muted">GmailApp.createDraft 기본값을 유지</span></div>
            </div>
          </section>
        </main>
      </div>`),
  },
  {
    name: 'request-intake-calendar',
    title: 'Calendar event draft',
    html: html('Google Calendar · Event draft', '#1a73e8', 'C', `
      <div class="workspace">
        <aside class="side"><button class="btn" data-bbox="Create event" style="width:100%; justify-content:center; margin-bottom:20px;">+ 만들기</button><div class="item active">내 캘린더</div><div class="item">실습 캘린더</div></aside>
        <main class="main" style="background:#f8fbff">
          <section class="card" style="width:780px; margin:42px auto 0; padding:28px 34px;">
            <div class="banner">저장 전 캡처 · sandbox 계정에서만 저장</div>
            <div class="label" style="margin-top:22px;">제목</div><div class="field" data-bbox="일정 제목" style="font-size:24px; font-weight:800;">[실습] ${synthetic.requestId} VPN 지원 확인</div>
            <div class="grid2" style="margin-top:18px;"><div><div class="label">일시</div><div class="field" data-bbox="일시">${synthetic.due} 10:00–10:30</div></div><div><div class="label">참석자</div><div class="field" data-bbox="참석자">trainee@example.com</div></div></div>
            <div class="label" style="margin-top:18px;">설명</div><div class="field" style="height:120px;">${synthetic.title}<br>합성 요청 데이터 기반 후속 확인 일정입니다.</div>
            <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:22px;"><button class="btn secondary">취소</button><button class="btn danger-boundary" data-bbox="저장 버튼 - sandbox only">저장 전 중지</button></div>
          </section>
        </main>
      </div>`),
  },
  {
    name: 'request-intake-drive',
    title: 'Drive folder and share boundary',
    html: html('Google Drive · Folder/share', '#34a853', 'D', `
      <div class="workspace">
        <aside class="side"><button class="btn" data-bbox="New > Folder" style="width:100%; justify-content:center; margin-bottom:20px; background:#fff; color:#1f2937; border:1px solid #d1d5db;">+ 새로 만들기</button><div class="item active">내 드라이브</div><div class="item">공유 문서함</div></aside>
        <main class="main" style="background:#f8fafc">
          <div class="card" style="padding:22px 26px; margin-bottom:22px; display:flex; align-items:center; gap:16px;"><div style="font-size:32px;">📁</div><div data-bbox="Synthetic folder name"><b>${synthetic.folder}</b><br><span class="muted">합성 요청 전용 폴더 · 실제 프로젝트 자료 없음</span></div><button class="btn secondary" data-bbox="공유 버튼" style="margin-left:auto;">공유</button></div>
          <section class="card" data-bbox="Share dialog" style="width:780px; margin:38px auto 0; padding:28px 34px;">
            <h2 style="margin:0 0 18px;">${synthetic.folder} 공유</h2>
            <div class="field" data-bbox="사용자 추가" style="margin-bottom:16px;">사용자, 그룹 또는 캘린더 담당자 추가</div>
            <div class="grid2"><div class="field" data-bbox="권한 상태"><b>일반 액세스</b><br><span class="muted">제한됨 · 링크가 있는 사용자로 변경 전 확인</span></div><div class="field" data-bbox="Role dropdown"><b>역할</b><br><span class="muted">뷰어 / 댓글 작성자 / 편집자</span></div></div>
            <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:22px;"><button class="btn secondary" data-bbox="Copy link - internal only">내부 링크 복사</button><button class="btn danger-boundary">외부 공유 금지</button></div>
          </section>
        </main>
      </div>`),
  },
]

function overlaySvg({ width, height, boxes, title }) {
  const colors = ['#2563eb', '#7c3aed', '#ea580c', '#059669', '#dc2626', '#0891b2']
  const callouts = boxes.map((b, i) => {
    const c = colors[i % colors.length]
    const badgeX = Math.min(Math.max(b.x + 18, 24), width - 24)
    const badgeY = Math.min(Math.max(b.y + 18, 24), height - 24)
    return `<rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" rx="14" fill="none" stroke="${c}" stroke-width="6"/>
      <circle cx="${badgeX}" cy="${badgeY}" r="22" fill="${c}"/>
      <text x="${badgeX}" y="${badgeY + 9}" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" font-family="Arial">${i + 1}</text>`
  }).join('\n')
  const legendX = 24
  const legendY = Math.max(600, height - (116 + boxes.length * 30))
  const legendH = 92 + boxes.length * 30
  const legend = boxes.map((b, i) => `<text x="${legendX + 20}" y="${legendY + 88 + i * 30}" font-size="21" font-weight="800" fill="#111827" font-family="Arial">${i + 1}. ${escapeXml(b.name)}</text>`).join('\n')
  return Buffer.from(`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    ${callouts}
    <rect x="${legendX}" y="${legendY}" width="560" height="${legendH}" rx="24" fill="#ffffff" opacity="0.94" stroke="#dbe3ef"/>
    <text x="${legendX + 20}" y="${legendY + 42}" font-size="25" font-weight="900" fill="#111827" font-family="Arial">${escapeXml(title)}</text>
    <text x="${legendX + 20}" y="${legendY + 68}" font-size="17" font-weight="700" fill="#64748b" font-family="Arial">Synthetic fallback · Playwright DOM bbox</text>
    ${legend}
  </svg>`)
}

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[ch]))
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: 'ko-KR' })
const manifest = []

for (const screen of screens) {
  const page = await context.newPage()
  await page.setContent(screen.html, { waitUntil: 'load' })
  await page.screenshot({ path: path.join(outDir, `${screen.name}.raw.png`), fullPage: false })
  const boxes = await page.locator('[data-bbox]').evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect()
    return {
      name: node.getAttribute('data-bbox'),
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      centerX: Math.round(rect.x + rect.width / 2),
      centerY: Math.round(rect.y + rect.height / 2),
    }
  }))
  const rawPath = path.join(outDir, `${screen.name}.raw.png`)
  const outPath = path.join(outDir, `${screen.name}.png`)
  const meta = await sharp(rawPath).metadata()
  await sharp(rawPath)
    .composite([{ input: overlaySvg({ width: meta.width, height: meta.height, boxes, title: screen.title }) }])
    .png()
    .toFile(outPath)
  manifest.push({ screen: screen.title, raw: `public/walkthroughs/${screen.name}.raw.png`, annotated: `public/walkthroughs/${screen.name}.png`, boxes })
  await page.close()
}
await browser.close()

let report = '# Synthetic request-intake fallback bbox assets\n\n'
report += `Generated: ${new Date().toISOString()}\n\n`
report += 'These assets are synthetic local HTML mocks, not screenshots from a logged-in Google account. They exist as safe fallback placeholders for Forms/Gmail/Calendar/Drive request-intake teaching until an instructor sandbox account can recapture real UI.\n\n'
for (const item of manifest) {
  report += `## ${item.screen}\n\nRaw: \`${item.raw}\`\n\nAnnotated: \`${item.annotated}\`\n\n`
  report += '| 요소 | box | click center |\n|---|---:|---:|\n'
  for (const b of item.boxes) {
    report += `| ${b.name} | x:${b.x}, y:${b.y}, w:${b.width}, h:${b.height} | ${b.centerX}, ${b.centerY} |\n`
  }
  report += '\n'
}
report = report.trimEnd() + '\n'
await fs.writeFile(path.join(reportDir, 'g002-fallback-bbox-assets.generated.md'), report)
console.log(report)
