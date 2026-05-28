# Request-intake research audit

- Worker: `worker-1`
- Task: `2` / lane 1
- Date: 2026-05-28 KST
- Scope: source links, slide gaps, and implementation map for a synthetic request-intake storyline. No real company data used.

## Target storyline

Reframe Day 1 as one office-worker workflow:

`Form/Gmail request → Gemini classify/summarize/draft → NotebookLM source-grounded answer → Sheets/Forms record → Apps Script follow-up → Gmail/Calendar/Drive action → Data Studio status/KPI → Day 2 Agent PRD`.

## Official/current sources to cite

| Area | Source | Use in deck |
|---|---|---|
| Workspace with Gemini surfaces | https://support.google.com/docs/answer/15123226 | Gemini support across Docs, Sheets, Slides, Vids, Forms; availability/plan caveats. |
| Forms + Gemini | https://support.google.com/docs/answer/16346789 | Forms “help me create a form” availability and desktop/rollout caveat. |
| Gemini app Workspace connection | https://support.google.com/gemini/answer/15229592 | Gemini app can connect with Workspace apps when enabled; useful for entry-point slide. |
| Workspace Gemini privacy | https://support.google.com/mail/answer/14615114 | Privacy/data-use caution for workplace training. |
| Gmail + Gemini | https://support.google.com/mail/answer/14355636 | Summaries, draft replies, Drive/email info lookup, Calendar event support/caveats. |
| Sheets + Gemini | https://support.google.com/docs/answer/14356410 | Sheets AI analysis/formulas/charts/pivots and current feature framing. |
| Sheets AI function | https://support.google.com/docs/answer/15877199 | Check whether to teach `AI(prompt, [range])` instead of or alongside `=GEMINI()`. |
| NotebookLM overview | https://support.google.com/notebooklm/answer/16164461 | Source-grounded assistant, source types, citations. |
| NotebookLM source behavior | https://support.google.com/notebooklm/answer/16215270 | Source limits/static copies/sync behavior; add fallback/caution. |
| NotebookLM chat/citations | https://support.google.com/notebooklm/answer/16179559 | Expected result for source-grounded answers. |
| Apps Script overview | https://developers.google.com/apps-script | Explain Apps Script as Google Workspace automation platform. |
| Apps Script triggers | https://developers.google.com/apps-script/guides/triggers and https://developers.google.com/apps-script/guides/triggers/installable | `onFormSubmit`, time-driven triggers, account/permission restrictions. |
| Apps Script Gmail/Calendar/Drive services | https://developers.google.com/apps-script/reference/gmail/gmail-app, https://developers.google.com/apps-script/reference/calendar/calendar-app, https://developers.google.com/apps-script/reference/drive/drive-app | Draft email, event, and Drive folder/link automation examples. |
| Data Studio naming | https://cloud.google.com/blog/products/data-analytics/looker-studio-is-data-studio | Deck’s Data Studio naming note; 2026 reintroduction. |
| Data Studio / Sheets connector | https://docs.cloud.google.com/looker/docs/studio/connect-to-google-sheets | Google Sheets data connection; note docs/URLs may still say Looker Studio. |

## Current slide gaps

| Gap | Evidence | Implementation implication |
|---|---|---|
| Request-intake story is visible but still not the organizing spine. | `slides.md:231-277` currently has story and data elements, but no single end-to-end service map that carries `REQ-*` IDs through every lab. | Add a “요청 인테이크 운영 지도” map and reuse request IDs in all hands-on slides. |
| Synthetic dataset is too flat for downstream automation. | `slides.md:268-274` lists example requests without reusable schema fields. | Convert to fields: `request_id`, `channel`, `department`, `summary`, `priority`, `due_date`, `owner`, `status`, `source_link`, `evidence_link`. |
| Workspace intro uses a third-party ecosystem image. | `slides.md:301-304` / current Workspace intro uses Flow Team source. | Prefer official Google pages or a local public-product screenshot with a source line. |
| Sheets AI naming/function may be stale or account-specific. | Current deck still references `=GEMINI()` style examples in the Sheets section. | Verify live account surface; teach `AI(prompt, [range])` if current, or caveat `=GEMINI()` as rollout-specific. |
| First-use pattern is inconsistent across services. | Forms, Gmail, Calendar, Drive appear mostly inside Apps Script/process slides. | Add intro cards: “what / why in request intake / what we click-type / expected result / if it fails”. |
| NotebookLM/Data Studio fallbacks are lighter than spec. | Walkthrough slides have screenshots/checklists but need stronger failure notes. | Add login/quota/permission/UI-drift fallbacks and source behavior constraints. |
| Day 1 → Day 2 handoff lacks artifact crosswalk. | Handoff section exists but does not directly map Day 1 artifacts to PRD inputs. | Add crosswalk: dataset, Gem output, NotebookLM evidence, Sheet schema, Apps Script log, dashboard KPI → Day 2 Agent PRD fields. |

## Synthetic request dataset

Use only synthetic records in slides, scripts, prompts, and screenshots.

| ID | Channel | Scenario | Owner | Reused in lab |
|---|---|---|---|---|
| REQ-001 | Google Form | VPN 접속 오류로 원격 근무가 막힘 | IT지원 | Forms → Sheets → Gemini classification |
| REQ-002 | Gmail | 팀 공용 모니터 구매 가능 여부 문의 | 총무/구매 | Gmail summary/draft + Apps Script draft |
| REQ-003 | Google Form | 재직증명서 발급 요청 | HR | onFormSubmit trigger and status update |
| REQ-004 | Gmail | 세금계산서 재발행 요청 | 회계 | NotebookLM policy/source-grounded answer |
| REQ-005 | Gmail/Form | 신규 입사자 OT 일정 조율 | HR | Calendar event draft/candidate |
| REQ-006 | Gmail | 프로젝트 자료 폴더 공유 요청 | PMO | Drive folder/share caution |

## Implementation map

1. Add one end-to-end map slide after the Day 1 role/output orientation.
2. Convert `REQ-001~006` into a reusable sheet schema and keep the same IDs across all labs.
3. Rename labs by workflow step instead of service only:
   - `실습 1 요청 분류`
   - `실습 2 근거 확인`
   - `실습 3 접수 시트`
   - `실습 4 자동 초안`
   - `실습 5 KPI 대시보드`
   - `실습 6 Agent PRD 인계`
4. Add first-use cards for Forms, Gmail, Calendar, Drive, and Data Studio/Looker Studio naming.
5. Update Sheets AI formula wording after live/current-account verification.
6. Standardize walkthrough slides to always show: starting URL, click target, input text, expected result, fallback.
7. Preserve existing bbox assets first; retake only missing/outdated Forms/Gmail/Calendar/Drive flows.
8. Add a Day 1 → Day 2 artifact crosswalk before the Agent planning handoff.

## Risks and guardrails

- Google features vary by Workspace plan, admin setting, locale, rollout, and platform.
- NotebookLM sources are copied/static in important cases and may have source/size/sync limits.
- Data Studio/Looker Studio naming remains mixed across current docs and URLs.
- Authenticated UI capture is stateful; use only instructor-owned/sandbox accounts.
- Never use real customer, employee, contract, HR, finance, email, Drive, or calendar data.
