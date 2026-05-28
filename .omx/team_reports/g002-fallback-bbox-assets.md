# G002 Fallback BBox Walkthrough Assets

- Worker: `worker-2`
- Task: `6` (`G002 fallback bbox walkthrough asset generation`)
- Date checked: 2026-05-28 KST
- Scope guard: script/assets/report only; no `slides.md`, `components/CopyBlock.vue`, or `.omx/ultragoal` edits; no logged-in Google state; no real company data.

## Outcome

Created a reproducible local Playwright fallback asset generator for the request-intake story that G002 identified as missing from the current deck. The script renders synthetic local HTML mock screens for Forms, Gmail draft, Calendar event draft, and Drive folder/share, measures actual DOM bounding boxes with Playwright, then draws bbox overlays into annotated PNGs.

These are explicitly **synthetic fallback assets**, not real Google product screenshots. They are safe to use as temporary teaching placeholders or as bbox/callout references until an instructor sandbox Google account can recapture live UI.

## Added script

| Path | Purpose |
|---|---|
| `scripts/generate-request-intake-fallback-bboxes.mjs` | Launches headless Chromium via `playwright-chromium`, renders local mock screens, reads `[data-bbox]` element boxes, writes raw and annotated PNGs, and emits a generated bbox log. |

Run command:

```bash
node scripts/generate-request-intake-fallback-bboxes.mjs
```

No network, cookies, Google account, Gmail send, Calendar save, Drive share, or Forms creation is used.

## Generated assets

| Screen | Raw | Annotated | BBox count |
|---|---|---|---:|
| Forms request intake | `public/walkthroughs/request-intake-forms.raw.png` | `public/walkthroughs/request-intake-forms.png` | 5 |
| Gmail draft reply | `public/walkthroughs/request-intake-gmail-draft.raw.png` | `public/walkthroughs/request-intake-gmail-draft.png` | 5 |
| Calendar schedule draft | `public/walkthroughs/request-intake-calendar.raw.png` | `public/walkthroughs/request-intake-calendar.png` | 5 |
| Drive folder/share boundary | `public/walkthroughs/request-intake-drive.raw.png` | `public/walkthroughs/request-intake-drive.png` | 8 |
| Generated bbox log | — | `google-workspace-gemini/.omx/team_reports/g002-fallback-bbox-assets.generated.md` | 23 total |

All generated PNGs are `1512x895`, matching the existing raw screenshot viewport convention used by the current walkthrough pipeline.

## Synthetic data used

```txt
Request ID: REQ-001
Requester email: trainee@example.com
Request title: VPN 접속 오류 · 오늘 오후 고객 미팅
Request type: IT지원
Due date: 2026-06-01
Drive folder: REQ-001_VPN_지원_합성데이터
Calendar title: [실습] REQ-001 VPN 지원 확인
Gmail draft subject: [실습] REQ-001 접수 확인
```

## Selector / bbox strategy

Each mock screen uses explicit `data-bbox` markers on the teaching targets. The generator then calls:

```js
page.locator('[data-bbox]').evaluateAll((nodes) => nodes.map((node) => {
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
```

This keeps the fallback assets honest: callouts are based on measured DOM geometry, not hand-drawn coordinates.

## BBox targets by screen

### Forms request intake

- `응답 탭`
- `양식 제목`
- `요청자 이메일 질문`
- `질문 추가`
- `Sheets 연결`

### Gmail draft reply

- `임시보관함 라벨`
- `수신자`
- `Draft subject`
- `Draft body`
- `Send button - do not click`

### Calendar schedule draft

- `Create event`
- `일정 제목`
- `일시`
- `참석자`
- `저장 버튼 - sandbox only`

### Drive folder/share boundary

- `New > Folder`
- `Synthetic folder name`
- `공유 버튼`
- `Share dialog`
- `사용자 추가`
- `권한 상태`
- `Role dropdown`
- `Copy link - internal only`

## Limitations

1. These are not real Google UI screenshots. They should be labeled as fallback/synthetic if inserted into slides.
2. They are useful for narrative continuity and bbox/callout planning, not for proving exact current Google UI chrome.
3. Final production deck should still prefer live recapture from a clean instructor sandbox account, using the selectors and mutation boundaries documented in `g002-bbox-gap-closure.md`.
4. `pnpm run process:walkthroughs` is not required for these new images because the generator already draws the bbox overlays directly. The existing processor does not yet include recipes for `request-intake-*` files.

## Verification evidence

- PASS — mailbox message `5b5ea290-16b8-41b0-8549-64677bbfaf53` marked delivered.
- PASS — task `6` claimed by `worker-2` with claim token from team API.
- PASS — `node scripts/generate-request-intake-fallback-bboxes.mjs` exited `0` and generated raw + annotated PNGs plus `g002-fallback-bbox-assets.generated.md`.
- PASS — PNG dimension audit: all 8 generated PNGs are `1512x895`.
- PASS — visual spot-check: opened `request-intake-forms.png`; overlay boxes align to the synthetic DOM targets and the legend no longer obscures the key form content.
- PASS — `pnpm run build` exited `0`; known Rolldown `INVALID_ANNOTATION` warnings from `@vueuse/core` remain non-blocking and pre-existing for this deck.

## Stop condition

Task 6 scope is satisfied when this report, the generator script, generated bbox log, and generated request-intake assets are committed and task lifecycle is transitioned complete.
