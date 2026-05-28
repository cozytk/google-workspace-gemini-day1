# Computer Use Guest UI Check

Date: 2026-05-28
Scope: Safe, unauthenticated UI verification for Ultragoal G001/G002 under `.omx/ultragoal/goals.json`.
Tool: `mcp__computer_use__` controlling Google Chrome Guest Mode.

## Evidence

1. Opened Google Chrome and selected **Guest Mode** from the Chrome profile picker.
   - Reason: avoid exposing or using personal/company profile data.
2. Navigated to `https://gemini.google.com/app`.
   - Observed Chrome window title: `Google Gemini`.
   - Observed UI elements: prompt input `Gemini 프롬프트 입력`, mode picker `현재 Flash 모드 사용 중`, upload/tools controls, sign-in button.
   - Conclusion: Gemini guest/public app shell and the click targets used by the current walkthrough are reachable without account data.
3. Navigated to `https://notebooklm.google.com/`.
   - Observed Google Account sign-in page.
   - Conclusion: NotebookLM live notebook creation requires account login; deck needs fallback note and instructor-sandbox capture for source-dialog screenshots.
4. Navigated to `https://lookerstudio.google.com/data`.
   - Observed redirect/final UI: `datastudio.google.com/data`, title `Data Studio Connect to Data`.
   - Observed connector gallery with search input and visible `Google Sheets` connector card.
   - Conclusion: Data Studio connector-gallery path is publicly visible and supports the deck’s “Data Studio / Sheets connector” walkthrough and naming note.

## Implications for slides

- Keep screenshots synthetic and account-safe.
- For NotebookLM, Sheets create, Apps Script editor, and Data Studio report creation, the real button-by-button screenshots should be captured from an instructor sandbox account, not a personal or company account.
- Add or preserve fallback text: if learners see sign-in, quota, or first-run setup screens, they should stop and follow the instructor/sandbox-account path.
