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
    compactLabels: true,
    cropTop: 0,
    cropBottom: 0,
    redact: [],
    callouts: [
      ['1', 450, 415, 665, 65, '프롬프트 입력창'],
      ['2', 967, 428, 91, 40, 'Flash 모드'],
      // Keep the third marker as a pin. A boxed marker on this small icon
      // overlaps the prompt-field marker and makes the screenshot look wrong in
      // PDF export even though the DOM bbox is correct.
      ['3', 420, 470, 482, 447, '업로드/도구', 'pin'],
    ],
  },
  {
    in: 'gemini-result.raw.png',
    out: 'gemini-result.png',
    title: 'Gemini 응답 표 확인',
    compactLabels: true,
    cropTop: 0,
    // The Gemini prompt composer is sticky at the bottom of the viewport. If the
    // screenshot keeps that area, the composer visually covers the answer table.
    // Crop before the sticky composer and teach the remaining answer fields in
    // the slide checklist instead of showing partially hidden UI.
    cropBottom: 140,
    redact: [],
    callouts: [
      ['1', 360, 386, 410, 386, '응답 제목', 'pin'],
      ['2', 360, 440, 410, 440, '항목 열', 'pin'],
      ['3', 1140, 496, 1102, 496, '분류·긴급도 값', 'pin'],
    ],
  },
  {
    in: 'sheets-blank.raw.png',
    out: 'sheets-blank.png',
    title: 'Sheets 새 문서 생성',
    compactLabels: true,
    hideTitle: true,
    cropTop: 0,
    cropBottom: 0,
    redact: [],
    callouts: [
      ['1', 45, 165, 102, 23, 'A1 선택'],
      ['2', 1250, 70, 1329, 30, '공유 상태', 'pin'],
    ],
  },
  {
    in: 'appscript-run-log.raw.png',
    out: 'appscript-run-log.png',
    title: 'Apps Script 실행 로그',
    compactLabels: true,
    hideTitle: true,
    cropTop: 0,
    cropBottom: 0,
    redact: [],
    callouts: [
      ['1', 390, 120, 440, 84, '실행', 'pin'],
      ['2', 560, 120, 598, 85, '함수 선택', 'pin'],
      ['3', 430, 715, 991, 664, '실행 로그 확인', 'pin'],
    ],
  },
  {
    in: 'notebooklm-source-dialog.raw.png',
    out: 'notebooklm-source-dialog.png',
    title: 'NotebookLM 복사 텍스트 소스 추가',
    compactLabels: true,
    cropTop: 0,
    cropBottom: 0,
    redact: [],
    callouts: [
      ['1', 520, 380, 758, 459, '텍스트 붙여넣기', 'pin'],
      ['2', 909, 632, 72, 40, '삽입'],
    ],
  },
  {
    in: 'notebooklm-summary.raw.png',
    out: 'notebooklm-summary.png',
    title: 'NotebookLM 소스 요약 확인',
    compactLabels: true,
    // The actual NotebookLM title sits in the top-left corner. The generic
    // overlay title covered it, so this verified walkthrough keeps the app UI
    // unobstructed and relies on the slide heading for context.
    hideTitle: true,
    cropTop: 0,
    cropBottom: 0,
    redact: [],
    callouts: [
      ['1', 54, 370, 125, 336, '소스 선택', 'pin'],
      ['2', 390, 420, 442, 305, '근거 기반 요약', 'pin'],
      ['3', 1110, 150, 1218, 150, 'Studio 산출물', 'pin'],
    ],
  },
  {
    in: 'datastudio-home.raw.png',
    out: 'datastudio-home.png',
    title: 'Data Studio 홈',
    compactLabels: true,
    hideTitle: true,
    cropTop: 0,
    cropBottom: 0,
    redact: [],
    callouts: [
      ['1', 11, 91, 125, 48, '만들기'],
      ['2', 303, 120, 352, 65, '보고서 만들기'],
      ['3', 671, 120, 352, 65, '데이터로 채팅'],
    ],
  },
  {
    in: 'datastudio-report.raw.png',
    out: 'datastudio-report.png',
    title: 'Data Studio Google Sheets 연결 화면',
    compactLabels: true,
    hideTitle: true,
    cropTop: 0,
    cropBottom: 0,
    redact: [],
    callouts: [
      ['1', 1480, 320, 736, 260, '데이터 추가 패널', 'pin'],
      ['2', 72, 368, 684, 48, '검색'],
      ['3', 72, 660, 330, 128, 'Google Sheets'],
    ],
  },
  {
    in: 'datastudio-setup.raw.png',
    out: 'datastudio-setup.png',
    title: 'Data Studio 계정 1회 설정',
    compactLabels: true,
    hideTitle: true,
    cropTop: 0,
    cropBottom: 0,
    redact: [],
    callouts: [
      ['1', 303, 120, 352, 65, '홈 진입 확인'],
      ['2', 1348, 92, 1424, 32, '환경설정', 'pin'],
      ['3', 1432, 92, 1472, 32, '계정 확인', 'pin'],
    ],
  },
]

