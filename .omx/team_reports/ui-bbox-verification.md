# UI Verification and Playwright BBox Asset Plan

- Worker: `worker-2`
- Task: `3` (`UI verification and Playwright bbox asset report`)
- Date checked: 2026-05-28 KST
- Output path: `google-workspace-gemini/.omx/team_reports/ui-bbox-verification.md`
- Scope guard: synthetic data only; no `.omx/ultragoal` mutation; no real company data; no authenticated Google account mutation during this task.

## Executive result

The deck already has a usable Playwright/DOM-bbox walkthrough pipeline for the Day 1 hands-on screens. The strongest assets are the paired raw/annotated images under `public/walkthroughs/` plus bbox logs under `.omx/reports/` for Gemini, NotebookLM, Sheets, Apps Script, and Data Studio. I did **not** run the authenticated capture scripts because they create/open Google-owned assets (`spreadsheets/create`, Apps Script project create, Data Studio report create). Instead, I ran a safe unauthenticated Playwright entry-point check and regenerated local annotations from existing raw screenshots.

Recommended next implementation step: keep the existing screenshots for the current deck, but before final PDF export run the capture scripts once from an instructor-owned logged-in Chrome profile, then immediately run `pnpm run process:walkthroughs`, visual spot-check the annotated PNGs, and run `pnpm run build`/`pnpm run export`.

## Official/current source links

| Area | Source | What it confirms for the deck |
|---|---|---|
| Gemini web app | https://support.google.com/gemini/answer/14886647?hl=en | Google documents `gemini.google.com` as the Gemini web app target and notes browser/account requirements. |
| NotebookLM notebook flow | https://support.google.com/notebooklm/answer/16206563?hl=en | NotebookLM notebooks are source collections; first-notebook flow is open NotebookLM → create notebook → upload/add source → use Chat and Studio panels. |
| Apps Script overview | https://developers.google.com/apps-script | Apps Script is a cloud JavaScript platform for automating/integrating Google products; dashboard link is `script.google.com`. |
| Data Studio from Sheets | https://docs.cloud.google.com/data-studio/create-a-report-from-google-sheets | Current docs say Looker Studio is now Data Studio; Sheets can create a Data Studio report; page last updated 2026-05-27 UTC. |
| Data Studio connectors | https://docs.cloud.google.com/data-studio/available-connectors | Current docs list Google Sheets under Spreadsheet/CSV/extracted-data connectors; page last updated 2026-05-27 UTC. |
| Data Studio connector gallery | https://lookerstudio.google.com/data?hl=en | Public URL now redirects to `datastudio.google.com/data?hl=en` and shows Data Studio connector gallery language. |

## Existing scripts and artifact map

| File/path | Role | Safety/verification note |
|---|---|---|
| `scripts/capture-dom-bbox-walkthroughs.mjs` | CDP/Playwright capture for Gemini and NotebookLM. Writes raw screenshots and `.omx/reports/dom-bbox-walkthroughs.md`. | Requires logged-in Chrome over CDP. Uses synthetic prompt and synthetic NotebookLM source, but can create/modify NotebookLM state; run only on instructor sandbox account. |
| `scripts/capture-after-notebook-bboxes.mjs` | CDP/Playwright capture for Sheets, Apps Script, Data Studio. Writes raw screenshots and `.omx/reports/after-notebook-dom-bboxes.md`. | Mutates account state by creating a spreadsheet, Apps Script project, and Data Studio report/editor state. Safe only on throwaway/instructor account. |
| `scripts/process-walkthroughs.mjs` | Local Sharp processor. Converts `*.raw.png` into annotated `*.png` with callout boxes/pins. | Safe local-only step. Re-run in this task: PASS. |
| `.omx/reports/dom-bbox-walkthroughs.md` | Existing bbox log for Gemini + NotebookLM. | Contains exact box centers and notes about sticky Gemini composer cropping. |
| `.omx/reports/after-notebook-dom-bboxes.md` | Existing bbox log for Sheets + Apps Script + Data Studio. | Documents canvas-derived Sheets A1 coordinate and Data Studio configured-account state. |
| `public/walkthroughs/*.raw.png` | Raw source screenshots. | Current raw dimensions are consistently `1512x895` for bbox-authored assets. |
| `public/walkthroughs/*.png` | Annotated slide-facing screenshots. | Current annotated dimensions are mostly `1600x947`; `gemini-result.png` is `1600x799` due sticky-composer crop. |

## Slide coverage and asset status

Local audit found `12` `<PublicImage>` references in `slides.md`, `9` of them under `walkthroughs/`, with `0` missing files.

