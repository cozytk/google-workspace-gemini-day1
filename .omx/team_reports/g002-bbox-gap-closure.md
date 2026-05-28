# G002 Screenshot/BBox Gap Closure Report

- Worker: `worker-2`
- Task: `5` (`G002 follow-up: screenshot/bbox gap closure`)
- Date checked: 2026-05-28 KST
- Output path: `google-workspace-gemini/.omx/team_reports/g002-bbox-gap-closure.md`
- Scope guard: no `.omx/ultragoal` edits; no real company data; do not send real mail, share real Drive files, or create production Calendar events.

## Executive result

G002 has a real screenshot/bbox gap around the **request intake and follow-up workflow**. The deck now teaches the common story “Form/Gmail request → Sheet → Gmail draft → Calendar/Drive follow-up,” but the only current walkthrough images cover Gemini, NotebookLM, Sheets, Apps Script, and Data Studio. There are **zero** current `PublicImage` references or `public/walkthroughs/` files whose names map to Forms, Gmail, Calendar, Drive, request, or intake.

Because reliable capture for Forms/Gmail/Calendar/Drive requires a logged-in Workspace account and can create account state, I did not create new live screenshots in this worker run. The safe closure is a concrete recapture plan below: exact missing assets, exact Playwright locator strategy, synthetic data, mutation boundaries, and fallback screenshots if a live Google UI changes.

## Current deck evidence

| Deck area | Current content | Screenshot status |
|---|---|---|
| `Day 1 > 실습 운영 > 공통 시나리오` | “Form 또는 Gmail로 요청이 들어온다” and final evidence band: Sheet, Gmail draft, Calendar/Drive follow-up, Data Studio dashboard. | No request-intake screenshot. |
| `Day 1 > Apps Script > 서비스 소개` | Introduces Forms, Gmail, Calendar, Drive as request automation services. | Icon/card slide only; no UI walkthrough. |
| `Day 1 > Apps Script > Forms 준비` | Instructs `forms.new`, title/questions, response Sheet connection. | No Forms UI screenshot. |
| `Day 1 > Apps Script > 실습 1` | Shows Form → Sheet → Gmail draft pipeline and `createDraft` safety boundary. | No Gmail draft screenshot. |
| `Day 1 > Apps Script > 실습 3` | Describes Drive folder + Calendar event bot. | No Drive/Calendar UI screenshot. |

Local audit command result:

```txt
requestIntakeImageRefs: []
matchingWalkthroughFiles: []
```

## Official source links for the gap

| Area | Official source | Why it matters for the capture plan |
|---|---|---|
| Google Forms creation | https://support.google.com/docs/answer/6281888?hl=en | Official flow: go to Forms, create a blank form, name the form. |
| Forms responses to Sheets | https://support.google.com/docs/answer/2917686?hl=en-en | Official flow: open a form, go to Responses, select destination for responses, create/select spreadsheet. |
| Forms response management | https://support.google.com/docs/answer/139706?hl=en-en | Official flow includes viewing responses and exporting/viewing responses in Sheets. |
| Gmail draft safety | https://support.google.com/mail/answer/11930385?hl=en-EN | Official Gmail/Docs draft flow confirms preview/send boundary; deck should continue to avoid actual send by default. |
| Calendar event creation | https://support.google.com/calendar/answer/72143?hl=en-GB | Official flow: open Calendar, click Create, add title/details, Save. Capture should stop before Save unless sandbox account is approved. |
| Drive sharing | https://support.google.com/drive/answer/2494822?co=GENIE.Platform%3DDesktop&hl=en-en | Official sharing permissions: Viewer/Commenter/Editor and link sharing boundaries. |
| Drive folder sharing | https://support.google.com/drive/answer/7166529?co=GENIE.Platform%3DDesktop&hl=en-419 | Official folder sharing behavior: folder permissions apply to contained files/subfolders. |
| Drive upload/folder entry | https://support.google.com/drive/answer/2424368?co=GENIE.Platform%3DDesktop%2F&hl=en | Official entry point for Drive web app and New/File or Folder Upload actions. |

