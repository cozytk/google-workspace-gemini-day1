import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = new URL('..', import.meta.url).pathname
const dir = path.join(root, 'public', 'walkthroughs')

const recipes = [
  {
    in: 'gemini-home.raw.png',
    out: 'gemini-home.png',
    title: 'Gemini 접속 후 Flash 모드 확인',
    redact: [
      [0, 1580, 620, 360],
      [3000, 0, 420, 180],
    ],
    callouts: [
      ['1', 1250, 780, 1320, 180, '프롬프트 입력'],
      ['2', 2360, 770, 250, 170, 'Flash 모드'],
    ],
  },
  {
    in: 'gemini-result.raw.png',
    out: 'gemini-result.png',
    title: 'Gemini 응답 표 확인',
    redact: [
      [0, 1580, 620, 360],
      [3000, 0, 420, 180],
    ],
    callouts: [
      ['1', 1180, 900, 1580, 640, '분류·근거 표'],
      ['2', 1200, 1740, 1540, 180, '다음 질문 입력'],
    ],
  },
  {
    in: 'sheets-blank.raw.png',
    out: 'sheets-blank.png',
    title: 'Sheets 새 문서 생성',
    redact: [
      [3000, 0, 420, 180],
    ],
    callouts: [
      ['1', 95, 330, 250, 95, 'A1 선택'],
      ['2', 2910, 40, 290, 100, '공유 상태'],
    ],
  },
  {
    in: 'appscript-run-log.raw.png',
    out: 'appscript-run-log.png',
    title: 'Apps Script 실행 로그',
    redact: [
      [3000, 0, 420, 180],
      [230, 0, 300, 90],
    ],
    callouts: [
      ['1', 920, 130, 940, 110, '실행 함수 선택'],
      ['2', 750, 340, 1480, 760, '코드 편집'],
      ['3', 650, 1350, 2260, 390, '실행 로그 확인'],
    ],
  },
  {
    in: 'notebooklm-source-dialog.raw.png',
    out: 'notebooklm-source-dialog.png',
    title: 'NotebookLM 복사 텍스트 소스 추가',
    redact: [
      [3000, 0, 420, 180],
    ],
    callouts: [
      ['1', 1100, 760, 1120, 620, '텍스트 붙여넣기'],
      ['2', 2060, 1500, 230, 130, '삽입'],
    ],
  },
  {
    in: 'notebooklm-summary.raw.png',
    out: 'notebooklm-summary.png',
    title: 'NotebookLM 소스 요약 확인',
    redact: [
      [3000, 0, 420, 180],
    ],
    callouts: [
      ['1', 60, 760, 760, 260, '소스 선택'],
      ['2', 930, 760, 1340, 740, '근거 기반 요약'],
      ['3', 2520, 430, 740, 710, 'Studio 산출물'],
    ],
  },
  {
    in: 'datastudio-home.raw.png',
    out: 'datastudio-home.png',
    title: 'Data Studio 홈',
    redact: [
      [3000, 0, 420, 190],
    ],
    callouts: [
      ['1', 20, 325, 280, 130, '만들기'],
      ['2', 690, 500, 820, 150, '보고서 만들기'],
      ['3', 1780, 500, 800, 150, '데이터로 채팅'],
    ],
  },
  {
    in: 'datastudio-report.raw.png',
    out: 'datastudio-report.png',
    title: 'Data Studio Google Sheets 연결 화면',
    redact: [
      [3000, 0, 420, 190],
    ],
    callouts: [
      ['1', 30, 600, 680, 90, '데이터 추가 패널'],
      ['2', 335, 865, 1375, 105, '검색'],
      ['3', 2460, 1135, 670, 270, 'Google Sheets'],
    ],
  },
  {
    in: 'datastudio-setup.raw.png',
    out: 'datastudio-setup.png',
    title: 'Data Studio 계정 1회 설정',
    redact: [
      [3000, 0, 420, 190],
    ],
    callouts: [
      ['1', 980, 890, 620, 120, '국가 선택'],
      ['2', 980, 1090, 620, 120, '회사 개요'],
      ['3', 980, 1260, 720, 120, '약관 동의 필요'],
    ],
  },
]

function svgOverlay({ width, height, recipe, scale }) {
  const offsetY = recipe.offsetY ?? 0
  const redactions = (recipe.redact ?? [])
    .map(([x, y, w, h]) => `<rect x="${x * scale}" y="${Math.max(0, y - offsetY) * scale}" width="${w * scale}" height="${h * scale}" rx="12" fill="#111827" opacity="0.92"/>`)
    .join('')

  const callouts = (recipe.callouts ?? [])
    .map(([n, x, y, w, h, label]) => {
      const sx = x * scale
      const sy = Math.max(0, y - offsetY) * scale
      const sw = w * scale
      const sh = h * scale
      const badge = 42
      const badgeX = Math.min(Math.max(sx + 10, badge / 2 + 2), width - badge / 2 - 2)
      const badgeY = Math.min(Math.max(sy + 10, badge / 2 + 2), height - badge / 2 - 2)
      const labelY = sy < 74 ? 86 : Math.max(8, sy - 30)
      return `
        <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="18" fill="none" stroke="#3b82f6" stroke-width="7"/>
        <circle cx="${badgeX}" cy="${badgeY}" r="${badge / 2}" fill="#2563eb"/>
        <text x="${badgeX}" y="${badgeY + 11}" text-anchor="middle" font-size="28" font-weight="800" fill="#fff" font-family="Arial">${n}</text>
        <rect x="${sx + 42}" y="${labelY}" width="${Math.max(170, label.length * 22)}" height="44" rx="22" fill="#2563eb"/>
        <text x="${sx + 62}" y="${labelY + 30}" font-size="24" font-weight="700" fill="#fff" font-family="Arial">${label}</text>
      `
    })
    .join('')

  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${redactions}
      <rect x="24" y="24" width="${Math.min(900, recipe.title.length * 28 + 56)}" height="56" rx="28" fill="#111827" opacity="0.86"/>
      <text x="56" y="62" font-size="30" font-weight="800" fill="#fff" font-family="Arial">${recipe.title}</text>
      ${callouts}
    </svg>
  `)
}

await fs.mkdir(dir, { recursive: true })

for (const recipe of recipes) {
  const input = path.join(dir, recipe.in)
  const output = path.join(dir, recipe.out)
  const metadata = await sharp(input).metadata()
  const cropTop = 320
  const cropBottom = 260
  // Overlay coordinates are authored against the raw screenshot, so subtract the
  // exact crop top. Any extra title-safe offset shifts callout boxes away from
  // the real button locations in the exported walkthrough assets.
  recipe.offsetY = cropTop
  const crop = {
    left: 0,
    top: cropTop,
    width: metadata.width,
    height: metadata.height - cropTop - cropBottom,
  }
  const targetWidth = 1600
  const scale = targetWidth / crop.width
  const targetHeight = Math.round(crop.height * scale)

  const base = sharp(input)
    .extract(crop)
    .resize(targetWidth)

  await base
    .composite([
      {
        input: svgOverlay({ width: targetWidth, height: targetHeight, recipe, scale }),
        left: 0,
        top: 0,
      },
    ])
    .png({ quality: 92 })
    .toFile(output)
}