| Slide section | `PublicImage` asset | Current status | Notes |
|---|---|---|---|
| Gemini 실습 1: 업무 요청 분류 | `public/walkthroughs/gemini-home.png` | Present | DOM bbox report maps prompt input, Flash mode, upload/tools. |
| Gemini 실습 1 결과 확인 | `public/walkthroughs/gemini-result.png` | Present | Result image is intentionally cropped at bottom to avoid sticky prompt composer covering the answer table. |
| NotebookLM 실습 3: 사내 규정 소스 추가 | `public/walkthroughs/notebooklm-source-dialog.png` | Present | Synthetic copied-text source is used; no real documents. |
| NotebookLM 실습 3 결과 확인 | `public/walkthroughs/notebooklm-summary.png` | Present | Existing note says overlay title was hidden so NotebookLM title is not obstructed. |
| Sheets 실습 2: 분석 테이블 만들기 | `public/walkthroughs/sheets-blank.png` | Present | A1 coordinate is derived from canvas bbox because Sheets grid cells are canvas-rendered. |
| Apps Script 실습 4: 권한 없는 로그 실행 | `public/walkthroughs/appscript-run-log.png` | Present | Uses no-auth `console.log` function; good classroom-safe first Apps Script step. |
| Data Studio 계정 1회 설정 | `public/walkthroughs/datastudio-setup.png` | Present | Captures already-configured account path; slide text correctly explains first-run setup may differ. |
| Data Studio 실습 5: 보고서 만들기 진입 | `public/walkthroughs/datastudio-home.png` | Present | Current public endpoint redirects toward Data Studio branding. |
| Data Studio 실습 5: Google Sheets 연결 | `public/walkthroughs/datastudio-report.png` | Present | Aligned with current docs that Google Sheets is an available Data Studio connector. |

## Safe Playwright entry-point verification

I used a fresh unauthenticated Playwright Chromium context. This verifies service entry URLs without reading cookies, personal sessions, or company data.

| Target | Requested URL | Observed final URL/title | Result |
|---|---|---|---|
| Gemini | `https://gemini.google.com/app` | `https://gemini.google.com/app`, title `Google Gemini` | PASS — public/unauth app shell reachable. |
| NotebookLM | `https://notebooklm.google.com/` | Google account sign-in page | PASS — service entry redirects to sign-in as expected. |
| Sheets create | `https://docs.google.com/spreadsheets/create` | Google Sheets sign-in page | PASS — create endpoint requires sign-in as expected. |
| Apps Script create | `https://script.google.com/home/projects/create` | Redirected to `https://developers.google.com/apps-script?hl=ko` unauthenticated | PASS WITH NOTE — logged-out create URL does not expose editor; authenticated CDP capture remains required for bbox. |
| Data Studio reporting | `https://lookerstudio.google.com/navigation/reporting` | `https://datastudio.google.com/overview`, title `Data Studio Overview` | PASS — entry now reflects Data Studio branding. |
| Data Studio connectors | `https://lookerstudio.google.com/data` | `https://datastudio.google.com/data`, title `Data Studio Connect to Data` | PASS — connector gallery endpoint works and redirects to Data Studio. |

## Gaps and risks

1. **Authenticated capture scripts are stateful.** `capture-after-notebook-bboxes.mjs` can create real Google assets. Keep it out of automated CI and run only against a dedicated instructor/sandbox account.
2. **Google UI labels drift.** The scripts already use tolerant Korean/English locator patterns, but Gemini/NotebookLM/Data Studio labels can change by locale, account feature flag, model availability, or window size.
3. **Sheets cell coordinates are inferred.** Sheets grid is canvas-rendered, so A1 is derived from the canvas box rather than a stable DOM node. This is acceptable for screenshot callouts but should be rechecked visually before export.
4. **Data Studio naming changed recently.** Current Google Cloud docs now say Looker Studio is Data Studio. Existing deck wording is directionally correct; keep source links in speaker notes/report for instructor confidence.
5. **Raw screenshots may contain account chrome.** Existing screenshots appear course-safe, but any future recapture should use a clean browser profile and avoid personal bookmarks, account names, customer files, and real data.
6. **Pre-existing untracked `.omx/reports/` exists in the nested repo.** I did not stage that directory from this task because it appears pre-existing and could contain other workers' artifacts.

## Implementation map for final PDF readiness

| Step | Command/action | Expected evidence |
|---|---|---|
| 1. Confirm clean profile | Open instructor sandbox Chrome profile with synthetic-only account. | No real company/customer data visible. |
| 2. Start CDP Chrome | Launch Chrome with `--remote-debugging-port=9222` for that sandbox profile. | `CDP_ENDPOINT=http://127.0.0.1:9222` reachable. |
| 3. Capture Gemini/NotebookLM | `CDP_ENDPOINT=http://127.0.0.1:9222 node scripts/capture-dom-bbox-walkthroughs.mjs` | Updates `public/walkthroughs/gemini-*.raw.png`, `notebooklm-*.raw.png`, `.omx/reports/dom-bbox-walkthroughs.md`. |
| 4. Capture Sheets/Apps Script/Data Studio | `CDP_ENDPOINT=http://127.0.0.1:9222 node scripts/capture-after-notebook-bboxes.mjs` | Updates `sheets-blank.raw.png`, `appscript-run-log.raw.png`, `datastudio-*.raw.png`, `.omx/reports/after-notebook-dom-bboxes.md`. |
| 5. Annotate screenshots | `pnpm run process:walkthroughs` | Annotated `public/walkthroughs/*.png` regenerated. |
| 6. Spot-check images | Open/view `gemini-result.png`, `notebooklm-summary.png`, `sheets-blank.png`, `appscript-run-log.png`, `datastudio-report.png`. | No callout covers key text/table; buttons are boxed or pinned accurately. |
| 7. Build/export | `pnpm run build`; if browser tooling available, `pnpm run export`. | `dist/` and final PDF generated; warnings documented if dependency-only. |

