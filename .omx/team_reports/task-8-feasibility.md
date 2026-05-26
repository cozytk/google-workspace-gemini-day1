# Task 8 Feasibility Report — safe local CLI demos

- Worker: `worker-3`
- Tracked task: `8` (`Task 8: safe local CLI feasibility demos`)
- Output path: `google-workspace-gemini/.omx/team_reports/task-8-feasibility.md`
- Scope guard: no `.omx/ultragoal` mutation; no production edits; no model-generating prompts were run.
- Method: read-only CLI availability/version/help checks plus local app bundle inspection. Commands ran from `/tmp` where practical.

## Executive result

| Tool | Local signal | Feasibility for Day 2-3 inline labs | Usage/budget observation |
|---|---|---|---|
| Codex CLI | Installed at `/opt/homebrew/bin/codex`; version `codex-cli 0.133.0` | Good fit for optional local agent lab scripts and review/build workflows. `codex exec` supports non-interactive execution, model/profile selection, sandbox mode, working directory, JSON output, and output-last-message file capture. | No model invocation was performed in this task. Help output shows controls for `--model`, `--profile`, `--sandbox`, `--cd`, `--json`, and `--output-last-message`, so lab runs can be constrained and captured. |
| Claude Code | Installed at `/Applications/cmux.app/Contents/Resources/bin/claude`; version `2.1.117 (Claude Code)` | Good fit for side-by-side “same prompt, different agent CLI” demos. `--print`, `--output-format`, `--permission-mode`, `--allowedTools`, and `--max-budget-usd` are visible in help. | No model invocation was performed. Claude has an explicit `--max-budget-usd` for `--print` mode, useful for bounded classroom demos. |
| Antigravity | No shell command named `antigravity`, but macOS app bundles exist: `/Applications/Antigravity IDE.app` (`com.google.antigravity-ide`, `2.0.1`) and `/Applications/Antigravity.app` (`com.google.antigravity`, `2.0.0`). Spotlight also shows prior Application Support/log paths. | Feasible as GUI/IDE walkthrough rather than shell CLI lab. For Day 2-3, present Antigravity as the agentic IDE surface and use Codex/Claude CLIs for terminal-safe repeatable labs. | No Antigravity app was launched. App/log presence is an availability/usage signal only; no credentials or interactive state were touched. |

## Recommended Day 2-3 lab shape

1. **Day 2 terminal-safe agent lab**: use a tiny temp repo or `demos/inline-agent-lab`-style sample with a fixed input JSON, deterministic verification script, and an explicit budget guard.
2. **Codex lane**: demonstrate `codex exec --cd <lab-dir> --json --output-last-message <artifact>` only after instructor confirms account/budget. Use sandbox/read-only modes for planning/review, and keep generated artifacts under a lab folder.
3. **Claude lane**: demonstrate `claude --print --output-format json --max-budget-usd <small amount> --permission-mode default` with `--allowedTools` limited to read/build commands.
4. **Antigravity lane**: show the IDE surfaces visually; do not depend on an `antigravity` shell command. Use screenshots or live GUI only if instructor-owned account/session is available.
5. **Completion evidence**: every lab should output `agent-report.md`, `usage-ledger.json`, and a verifier result. This matches the deck’s evidence-oriented teaching rhythm.

## Command evidence

### Codex CLI

```text
$ command -v codex
# exit 0 in 0.01s
/opt/homebrew/bin/codex
```

```text
$ codex --version
# exit 0 in 0.06s
codex-cli 0.133.0
```

```text
$ codex help key options
# exit 0 in 0.06s
-c, --config <key=value>
  -m, --model <MODEL>
  -p, --profile <CONFIG_PROFILE>
      --profile-v2 <CONFIG_PROFILE_V2>
  -s, --sandbox <SANDBOX_MODE>
  -C, --cd <DIR>
      --output-schema <FILE>
      --json
  -o, --output-last-message <FILE>
```

Relevant full-help signal from `codex --help`:

```text
Commands include: exec, review, login/logout, mcp, plugin, app, completion, update, doctor, sandbox, debug, apply, resume, fork, cloud, features.
```

### Claude Code

```text
$ command -v claude
# exit 0 in 0.01s
/Applications/cmux.app/Contents/Resources/bin/claude
```

```text
$ claude --version
# exit 0 in 0.04s
2.1.117 (Claude Code)
```

```text
$ claude help key options
# exit 0 in 0.09s
Claude Code - starts an interactive session by default, use -p/--print for
  --add-dir <directories...>                        Additional directories to allow tool access to
  --allowedTools, --allowed-tools <tools...>        Comma or space-separated list of tool names to allow (e.g. "Bash(git *) Edit")
  --bare                                            Minimal mode: skip hooks, LSP, plugin sync, attribution, auto-memory, background prefetches, keychain reads, and CLAUDE.md auto-discovery. Sets CLAUDE_CODE_SIMPLE=1. Anthropic auth is strictly ANTHROPIC_API_KEY or apiKeyHelper via --settings (OAuth and keychain are never read). 3P providers (Bedrock/Vertex/Foundry) use their own credentials. Skills still resolve via /skill-name. Explicitly provide context via: --system-prompt[-file], --append-system-prompt[-file], --add-dir (CLAUDE.md dirs), --mcp-config, --settings, --agents, --plugin-dir.
  --dangerously-skip-permissions                    Bypass all permission checks. Recommended only for sandboxes with no internet access.
  --fallback-model <model>                          Enable automatic fallback to specified model when default model is overloaded (only works with --print)
  --include-hook-events                             Include all hook lifecycle events in the output stream (only works with --output-format=stream-json)
  --include-partial-messages                        Include partial message chunks as they arrive (only works with --print and --output-format=stream-json)
  --input-format <format>                           Input format (only works with --print): "text" (default), or "stream-json" (realtime streaming input) (choices: "text", "stream-json")
  --max-budget-usd <amount>                         Maximum dollar amount to spend on API calls (only works with --print)
  --model <model>                                   Model for the current session. Provide an alias for the latest model (e.g. 'sonnet' or 'opus') or a model's full name (e.g. 'claude-sonnet-4-6').
  --no-session-persistence                          Disable session persistence - sessions will not be saved to disk and cannot be resumed (only works with --print)
  --output-format <format>                          Output format (only works with --print): "text" (default), "json" (single result), or "stream-json" (realtime streaming) (choices: "text", "json", "stream-json")
  --permission-mode <mode>                          Permission mode to use for the session (choices: "acceptEdits", "auto", "bypassPermissions", "default", "dontAsk", "plan")
  -p, --print                                       Print response and exit (useful for pipes). Note: The workspace trust dialog is skipped when Claude is run with the -p mode. Only use this flag in directories you trust.
  --replay-user-messages                            Re-emit user messages from stdin back on stdout for acknowledgment (only works with --input-format=stream-json and --output-format=stream-json)
  --settings <file-or-json>                         Path to a settings JSON file or a JSON string to load additional settings from
```

### Antigravity availability and usage signals

```text
$ command -v antigravity
# exit 0 in 0.01s
(no output)
```

Interpretation: no shell command named `antigravity` is on `PATH`.

```text
$ find Antigravity apps
# exit 0 in 0.01s
/Applications/Antigravity IDE.app
/Applications/Antigravity.app
```

```text
$ Antigravity app bundle versions
# exit 0 in 0.03s
APP=/Applications/Antigravity IDE.app
com.google.antigravity-ide
2.0.1
2.0.1
MacOS=Electron
APP=/Applications/Antigravity.app
com.google.antigravity
2.0.0
2.0.0
MacOS=Antigravity
```

Spotlight usage/availability sample:

```text
$ mdfind Antigravity apps
# exit 0 in 0.09s
/Applications/Antigravity IDE.app
/Applications/Antigravity.app
/Library/Audio/Apple Loops/Apple/04 Modern RnB/Antigravity Guitar.caf
/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/lib/python3.9/antigravity.py
/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/__pycache__/antigravity.cpython-313.opt-1.pyc
/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/__pycache__/antigravity.cpython-313.pyc
/Library/Frameworks/Python.framework/Versions/3.13/lib/python3.13/antigravity.py
/Users/taekkim/Downloads/Antigravity.dmg
/Users/taekkim/Downloads/antigravity-agentic-coding-basic.pdf
/Users/taekkim/Library/Application Support/Antigravity
/Users/taekkim/Library/Application Support/Antigravity/logs/20260507T214546/antigravity-interactive-editor.log
/Users/taekkim/Library/Application Support/Antigravity/logs/20260507T214546/window1/exthost/google.antigravity
/Users/taekkim/Library/Application Support/Antigravity/logs/20260507T214546/window1/exthost/google.antigravity/Antigravity Crash Logs.log
/Users/taekkim/Library/Application Support/Antigravity/logs/20260507T214546/window1/exthost/google.antigravity/Antigravity.log
/Users/taekkim/Library/Application Support/Antigravity/logs/20260507T214546/window1/exthost/output_logging_20260507T214548/1-Remote - Dev Containers (Antigravity).log
/Users/taekkim/Library/Application Support/Antigravity/logs/20260507T214546/window2/exthost/google.antigravity
/Users/taekkim/Library/Application Support/Antigravity/logs/20260507T214546/window2/exthost/google.antigravity/Antigravity Crash Logs.log
/Users/taekkim/Library/Application Support/Antigravity/logs/20260507T214546/window2/exthost/google.antigravity/Antigravity.log
/Users/taekkim/Library/Application Support/Antigravity/logs/20260507T214546/window2/exthost/output_logging_20260507T214547/1-Remote - Dev Containers (Antigravity).log
/Users/taekkim/Library/Application Support/Antigravity/logs/20260507T214546/window3/exthost/google.antigravity
/Users/taekkim/Library/Application Support/Antigravity/logs/20260507T214546/window3/exthost/google.antigravity/Antigravity Crash Logs.log
/Users/taekkim/Library/Application Support/Antigravity/logs/20260507T214546/window3/exthost/google.antigravity/Antigravity.log
/Users/taekkim/Library/Application Support/Antigravity/logs/20260507T214546/window3/exthost/output_logging_20260507T214547/1-Remote - Dev Containers (Antigravity).log
/Users/taekkim/Library/Application Support/Antigravity
```

## Safety notes

- All commands were read-only except writing this report file.
- No Codex/Claude model prompts were executed, so this task incurred no deliberate LLM token spend from the tested CLIs.
- No Antigravity app was launched; only bundle metadata and filesystem/Spotlight presence were inspected.
- `.omx/ultragoal` was not read or modified for this task.

## Verification

- PASS — `command -v codex` → `/opt/homebrew/bin/codex`.
- PASS — `codex --version` → `codex-cli 0.133.0`.
- PASS — `codex exec --help` key options include model/profile/sandbox/cd/json/output capture controls.
- PASS — `command -v claude` → `/Applications/cmux.app/Contents/Resources/bin/claude`.
- PASS — `claude --version` → `2.1.117 (Claude Code)`.
- PASS — `claude --help` key options include `--print`, `--output-format`, `--permission-mode`, `--allowedTools`, and `--max-budget-usd`.
- PASS — Antigravity app bundles found at `/Applications/Antigravity IDE.app` and `/Applications/Antigravity.app`; bundle versions captured.
- PASS — report file created at `.omx/team_reports/task-8-feasibility.md`.
- NOT RUN — actual model-generating `codex exec` / `claude --print` prompts, to avoid spending budget or mutating session state without explicit instructor approval.

## Handoff

Use Task 8 as the tracked team task. Task 3 remains untouched because its claim conflicted and leader instructed worker-3 to use Task 8 instead.
