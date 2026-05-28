# G001 Leader Research + Deck Audit

Ultragoal story: `G001-research-deck-audit-inspect-current`
Plan source: `.omx/ultragoal/goals.json` and `.omx/specs/deep-interview-google-workspace-gemini-lab-improvement.md`
Date: 2026-05-28

## Target outcome

Reframe Day 1 hands-on labs around a broad office-worker **customer/internal request intake** story. The deck should feel like one workflow rather than isolated Google-service demos.

## Official/current evidence seed

- Gemini in Workspace apps: Google describes Gemini as an AI assistant built into Docs, Sheets, Slides, Vids, Forms, and more; feature availability depends on eligible Workspace/AI plans.
  Source: https://support.google.com/docs/answer/15123226
- Gemini in Forms can help create a form from a prompt or Drive files, but availability is plan/rollout dependent and desktop-oriented.
  Source: https://support.google.com/docs/answer/16346789
- NotebookLM can work from user-provided sources such as PDFs, websites, YouTube videos, audio, Google Docs, and Slides.
  Source: https://support.google.com/notebooklm/answer/16164461
- NotebookLM source behavior/constraints should be explained before asking learners to upload or paste sources.
  Source: https://support.google.com/notebooklm/answer/16215270
- Apps Script is the Google cloud JavaScript automation surface for integrating Google products.
  Source: https://developers.google.com/apps-script
- Apps Script simple/installable triggers support event-driven automation; installable triggers can handle form submit and time-driven cases but run with the creator account and have restrictions/quotas.
  Sources: https://developers.google.com/apps-script/guides/triggers/ and https://developers.google.com/apps-script/guides/triggers/installable
- GmailApp, CalendarApp, and DriveApp are the relevant Apps Script service surfaces for draft/response, scheduling, and file organization prototypes.
  Sources: https://developers.google.com/apps-script/reference/gmail/gmail-app, https://developers.google.com/apps-script/reference/calendar, https://developers.google.com/apps-script/reference/drive
- Looker Studio/Data Studio turns connected data into shareable reports/dashboards and supports Google Sheets data connections.
  Sources: https://docs.cloud.google.com/looker/docs/studio and https://docs.cloud.google.com/looker/docs/studio/connect-to-google-sheets

## Current deck audit

- `google-workspace-gemini/slides.md` currently has 76 slides.
- Existing screenshot assets already cover Gemini, NotebookLM, Sheets, Apps Script, and Data Studio in `public/walkthroughs/` and `public/screenshots/`.
- Existing bbox/callout infrastructure exists:
  - `scripts/process-walkthroughs.mjs`
  - `scripts/capture-dom-bbox-walkthroughs.mjs`
  - `scripts/capture-after-notebook-bboxes.mjs`
  - reports under `google-workspace-gemini/.omx/reports/*bbox*.md`
- The deck already contains some request-processing content: Gemini request classification, Sheets table, Form → Sheet → Gmail draft, Drive/Calendar bot, and Data Studio dashboard.
- Main gap: the story is not consistently introduced as one relatable **request intake operating system**, and several service sections still read like tool demos rather than a connected learner journey.
- Main service-introduction gap: Gmail/Calendar/Drive and Forms appear as workflow components but need compact “what this service does in this lab” intro/debrief before hands-on actions.
- Main followability gap: screenshot slides exist but not every lab has button-by-button text with URL, click target, input text, expected result, and fallback.

## Synthetic request dataset proposal

Use 6 synthetic request records; never use real company data.

| ID | Channel | Request type | Example subject | Urgency | Owner | Target service step |
|---|---|---|---|---|---|---|
| REQ-001 | Google Form | IT help | 노트북 VPN 접속 오류 | High | IT지원 | Forms → Sheets → Gemini 분류 |
| REQ-002 | Gmail | 구매 문의 | 팀 공용 모니터 구매 가능 여부 | Medium | 총무/구매 | Gemini 답장 초안 → Gmail draft |
| REQ-003 | Google Form | 인사/총무 | 재직증명서 발급 요청 | Low | HR | Apps Script 자동 접수 |
| REQ-004 | Gmail | 고객 문의 | 세금계산서 재발행 요청 | Medium | 회계 | NotebookLM 정책 근거 확인 |
| REQ-005 | Google Form | 일정 요청 | 신규 입사자 OT 일정 조율 | Medium | HR | Calendar event 후보 |
| REQ-006 | Gmail | 파일 요청 | 프로젝트 자료 폴더 공유 요청 | Low | PMO | Drive folder/link 안내 |

## Implementation map

1. Add a request-intake map slide near the Day 1 overview: incoming request → classify → ground in policy → record → automate → respond/schedule/file → dashboard.
2. Rename or reframe lab slides so they are numbered by the request-intake journey, not by service alone.
3. Add first-use service cards for Forms, Gmail, Calendar, Drive, and Looker/Data Studio where missing.
4. Expand each screenshot walkthrough into: starting URL/surface, exact click target, input text, expected result, and fallback.
5. Prefer existing bbox assets when correct; retake or regenerate only when current image lacks a visible target or no longer matches current UI.
6. Keep the deck’s Paperlogy/Slidev design and breadcrumb rules. Avoid a broad redesign.

## Stop condition for G001

G001 is complete when this leader audit plus team reports identify sources, slide gaps, synthetic dataset, and implementation order. G002/G003 can then use this map for assets and deck rewrite.