## Missing assets to add

Recommended filenames follow the existing convention: capture `*.raw.png`, then process to slide-facing `*.png`.

| Priority | Raw asset | Annotated asset | Slide target | Purpose |
|---:|---|---|---|---|
| 1 | `public/walkthroughs/forms-request-intake.raw.png` | `public/walkthroughs/forms-request-intake.png` | Forms 준비 | Show form title, first required fields, Add question, Responses tab. |
| 2 | `public/walkthroughs/forms-response-sheet-link.raw.png` | `public/walkthroughs/forms-response-sheet-link.png` | Forms 준비 or pipeline | Show Responses tab and Sheets link/destination. |
| 3 | `public/walkthroughs/gmail-draft-confirmation.raw.png` | `public/walkthroughs/gmail-draft-confirmation.png` | Form → Sheet → Gmail pipeline | Show draft subject/body and clearly mark “do not send” boundary. |
| 4 | `public/walkthroughs/calendar-event-draft.raw.png` | `public/walkthroughs/calendar-event-draft.png` | Drive · Calendar bot | Show event draft dialog with title/date/guest fields before Save. |
| 5 | `public/walkthroughs/drive-folder-share-dialog.raw.png` | `public/walkthroughs/drive-folder-share-dialog.png` | Drive · Calendar bot | Show synthetic request folder and share permissions dialog. |

Optional if time allows:

| Optional asset | Use |
|---|---|
| `public/walkthroughs/appscript-trigger-onformsubmit.png` | Visual proof of Apps Script installable trigger selection. |
| `public/walkthroughs/sheets-form-responses-row.png` | Visual bridge between Forms submission and Sheet row. |

## Synthetic data contract

Use only these synthetic values in screenshots and scripts:

```txt
Form title: 공용 요청함 자동화 실습
Request ID: REQ-001
Requester email: trainee@example.com
Request title: VPN 접속 오류 · 오늘 오후 고객 미팅
Request type: IT지원
Due date: 2026-06-01
Drive folder: REQ-001_VPN_지원_합성데이터
Calendar title: [실습] REQ-001 VPN 지원 확인
Gmail draft subject: [실습] REQ-001 접수 확인
```

Do not type real names, real company domains, customer names, or live Drive file names.

## Playwright/CDP selector plan

The existing `capture-dom-bbox-walkthroughs.mjs` and `capture-after-notebook-bboxes.mjs` use logged-in Chrome over CDP, viewport `1512x895`, and tolerant Korean/English locator patterns. Use the same approach for a new capture script such as `scripts/capture-request-intake-bboxes.mjs`, but run it only on an instructor sandbox profile.

### Forms: request intake screen

Entry:

```js
const forms = await pageMatching(/docs\.google\.com\/forms|forms\.gle|forms\.new/, 'https://forms.new')
```

Primary locators:

```js
forms.getByRole('textbox', { name: /Untitled form|제목 없는 양식|Form title|양식 제목/i })
forms.getByRole('textbox', { name: /Untitled Question|제목 없는 질문|Question|질문/i })
forms.getByRole('button', { name: /Add question|질문 추가|추가/i })
forms.getByRole('tab', { name: /Responses|응답/i })
forms.getByRole('button', { name: /Link to Sheets|View in Sheets|스프레드시트|Sheets/i })
```

Fallback locators:

```js
forms.locator('[contenteditable="true"]').nth(0) // form title
forms.locator('[contenteditable="true"]').nth(1) // first question
forms.locator('[aria-label*="응답"], [aria-label*="Responses"]').first()
forms.locator('[aria-label*="Sheets"], [data-tooltip*="Sheets"], [aria-label*="스프레드시트"]').first()
```

BBox targets:

| Label | Why |
|---|---|
| `양식 제목` | Learners know they are editing the request intake form. |
| `요청자 이메일 질문` | First structured intake field. |
| `질문 추가` | Shows repeatable field creation step. |
| `응답 탭` | Bridge to Sheet connection. |
| `Sheets 연결` | Completion evidence for linked response sheet. |

### Gmail: draft confirmation

Prefer capturing a draft created by Apps Script `GmailApp.createDraft`. If that is not available, open Gmail compose with synthetic values and capture before send.

Entry:

```js
const gmail = await pageMatching(/mail\.google\.com/, 'https://mail.google.com/mail/u/0/#drafts')
```

Primary locators:

```js
gmail.getByRole('button', { name: /Compose|편지쓰기|작성/i })
gmail.getByRole('textbox', { name: /Recipients|받는사람|To/i })
gmail.getByRole('textbox', { name: /Subject|제목/i })
gmail.locator('div[aria-label="Message Body"], div[aria-label="메일 본문"], div[role="textbox"]').last()
gmail.getByRole('button', { name: /^Send$|보내기/i })
```

Fallback locators:

```js
gmail.locator('textarea[name="to"], input[name="subjectbox"]').first()
gmail.locator('div[contenteditable="true"]').last()
gmail.locator('[aria-label*="Send"], [aria-label*="보내기"]').first()
```

BBox targets:

| Label | Why |
|---|---|
| `Draft subject` | Shows synthetic request ID and no real data. |
| `Draft body` | Shows confirmation/next-question content. |
| `Send button - do not click` | Makes safety boundary visible. |
| `Drafts label` | Shows completion evidence without sending. |

### Calendar: event draft

Do not save unless a sandbox account/calendar is explicitly approved. Capture the event creation dialog before Save.

Entry:

```js
const calendar = await pageMatching(/calendar\.google\.com/, 'https://calendar.google.com/calendar/u/0/r')
```

Primary locators:

```js
calendar.getByRole('button', { name: /Create|만들기/i })
calendar.getByRole('textbox', { name: /Add title|제목 추가|Title/i })
calendar.getByRole('textbox', { name: /Add guests|참석자 추가|Guests/i })
calendar.getByRole('button', { name: /^Save$|저장/i })
calendar.getByRole('button', { name: /Discard|취소|닫기/i })
```

Fallback locators:

```js
calendar.locator('[aria-label*="title" i], [aria-label*="제목"]').first()
calendar.locator('[aria-label*="guest" i], [aria-label*="참석자"]').first()
calendar.locator('[data-key="save"], [aria-label*="Save"], [aria-label*="저장"]').first()
```

BBox targets:

| Label | Why |
|---|---|
| `일정 제목` | Shows synthetic request follow-up event. |
| `일시` | Shows due-date translation into schedule. |
| `참석자` | Shows collaboration boundary. |
| `저장 버튼 - sandbox only` | Prevents accidental production mutation. |

### Drive: request folder share dialog

Do not share with external people during capture. Use a sandbox folder and capture permissions before applying changes.

Entry:

```js
const drive = await pageMatching(/drive\.google\.com/, 'https://drive.google.com/drive/my-drive')
```

Primary locators:

```js
drive.getByRole('button', { name: /New|새로 만들기|신규/i })
drive.getByRole('menuitem', { name: /Folder|폴더/i })
drive.getByRole('textbox', { name: /Folder name|폴더 이름|Name/i })
drive.getByRole('button', { name: /Share|공유/i })
drive.getByRole('button', { name: /Copy link|링크 복사|Get link/i })
drive.getByText(/Restricted|제한됨|Anyone with the link|링크가 있는 모든 사용자/i)
```

Fallback locators:

```js
drive.locator('[aria-label*="New"], [aria-label*="새로"]').first()
drive.locator('[aria-label*="Share"], [aria-label*="공유"]').first()
drive.locator('[aria-label*="Copy link"], [aria-label*="링크 복사"]').first()
drive.locator('text=/Restricted|제한됨|링크가 있는 모든 사용자/i').first()
```

