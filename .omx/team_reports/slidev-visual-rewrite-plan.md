# Slidev visual QA and rewrite plan report

- Worker: `worker-3`
- Team task: `4` — Slidev visual QA and rewrite plan report
- Date checked: 2026-05-28 KST
- Scope: `google-workspace-gemini` Slidev deck only; no `.omx/ultragoal` mutation; no real company data used.
- Output artifacts:
  - `google-workspace-gemini/.omx/team_reports/slidev-visual-contact-01.jpg`
  - `google-workspace-gemini/.omx/team_reports/slidev-visual-contact-02.jpg`
  - `google-workspace-gemini/.omx/team_reports/slidev-visual-contact-03.jpg`
  - `google-workspace-gemini/.omx/team_reports/slidev-visual-contact-04.jpg`
  - `google-workspace-gemini/.omx/team_reports/slidev-visual-contact-issues.jpg`
  - Local raw QA captures: `.omx/visual-checks/task-4-full/slide-01.png` … `slide-74.png` and `visual-audit.json` (ignored by git per project policy).

## Executive summary

The current deck builds and exports successfully, and the overall narrative already follows the intended Day 1 request-intake workflow: request intake → Gemini classification → NotebookLM grounding → Sheets structure → Apps Script automation → Gmail/Calendar/Drive → Data Studio dashboard → Day 2 Agent handoff.

The material visual risk is concentrated in dense hands-on walkthrough slides. Automated DOM geometry plus contact-sheet review found no global build break or missing-render error, but several lab slides place long prompt/code blocks inside right-side cards or bottom bands that run past the 1280×720 slide frame. These should be rewritten before final PDF delivery because learners need the exact prompt/code text to be readable from the PDF.

## Verification performed

| Gate | Result | Evidence |
|---|---|---|
| Slidev build | PASS | `pnpm run build` exited 0 and generated `dist/`; only known nonfatal `--localstorage-file` and upstream Rolldown `INVALID_ANNOTATION` warnings appeared. |
| PDF export | PASS | `pnpm run export` exited 0 and generated `slides-export.pdf`. |
| Dev-server visual QA | PASS with findings | `pnpm exec slidev --port 3030 --log warn`; Playwright captured 74 slide routes at 1280×720. |
| Font availability | PASS | `public/fonts` Paperlogy count = 9; `dist/fonts` Paperlogy count = 9 after build. |
| Test suite | SKIP | `package.json` has no `test` script for this Slidev-only report task. |
| Typecheck | SKIP | No `tsconfig.json`; Slidev build served as compile/render gate for this report task. |
| Lint | SKIP | `package.json` has no `lint` script; report markdown reviewed with `git diff --check`. |

## Visual QA method

1. Ran production build and PDF export from `google-workspace-gemini`.
2. Started Slidev dev server on `http://localhost:3030/`.
3. Used Playwright Chromium to visit slide routes `1` through `74` and save each route as a 1280×720 PNG under `.omx/visual-checks/task-4-full/`.
4. Computed likely visual issues by checking visible `.slidev-layout` descendants for:
   - elements whose rendered rectangles extend outside the slide frame,
   - elements with `scrollWidth`/`scrollHeight` larger than their client box,
   - browser error text such as module-load failures.
5. Created contact sheets for all captures and a separate issue contact sheet for quick human review.

## Findings by priority

### P0 — No blocking build/export failure

- Build and export complete successfully.
- The deck renders through 74 Slidev routes in dev preview.
- No route showed missing-module or Slidev runtime error text.

### P1 — Lab walkthrough code/prompt panels overflow the slide frame

These slides should be split or rewritten first because the clipped text is learner-facing operational material.