function svgOverlay({ width, height, recipe, scale }) {
  const offsetY = recipe.offsetY ?? 0
  const redactions = (recipe.redact ?? [])
    .map(([x, y, w, h]) => `<rect x="${x * scale}" y="${Math.max(0, y - offsetY) * scale}" width="${w * scale}" height="${h * scale}" rx="12" fill="#111827" opacity="0.92"/>`)
    .join('')

  const callouts = (recipe.callouts ?? [])
    .map(([n, x, y, w, h, label, mode = 'box']) => {
      const sx = x * scale
      const sy = Math.max(0, y - offsetY) * scale
      if (mode === 'pin') {
        const tx = w * scale
        const ty = Math.max(0, h - offsetY) * scale
        const badge = 34
        const ring = 10
        const dx = tx - sx
        const dy = ty - sy
        const endX = sx + dx * 0.82
        const endY = sy + dy * 0.82
        return `
          <line x1="${sx}" y1="${sy}" x2="${endX}" y2="${endY}" stroke="#60a5fa" stroke-width="4" stroke-linecap="round" opacity="0.95"/>
          <circle cx="${tx}" cy="${ty}" r="${ring}" fill="#0f172a" stroke="#60a5fa" stroke-width="4"/>
          <circle cx="${sx}" cy="${sy}" r="${badge / 2}" fill="#2563eb"/>
          <text x="${sx}" y="${sy + 10}" text-anchor="middle" font-size="25" font-weight="800" fill="#fff" font-family="Arial">${n}</text>
        `
      }
      const sw = w * scale
      const sh = h * scale
      const badge = 42
      const badgeX = Math.min(Math.max(sx + 10, badge / 2 + 2), width - badge / 2 - 2)
      const badgeY = Math.min(Math.max(sy + 10, badge / 2 + 2), height - badge / 2 - 2)
      const labelY = sy < 74 ? 86 : Math.max(8, sy - 30)
      const labelMarkup = recipe.compactLabels ? '' : `
        <rect x="${sx + 42}" y="${labelY}" width="${Math.max(170, label.length * 22)}" height="44" rx="22" fill="#2563eb"/>
        <text x="${sx + 62}" y="${labelY + 30}" font-size="24" font-weight="700" fill="#fff" font-family="Arial">${label}</text>`
      return `
        <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="18" fill="none" stroke="#3b82f6" stroke-width="7"/>
        <circle cx="${badgeX}" cy="${badgeY}" r="${badge / 2}" fill="#2563eb"/>
        <text x="${badgeX}" y="${badgeY + 11}" text-anchor="middle" font-size="28" font-weight="800" fill="#fff" font-family="Arial">${n}</text>
        ${labelMarkup}
      `
    })
    .join('')

  const titleMarkup = recipe.hideTitle ? '' : `
      <rect x="24" y="24" width="${Math.min(900, recipe.title.length * 28 + 56)}" height="56" rx="28" fill="#111827" opacity="0.86"/>
      <text x="56" y="62" font-size="30" font-weight="800" fill="#fff" font-family="Arial">${recipe.title}</text>`

  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${redactions}
      ${titleMarkup}
      ${callouts}
    </svg>
  `)
}

await fs.mkdir(dir, { recursive: true })

for (const recipe of recipes) {
  const input = path.join(dir, recipe.in)
  const output = path.join(dir, recipe.out)
  const metadata = await sharp(input).metadata()
  const cropTop = recipe.cropTop ?? 320
  const cropBottom = recipe.cropBottom ?? 260
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