## Verification evidence from this task

- PASS — mailbox delivery: `omx team api mailbox-mark-delivered` for message `e46e4628-a698-4d08-b941-70a9d92f8d89` returned `updated:true`.
- PASS — task claim: `omx team api claim-task task_id=3 worker=worker-2 expected_version=1` returned `ok:true`, task status `in_progress`, claim owner `worker-2`.
- PASS — local annotation generation: `pnpm run process:walkthroughs` exited `0`.
- PASS — unauthenticated Playwright entry check: all six target service URLs loaded to a service shell, sign-in page, official developer page, or Data Studio redirect; no authenticated profile or real data was used.
- PASS — asset path audit: `PublicImage refs=12`, `walkthroughRefs=9`, `missing=[]`.
- PASS — walkthrough image dimension audit: key bbox-authored raw images are `1512x895`; annotated images regenerated at expected slide-facing dimensions (`1600x947`, except cropped `gemini-result.png` at `1600x799`).
- SKIP — `tsc --noEmit`: no `tsconfig.json` in this Slidev deck.
- SKIP — lint/test scripts: `package.json` defines `build`, `build:pages`, `dev`, `process:walkthroughs`, and `export`, but no `lint` or `test` scripts.

## Bottom line

The current UI walkthrough assets are adequate for the deck's Day 1 flow, and the bbox pipeline is documented enough to refresh them. The only unsafe part is automatic recapture against a real Google account; treat recapture as an instructor-sandbox operation, not CI, and preserve the local-only `process:walkthroughs` step as the repeatable asset-generation boundary.

---

## Worker-1 Task 2 addendum — safe entry verification and request-intake asset gap

- Date checked: 2026-05-28 KST
- Scope: added safe public-entry verification and missing request-intake bbox asset plan; no authenticated Google account mutation and no real data.

### Headless public-entry verification

Ran a Playwright smoke check without login or data entry.

| Service | URL checked | Result | Interpretation |
|---|---|---|---|
| Gemini app | `https://gemini.google.com/app` | HTTP 200; `Google Gemini`; public/sign-in shell visible. | Safe shell check; prompt capture still needs sandbox login. |
| NotebookLM | `https://notebooklm.google.com/` | Redirected to Google Accounts sign-in. | Boundary only without login. |
| Google Forms | `https://forms.google.com/` | Redirected to Google Forms sign-in. | Form-builder capture requires sandbox login. |
| Sheets create | `https://docs.google.com/spreadsheets/create` | Redirected to Google Sheets sign-in. | Sheet capture requires sandbox login. |
| Apps Script create | `https://script.google.com/home/projects/create` | Public/logged-out context reached Apps Script developer page. | Editor capture requires sandbox login; docs page is safe fallback. |
| Data Studio reporting | `https://lookerstudio.google.com/navigation/reporting` | Redirected to `https://datastudio.google.com/overview`; title `Data Studio Overview`. | Public overview safe; report editor capture requires sandbox login. |

### Remaining request-intake asset gap

Current Gemini / NotebookLM / Sheets / Apps Script / Data Studio walkthrough coverage is already usable. The missing synthetic workflow assets are:

1. `public/walkthroughs/forms-request-intake.raw.png` → `forms-request-intake.png`
2. `public/walkthroughs/forms-response-sheet-link.raw.png` → `forms-response-sheet-link.png`
3. `public/walkthroughs/gmail-draft-confirmation.raw.png` → `gmail-draft-confirmation.png`
4. `public/walkthroughs/calendar-event-draft.raw.png` → `calendar-event-draft.png`
5. `public/walkthroughs/drive-folder-share-dialog.raw.png` → `drive-folder-share-dialog.png`
6. Optional bridge: `appscript-trigger-onformsubmit.*` and `sheets-form-responses-row.*`

Recommended future files: `scripts/capture-request-intake-bboxes.mjs` and `.omx/reports/request-intake-dom-bboxes.md`.

### Capture guardrails

- Use synthetic `REQ-001~REQ-006` data only.
- Prefer Gmail draft evidence; never send mail.
- Do not share real Drive folders or create production Calendar events.
- Redact account names, bookmarks, real files, and document titles before committing screenshots.
- Run `pnpm run process:walkthroughs`, `pnpm run build`, and `pnpm run export` after any asset update.