| Route | Slide title | Source anchor | Observed issue | Rewrite action |
|---:|---|---|---|---|
| 22 | Gemini 실습 1: 업무 요청 분류 | `slides.md:599` | Right-side prompt/code card extends below the slide; long prompt becomes partially hidden. | Split into two slides: (A) screen + button sequence, (B) prompt block + expected output checklist. Keep one visible action per slide. |
| 29 | NotebookLM 실습 3: 사내 규정 소스 추가 | `slides.md:759` | Right-side copied-text sample extends below frame. | Move the long regulation sample into a compact appendix/handout slide or shorten the visible snippet and link full text as a copy artifact. |
| 30 | NotebookLM 실습 3 결과 확인 | `slides.md:781` | Right panel and completion evidence sit at the lower edge; evidence text is cramped. | Keep screenshot + 3 click steps on this slide; move the three sample questions to the next slide. |
| 33 | Sheets 실습 2: 분석 테이블 만들기 | `slides.md:853` | TSV copy block is taller than its panel; detected `pre` scroll overflow. | Replace full TSV with 3-row visible sample plus `public`/download artifact reference, or use a two-slide sequence: schema first, paste data second. |
| 41 | Apps Script 실습 4: 권한 없는 로그 실행 | `slides.md:1007` | Code block and walkthrough grid extend well below frame; code panel scroll overflow. | Split into setup slide, code slide, run/log verification slide. Use `CopyBlock` only for a short function snippet per slide. |
| 44 | Form → Sheet → Gmail 자동 답신 파이프라인 | `slides.md:1073` | Bottom source/evidence line extends below frame after a large code block. | Move safety note to a separate caution band slide or reduce code block height and keep the source line above the fold. |

### P2 — Dense overview slides are readable but need print-safe breathing room

| Route | Slide title | Source anchor | Observed issue | Rewrite action |
|---:|---|---|---|---|
| 4 | 1일차 상세 커리큘럼 | `slides.md:87` | Four tall curriculum cards reach/past the bottom edge. | Convert into two slides: morning hands-on and afternoon automation/dashboard/Agent handoff. |
| 12 | Gemini 모델과 사고 수준 선택 | `slides.md:312` | Source line sits at lower edge; H1 box has minor text-height scroll signal. | Reduce source line height or move source to speaker note/compact footer. |
| 14 | Workspace AI 처리 흐름 | `slides.md:371` | Evidence band is very close to bottom edge. | Shorten evidence sentence or lower diagram density. |
| 40 | Forms 실습: 요청 접수 화면 만들기 | `slides.md:992` | Bottom form-field copy block sits at the frame boundary. | Turn the form fields into chips or a 2-column field table instead of a code block. |

### P3 — Low-risk heuristic-only signals

Routes 13, 16–19, and 27 showed minor H1/client-height or image/card scroll heuristics, but contact-sheet review indicates they remain legible and do not require immediate edits. Re-check them after P1/P2 rewrites because CSS or title sizing changes could alter layout.

## Rewrite plan

### Phase 1 — Stabilize operational slides

1. Convert each clipped hands-on slide into a two- or three-step micro-sequence:
   - `무엇을 열까` — URL/surface + screenshot/bbox.
   - `무엇을 붙여넣을까` — short visible snippet + copy artifact link.
   - `무엇이 성공인가` — expected result + fallback note.
2. Keep screenshots on the left and action cards on the right, but never combine screenshot, button list, full prompt/code, and evidence note on one slide.
3. For `CopyBlock` content, prefer 8–14 visible lines. Move long prompt/code/TSV into a file artifact or appendix slide.

### Phase 2 — Tighten module flow

1. Split `1일차 상세 커리큘럼` into two slides so each card has readable vertical space.
2. Insert a short transition before each lab cluster: `입력 데이터 → AI 처리 → 저장/자동화 → 증거`.
3. Preserve the current unified request-intake story and synthetic sample data; do not introduce real company data or new services.

### Phase 3 — Re-run visual gate

After deck edits, repeat:

```bash
pnpm run build
pnpm run export
pnpm exec slidev --port 3030 --log warn
# capture every slide route at 1280x720 and rebuild contact sheets
```

Acceptance target: no route has learner-facing text outside the slide frame, no `CopyBlock` requires scrolling to understand the lab, and the issue contact sheet is empty or contains only benign title-height heuristics.

## Implementation map

Recommended deck edit order:

1. `slides.md:599` — Gemini prompt lab split.
2. `slides.md:759` and `slides.md:781` — NotebookLM source and question/result split.
3. `slides.md:853` — Sheets TSV sample compression.
4. `slides.md:1007` and `slides.md:1073` — Apps Script code pipeline split.
5. `slides.md:87`, `slides.md:312`, `slides.md:371`, `slides.md:992` — overview/bottom-band print safety cleanup.
6. `style.css` only if repeated split-slide patterns need a reusable compact class; otherwise prefer markdown-level restructuring first.

## Notes and risks

- Existing tracked files `slides.md` and `components/CopyBlock.vue` had uncommitted modifications before this worker’s report work. This task intentionally does not edit them.
- `download: true` and PDF export are already viable; the remaining work is visual density, not build mechanics.
- Google UI screenshots can drift by account, locale, and product rollout. Keep the current bbox screenshot discipline when replacing any walkthrough image.
