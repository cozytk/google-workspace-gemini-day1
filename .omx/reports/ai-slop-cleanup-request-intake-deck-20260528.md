AI SLOP CLEANUP REPORT
======================

Scope: `components/CopyBlock.vue`, `slides.md`, `style.css`, and generated request-intake walkthrough integration.

Behavior Lock: Re-ran `pnpm run process:walkthroughs`, `pnpm run build`, `pnpm run export`, and `pnpm run visual:qa -- --run-id final-leader-compact-20260528T034146Z` after the cleanup pass.

Cleanup Plan:
- Keep the rewrite bounded to the request-intake lecture flow and print-safe Slidev layout.
- Remove learner-facing density/overflow in hands-on slides by splitting prompt/code/TSV steps.
- Preserve safe synthetic sample data and avoid real company data.
- Treat fallback-like wording carefully: Korean `임시` occurrences are content labels (`임시 접속`, `임시보관함`), not fallback control paths.

Fallback Findings:
- `rg` fallback scan found only Korean content labels and synthetic walkthrough labels.
- Synthetic `request-intake-*` screenshot assets are a grounded safety fallback: documented as local HTML mocks, generated reproducibly by Playwright bbox scripts, and used because logged-in Google capture would create forms/drafts/events/folders without sandbox authorization.
- No masking fallback slop, swallowed errors, silent defaults, or bypass logic was introduced in the deck changes.

UI/Design Findings:
- Dense operational slides were the main slop risk. Gemini, NotebookLM, Sheets, Apps Script, Forms, Gmail, Calendar, and Drive labs now use one-action-per-slide sequencing.
- Final visual QA shows no learner-facing overflow; residual issue slides are only benign h1 title-height heuristics from the automated DOM check.

Passes Completed:
- Fallback-like code resolution gate — preserved grounded synthetic bbox fallback with explicit limitations; no masking fallback found.
1. Dead code deletion — N/A, no dead deck code identified in scoped files.
2. Duplicate removal — repeated lab instructions normalized into `mini-checklist numbered`, `copy-focus`, and request-intake sample snippets.
3. Naming/error handling cleanup — changed unsafe “Gmail 발송” framing to “Gmail 초안” and added explicit no-send/no-external-share boundaries.
4. Test reinforcement — validated with build/export/walkthrough processing/full visual QA.

Quality Gates:
- Regression tests: PASS (`pnpm run process:walkthroughs`)
- Build: PASS (`pnpm run build`, known upstream Rolldown warnings only)
- Export: PASS (`pnpm run export`)
- Visual QA: PASS with benign title-height heuristics only (`final-leader-compact-20260528T034146Z`)
- Lint/typecheck: N/A; package has no lint/typecheck scripts for this Slidev deck.

Changed Files:
- `components/CopyBlock.vue` — synthetic request-intake snippets.
- `slides.md` — service intros and step-by-step labs.
- `style.css` — print-safe request-intake layouts and visual QA tightening.

Remaining Risks:
- Real logged-in Google UI can drift; recapture with a disposable sandbox account if the instructor later authorizes it.
