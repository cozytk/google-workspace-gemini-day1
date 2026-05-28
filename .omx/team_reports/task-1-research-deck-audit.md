# Task 1 — Official/current research + current deck audit

- Worker: `worker-1`
- Team: `ultragoal-evidence-sp-5d221e37`
- Date: 2026-05-28 KST
- Ultragoal context: supports `.omx/ultragoal/goals.json` active story `G001/G002`; this worker did **not** mutate `.omx/ultragoal`.
- Scope: report-only evidence for the Google Workspace + Gemini Day 1 deck improvement. No real company data used.

## Executive result

The deck already has a strong Slidev/Paperlogy structure, existing public walkthrough assets, and partial request-processing examples. The main next improvement is not a broad redesign; it is to reframe the existing service demos as one synthetic **request-intake operating system**:

`Form/Gmail request → Gemini classify/summarize/draft → NotebookLM source-grounded answer → Sheets/Forms structured record → Apps Script follow-up → Gmail/Calendar/Drive action → Data Studio/Looker Studio dashboard → Day 2 Agent PRD`.

## Current deck audit

### Local deck facts

- `slides.md` currently reports 80 `---` separator lines and 80 split chunks by a simple `\n---\n` parser; it has 74 `#` slide-title lines. Treat old reports that say 76 slides as stale.
- Key sections:
  - Cover/roadmap/Day 1 orientation: `slides.md:12-225`
  - Part 1 Gemini + Workspace: `slides.md:227-855`
  - Part 2 Apps Script: `slides.md:857-1052`
  - Part 3 Data Studio: `slides.md:1073-1295`
  - Part 4 Painpoint + Agent planning: `slides.md:1298-1454`
  - Day 2-3 Inline Agent Lab bridge: `slides.md:1458-1575`
- `style.css` has Paperlogy font-face definitions and the core `--ag-*` design tokens.
- Public walkthrough/screenshots already exist for Gemini, NotebookLM, Sheets, Apps Script, and Data Studio under `public/walkthroughs/` and `public/screenshots/`.

### Deck strengths

- The 3-day roadmap already makes Day 1 the foundation for Day 2 Agent development (`slides.md:31-83`).
- Day 1 already contains service-specific operations for Gemini, NotebookLM, Sheets, Apps Script, and Data Studio (`slides.md:231-1295`).
- Synthetic-data safety is already introduced in the account check slide (`slides.md:202-225`).
- Bbox/annotation infrastructure exists: `scripts/capture-dom-bbox-walkthroughs.mjs`, `scripts/capture-after-notebook-bboxes.mjs`, and `scripts/process-walkthroughs.mjs`.

### Gaps to address in G002/G003 deck work

| Priority | Gap | Evidence | Recommended change |
|---|---|---|---|
| P0 | Unified request-intake story is implicit, not explicit. | Service sections are separated by tool; no single map slide shows request → classify → ground → record → automate → report → Agent handoff. | Add a workflow map near the Day 1 overview and reuse IDs like `REQ-001` through all labs. |
| P0 | Forms/Gmail/Drive/Calendar are workflow components but lack first-use intro cards. | They appear in Apps Script flow and output slides (`slides.md:868-1046`) without the same intro pattern as Gemini/NotebookLM/Sheets. | Add compact “what / why in intake / what we click / evidence / fallback” slides before the first hands-on use. |
| P0 | Screenshot walkthroughs are uneven. | Some slides show images plus checklist, but not every lab gives URL, exact click target, input text, expected result, and failure fallback (`slides.md:241-253`, `647-667`, `1099-1156`). | Standardize walkthrough cards using existing bbox assets and only retake screenshots where UI drift is confirmed. |
| P1 | Workspace intro uses a third-party image/source. | `slides.md:286-313` uses a Flow Team Blog image/source for Workspace ecosystem. | Prefer official Google Workspace/Gemini product/help pages or locally captured public product screenshots. |
| P1 | Sheets AI formula naming needs current-source review. | `slides.md:773-775` shows `=GEMINI(...)`; official Sheets AI docs now emphasize Gemini collaboration and an `AI(prompt, [range])` function page. | Verify the live/account surface; update formula text or add a caveat if `=GEMINI()` is plan/rollout-specific. |
| P1 | Naming caveat: Data Studio vs Looker Studio. | Cover cites the 2026 Google Cloud blog, but current connector docs still use Looker Studio URLs/naming. | Keep the reintroduced Data Studio note, but teach learners to expect `lookerstudio.google.com` and docs/search results still saying Looker Studio. |
| P2 | Day 1 → Day 2 handoff needs a mapping table. | Handoff slides exist (`slides.md:1436-1454`) but do not map each Day 1 artifact to Agent PRD inputs. | Add a table: request dataset, prompt/Gem, NotebookLM evidence, Sheet schema, automation log, dashboard KPI → Agent requirements. |

