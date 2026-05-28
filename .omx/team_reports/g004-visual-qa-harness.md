# G004 reusable Slidev visual QA harness

- Worker: `worker-3`
- Team task: `7` — G004 reusable Slidev visual QA harness
- Date checked: 2026-05-28 KST
- Scope: local Slidev QA harness only; no `slides.md`, `components/CopyBlock.vue`, or `.omx/ultragoal` edits.

## What changed

| Path | Purpose |
|---|---|
| `scripts/visual-qa-slidev.mjs` | Reusable Playwright/Sharp harness that starts or reuses Slidev, captures every route at 1280×720, computes DOM geometry overflow/scroll findings, and writes PNG/contact-sheet artifacts. |
| `package.json` | Adds `visual:qa` script: `node scripts/visual-qa-slidev.mjs`. |
| `.omx/team_reports/g004-visual-qa-harness.md` | This runbook/report with command evidence, outputs, findings, and limitations. |

## Harness command

```bash
pnpm run visual:qa -- --run-id task-7-g004-harness
```

Useful options:

```bash
node scripts/visual-qa-slidev.mjs --run-id <name> --port 3030 --width 1280 --height 720
node scripts/visual-qa-slidev.mjs --url http://localhost:3030 --run-id reuse-existing-server
node scripts/visual-qa-slidev.mjs --slides 10 --run-id smoke-test
```

## Output contract

The harness writes to `.omx/visual-checks/<run-id>/`:

- `slide-01.png` … per-route 1280×720 captures
- `visual-audit.json` with per-slide title, route page, DOM overflow elements, scroll elements, and error-text flag
- `contact-01.jpg`, `contact-02.jpg`, … full-deck contact sheets
- `contact-issues.jpg` issue-only contact sheet

Task-7 run output:

- `.omx/visual-checks/task-7-g004-harness/visual-audit.json`
- `.omx/visual-checks/task-7-g004-harness/contact-01.jpg`
- `.omx/visual-checks/task-7-g004-harness/contact-02.jpg`
- `.omx/visual-checks/task-7-g004-harness/contact-03.jpg`
- `.omx/visual-checks/task-7-g004-harness/contact-04.jpg`
- `.omx/visual-checks/task-7-g004-harness/contact-issues.jpg`

These visual-check artifacts are intentionally ignored by git in this repository; the reusable script and this report are the committed artifacts.

## Verification evidence

| Check | Result | Evidence |
|---|---|---|
| Script syntax | PASS | `node --check scripts/visual-qa-slidev.mjs` exited 0. |
| Slidev build | PASS | `pnpm run build` exited 0 and generated `dist/`; known nonfatal `--localstorage-file` and upstream Rolldown `INVALID_ANNOTATION` warnings appeared. |
| Visual QA harness | PASS | `pnpm run visual:qa -- --run-id task-7-g004-harness` exited 0, started Slidev on port 3030, captured 74 routes, wrote audit JSON and contact sheets. |
| Manual contact-sheet review | PASS with findings | Viewed `contact-issues.jpg`; it matches prior task-4 density findings, mainly long lab prompt/code panels. |
| Lint/test/typecheck | SKIP | `package.json` still has no `lint`, `test`, or `typecheck` scripts; syntax check + Slidev build used as applicable gates. |

Non-blocking runtime warnings observed during visual QA:

- Slidev/Vite logged `NotAllowedError: Wake Lock permission request denied` in headless browser context.
- This did not stop route capture or artifact generation.

## Findings from task-7 harness run

- Routes captured: `74`
- Issue route set from `visual-audit.json`: `4, 12, 13, 14, 16, 17, 18, 19, 22, 27, 29, 30, 32, 33, 40, 41, 44`
- Material issue subset remains the same as task-4: dense lab slides where prompt/code/TSV blocks are too tall for the slide frame, especially routes `22`, `29`, `30`, `33`, `41`, and `44`.
- Several title/card heuristic findings are low-risk and should be reviewed in the contact sheet before treating them as blockers.

## Limitations

1. The detector is geometry-based. It flags likely overflow/scroll conditions, not semantic readability by itself.
2. Contact-sheet human review is still required for false positives such as benign H1 line-height differences.
3. The harness uses the active Slidev route count from `window.__slidev__.nav.total`; if a deck uses conditional/hidden/imported slides in unusual ways, run with `--slides <n>` for explicit coverage.
4. The script captures local Slidev output only. It does not verify Google live UI flows, account state, or external screenshots.
5. `.omx/visual-checks/` artifacts are ignored to keep commits small; promote specific images to a tracked report path only when they are required evidence.

## Recommended next use

After any future deck rewrite:

```bash
pnpm run build
pnpm run visual:qa -- --run-id after-rewrite-$(date +%Y%m%d-%H%M%S)
```

Acceptance target: `visual-audit.json.issueSlides` contains no learner-facing clipped prompt/code panels, and `contact-issues.jpg` has only benign layout heuristics or is empty.