BBox targets:

| Label | Why |
|---|---|
| `New > Folder` | Shows request folder creation path. |
| `Synthetic folder name` | Confirms no real project/customer data. |
| `Share dialog` | Shows permission control. |
| `Role dropdown` | Shows Viewer/Editor boundary. |
| `Copy link - internal only` | Shows link handling boundary. |

## Processing patch plan

After raw captures exist, extend `scripts/process-walkthroughs.mjs` with recipes like:

```js
{
  in: 'forms-request-intake.raw.png',
  out: 'forms-request-intake.png',
  title: 'Forms 요청 접수 화면',
  compactLabels: true,
  hideTitle: true,
  cropTop: 0,
  cropBottom: 0,
  redact: [],
  callouts: [
    ['1', 120, 170, 520, 70, '양식 제목'],
    ['2', 120, 330, 620, 90, '요청자 이메일 질문'],
    ['3', 1380, 350, 40, 40, '질문 추가', 'pin'],
    ['4', 610, 95, 90, 40, '응답 탭', 'pin'],
  ],
}
```

Keep coordinates authored against raw screenshots, matching current script behavior. Use `pin` mode for text-heavy areas so callouts do not hide form/draft content.

## Fallback if live capture is blocked

If login, Workspace policy, or UI drift blocks live capture, use these non-mutating alternatives:

1. **Forms fallback:** capture the public Google Forms creation help flow and a local synthetic wireframe card, but label it clearly as “UI 위치 예시 / 실제 계정에서 재캡처 필요.”
2. **Gmail fallback:** capture a local mock draft card rendered inside Slidev rather than Gmail. Keep the safety label “발송 금지 / draft only.”
3. **Calendar fallback:** capture event dialog before save; if Calendar blocks, use an in-slide synthetic event card with fields matching Calendar.
4. **Drive fallback:** capture Drive share permission help or a local synthetic permission matrix. Do not fabricate it as a real Drive screenshot.
5. **Instructor note:** mark fallback slides as “수업 전 샌드박스 계정에서 실제 화면으로 교체” in the report/PDF checklist.

## Suggested slide insertion points

| Insert after | Asset | Rationale |
|---|---|---|
| `Forms 실습: 요청 접수 화면 만들기` | `forms-request-intake.png`, optionally `forms-response-sheet-link.png` | This is where learners need UI clicks. |
| `Form → Sheet → Gmail 자동 답신 파이프라인` | `gmail-draft-confirmation.png` | Reinforces draft-only safety boundary. |
| `Drive · Calendar 일정/파일 관리 봇` | `calendar-event-draft.png` + `drive-folder-share-dialog.png` | Converts abstract bot stages into verifiable UI evidence. |

## Verification evidence from this task

- PASS — mailbox delivery: new message `143bdec4-0df9-4d8f-bc3c-7556d39e907c` marked delivered.
- PASS — task claim: `omx team api claim-task task_id=5 worker=worker-2 expected_version=1` returned `ok:true`, claim owner `worker-2`.
- PASS — current deck gap audit: no `PublicImage` refs and no `public/walkthroughs` files matched `forms|gmail|calendar|drive|request|intake`.
- PASS — current report reuse: read `ui-bbox-verification.md` and confirmed existing bbox pipeline and safety constraints.
- SKIP — live Forms/Gmail/Calendar/Drive capture: would require logged-in Google account and can create drafts/events/folders/forms; not safe in this worker run without sandbox-account authorization.

## Bottom line

For G002, the next useful screenshot work is not another Gemini/Sheets capture; it is the request-intake closure set: Forms intake, Forms-to-Sheets response link, Gmail draft confirmation, Calendar event draft, and Drive folder share dialog. The plan above gives exact filenames, selectors, callout intent, and fallbacks so a sandbox-account recapture can be done quickly without touching real data.