## Official/current source set for slide updates

Use official Google sources first when rewriting current-version claims.

| Topic | Official source | Slide relevance |
|---|---|---|
| Workspace with Gemini bundle | Google Workspace Admin Help: https://support.google.com/a/answer/13623623 | Current umbrella naming; plan/availability caveats. |
| Gemini app + Workspace connection | Gemini Apps Help: https://support.google.com/gemini/answer/15229592 | Entry point for connecting Gmail, Docs, Drive, Tasks, Keep, and Calendar; work/school admin enablement caveat. |
| Workspace Gemini privacy | Gmail Help: https://support.google.com/mail/answer/14615114 | Workplace-safe privacy wording; do not overclaim training/data use. |
| Gmail + Gemini | Gmail Help: https://support.google.com/mail/answer/14355636 | Summaries, draft replies, info retrieval, Calendar event creation; platform/language caveats. |
| Docs + Gemini | Docs Editors Help: https://support.google.com/docs/answer/14355406 | Draft/refine/summarize content and use Gems/custom experts in Docs. |
| Sheets + Gemini | Docs Editors Help: https://support.google.com/docs/answer/14356410 | Current Sheets collaboration features: formulas, analysis, charts, pivots, filters, formatting. |
| Sheets AI function | Docs Editors Help: https://support.google.com/docs/answer/15877199 | Verify whether the deck should teach `AI(prompt, [range])` instead of or alongside `=GEMINI()`. |
| Slides + Gemini | Docs Editors Help: https://support.google.com/docs/answer/14355071 | Slide generation/editing/image generation; useful for report-output sections. |
| Drive + Gemini | Drive Help: https://support.google.com/drive/answer/16686008 | Drive as knowledge/file surface for summarizing and organizing files. |
| Meet + Gemini | Meet Help: https://support.google.com/meet/answer/16024610 and https://support.google.com/meet/answer/14754931 | Keep “Ask Gemini” and “Take notes for me” separate; note desktop/language/consent limits. |
| NotebookLM overview | Google Workspace NotebookLM page: https://workspace.google.com/intl/en_uk/products/notebooklm/ | Workspace positioning, source import, Audio Overview, uploaded data caution. |
| NotebookLM sources | NotebookLM Help: https://support.google.com/notebooklm/answer/16215270 | Source types/constraints and grounding behavior for policy/context lookup. |
| NotebookLM chat/citations | NotebookLM Help: https://support.google.com/notebooklm/answer/16179559 | Use for “source-grounded answer” expectations. |
| Apps Script platform | Apps Script docs: https://developers.google.com/apps-script | Explain Apps Script as the Google product automation surface. |
| Apps Script triggers | Apps Script docs: https://developers.google.com/apps-script/guides/triggers and https://developers.google.com/apps-script/guides/triggers/installable | Form submit/time/on-change automation caveats and account/permission behavior. |
| Gmail/Calendar/Drive services | Apps Script docs: https://developers.google.com/apps-script/reference/gmail/gmail-app, https://developers.google.com/apps-script/reference/calendar, https://developers.google.com/apps-script/reference/drive | Source for draft email, event, and file/folder automation examples. |
| Data Studio naming | Google Cloud Blog: https://cloud.google.com/blog/products/data-analytics/looker-studio-is-data-studio | Current 2026 naming note used by the deck. |
| Sheets connector | Google Cloud docs: https://docs.cloud.google.com/looker/docs/studio/connect-to-google-sheets | Dashboard connection walkthrough; docs still use Looker Studio path/name. |

## Synthetic request dataset for unified labs

| ID | Channel | Scenario | Owner | Lab use |
|---|---|---|---|---|
| REQ-001 | Google Form | VPN 접속 오류로 원격 근무가 막힘 | IT지원 | Forms → Sheets record; Gemini urgency/type classification |
| REQ-002 | Gmail | 팀 공용 모니터 구매 가능 여부 문의 | 총무/구매 | Gmail summary + draft reply; Apps Script draft creation |
| REQ-003 | Google Form | 재직증명서 발급 요청 | HR | onFormSubmit trigger and SLA/status column |
| REQ-004 | Gmail | 세금계산서 재발행 요청 | 회계 | NotebookLM policy/source-grounded answer |
| REQ-005 | Gmail/Form | 신규 입사자 OT 일정 조율 | HR | Calendar event candidate and confirmation mail |
| REQ-006 | Gmail | 프로젝트 자료 폴더 공유 요청 | PMO | Drive folder/link handling and permission caution |

## Implementation map for the next deck edit

1. Insert an “요청 인테이크 운영 지도” slide after the current Day 1 role/output slides.
2. Add the synthetic `REQ-001~006` dataset as the common sample table before the first Gemini lab.
3. Rename hands-on labels so they follow the story: `실습 1 요청 분류`, `실습 2 근거 확인`, `실습 3 접수 시트`, `실습 4 자동 초안`, `실습 5 KPI 대시보드`, `실습 6 Agent PRD`.
4. Add first-use cards for Forms, Gmail, Calendar, Drive, and Data Studio/Looker Studio caveat.
5. Update the Sheets AI formula slide after live/official confirmation: teach `AI(prompt, [range])` if that is the current account surface, or mark `=GEMINI()` as rollout-specific.
6. Standardize every walkthrough slide to include: starting URL, click target, input text, expected result, and fallback.
7. Use existing bbox assets first; retake only missing/outdated flows.
8. Add Day 1 → Day 2 mapping table before the Agent PRD section.

## Risks / cautions

- Google feature availability can vary by Workspace plan, account type, admin settings, platform, language, and rollout state.
- Korean is supported in many Gemini surfaces, but some Workspace with Gemini features remain English-only or platform-specific; keep caveats visible.
- Do not use real company/customer/HR/contract data in prompts, sources, screenshots, or scripts.
- The current repo has uncommitted shared-file changes (`slides.md`, `components/CopyBlock.vue`, `.omx/reports/`), so this task intentionally committed only this worker-owned report file.

## Subagent integration

Subagents spawned: 3 (`deck-audit probe` 019e6c98-5486-7e92-97e6-6bd3f410fc03, `official-research probe` 019e6c98-7212-7bd2-aaa4-94319e9b66b3, `change-slice/verification probe` 019e6c98-82d0-77a1-82a6-1fd348f53e9a).  
Subagent model: `gpt-5.4-mini`.  
Serial searches before spawn: 3.  
Findings integrated:

- Deck audit: section line ranges, stale slide-count warning, first-use and source-update gaps.
- Official research: current Google source links and availability/privacy/language caveats.
- Change-slice/verification: report-only safe output path, build/export as practical validation, no lint/test script availability.

## Verification

- PASS — local audit commands: separator/title counts and slide section grep completed.
- PASS — official/current research refresh: source set above collected from Google Help, Google Workspace, Apps Script, and Google Cloud docs/blog pages.
- PASS — scope check: report-only change under `.omx/team_reports/`; no `.omx/ultragoal` mutation.
- PASS — `pnpm run build` → exit 0; `dist/index.html` generated. Known Rolldown `INVALID_ANNOTATION` warnings from `@vueuse/core` dependency appeared but build succeeded.
- PASS — `pnpm run export` → exit 0; `slides-export.pdf` generated.
- PASS — `git diff --check -- .omx/team_reports/task-1-research-deck-audit.md` → exit 0.
- SKIP — lint/test/typecheck scripts: `package.json` has no `lint`, `test`, or `typecheck` script; `slidev build` used as the practical compile/type validation for this report-only task.

## Completion recommendation

Mark Task 1 complete after `pnpm run build`, `pnpm run export`, and `git diff --check` complete or are documented with explicit PASS/FAIL. This report is sufficient input for G002/G003 deck rewrite and UI/bbox verification lanes.
