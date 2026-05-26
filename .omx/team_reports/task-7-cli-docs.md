# Task 7 — Official CLI docs research for Inline Agent Lab

- Worker: `worker-2`
- Date checked: 2026-05-27 KST
- Output scope: official/primary sources only; no `.omx/ultragoal` mutation.
- Lifecycle note: Task 2 handoff initially returned `claim_conflict` because that task belonged to `worker-1`; leader reassigned the tracked work as Task 7, which `worker-2` claimed successfully.

## Executive summary

For Day 2-3 Inline Agent Lab, present the three tools as a **terminal agent spectrum**:

1. **Google Antigravity CLI (`agy`)** — terminal-first Antigravity surface focused on fast local/background agents, subagents, plugins, MCP, skills, hooks, and terminal sandboxing.
2. **OpenAI Codex CLI (`codex`)** — local terminal coding agent with interactive TUI, non-interactive `exec`, review, MCP, plugins, sandbox modes, resume/fork, cloud/app integrations.
3. **Claude Code (`claude`)** — terminal coding agent with interactive and print modes, explicit permission modes, slash commands, background/agent/session management, MCP/plugins, and strong team policy controls.

## Official source URLs

### Google Antigravity CLI

- CLI overview: <https://antigravity.google/docs/cli-overview>
- CLI getting started: <https://antigravity.google/docs/cli-getting-started>
- CLI using: <https://antigravity.google/docs/cli-using>
- CLI features: <https://antigravity.google/docs/cli-features>
- Gemini CLI migration: <https://antigravity.google/docs/gcli-migration>
- Product page: <https://www.antigravity.google/product/antigravity-cli>
- CLI launch blog: <https://www.antigravity.google/blog/introducing-google-antigravity-cli>
- Antigravity 2.0 launch blog: <https://www.antigravity.google/blog/introducing-google-antigravity-2-0>
- Changelog: <https://www.antigravity.google/changelog>

Official Antigravity pages are SPA-rendered, so static line extraction is limited. I verified the public official pages plus the shipped SPA bundle text and local `agy --help`. The official product copy positions Antigravity CLI as the lightweight terminal-first surface for Antigravity agents, with background subagents, slash commands, `/agents`, `/config`, `/keybindings`, plugins, MCP, skills, hooks, and fast keyboard-driven operation.

### OpenAI Codex CLI

- Codex CLI setup page: <https://developers.openai.com/codex/cli>
- CLI features: <https://developers.openai.com/codex/cli/features>
- Command-line options/reference: <https://developers.openai.com/codex/cli/reference>
- Slash commands: <https://developers.openai.com/codex/cli/slash-commands>
- Agent approvals & security: <https://developers.openai.com/codex/agent-approvals-security>
- Official open-source repo: <https://github.com/openai/codex>
- Codex product page: <https://openai.com/codex/>

OpenAI’s Codex CLI page states that Codex CLI is OpenAI’s local terminal coding agent; it can read, change, and run code in the selected directory, is open source, and installs with `npm i -g @openai/codex`. The first run is `codex`, with ChatGPT account or API-key authentication. The docs also list interactive TUI, `/model`, image inputs/generation, local code review, subagents, web search, Codex Cloud tasks, `exec` scripting, MCP, and approval modes as CLI work areas.

### Claude Code

- Quickstart: <https://code.claude.com/docs/en/quickstart>
- Advanced setup: <https://code.claude.com/docs/en/setup>
- CLI reference: <https://code.claude.com/docs/en/cli-reference>
- Commands reference: <https://code.claude.com/docs/en/commands>
- Settings: <https://code.claude.com/docs/en/settings>
- Permissions reference: <https://code.claude.com/docs/en/permissions>
- Security: <https://code.claude.com/docs/en/security>
- Subagents reference: <https://code.claude.com/docs/en/sub-agents>
- Documentation index: <https://code.claude.com/docs/llms.txt>

Anthropic’s quickstart lists native install commands, `claude` first-run authentication, and essential daily commands (`claude`, `claude "task"`, `claude -p`, `claude -c`, `claude -r`, `/clear`, `/help`). The CLI reference expands this into background sessions, `claude agents`, `claude mcp`, plugins, remote control, auth commands, install/update, and permission/mode flags.

## Current command surface checked locally

Commands were checked on this machine because the lab will likely demonstrate locally installed tools. Treat local output as installation evidence, while the URLs above remain the source of truth.

### `agy` — Google Antigravity CLI

Local version:

```txt
agy 1.0.2
```

Top-level flags from `agy --help`:

```txt
--add-dir
-c, --continue
--conversation
--dangerously-skip-permissions
-i, --prompt-interactive
--log-file
-p, --print / --prompt
--print-timeout
--sandbox
```

Subcommands from `agy --help`:

```txt
changelog
help
install
plugin / plugins
update
```

Additional official-doc command surface from the parallel probe:

```txt
agy plugin import gemini
/config, /settings, /permissions, /model, /keybindings, /statusline,
/tasks, /skills, /mcp, /open <path>, /usage, /logout, /resume,
/rewind, /fork, /agents
? lists slash commands; ! runs terminal commands
```

Teaching notes:

- Good fit for “same task, multiple background agents” demos.
- Official docs/probe indicate plugins, skills, MCP, hooks, subagents, terminal sandbox, and allow/deny permissions.
- Local CLI currently exposes a compact shell command surface; many features are interactive slash-command features rather than top-level shell subcommands.
- Migration risk: Gemini CLI migration is not necessarily 1:1 feature parity; custom themes and some `gemini skills`-style terminal flows may not map directly.

### `codex` — OpenAI Codex CLI

Local version:

```txt
codex-cli 0.133.0
```

Top-level subcommands from `codex --help`:

```txt
exec, review, login, logout, mcp, plugin, mcp-server, app-server,
remote-control, app, completion, update, doctor, sandbox, debug,
apply, resume, fork, cloud, exec-server, features, help
```

Key flags from `codex --help` and official reference:

```txt
-m, --model
-s, --sandbox <read-only|workspace-write|danger-full-access>
-a, --ask-for-approval <untrusted|on-request|never>
-C, --cd <DIR>
--add-dir <DIR>
-i, --image <FILE>
--search
--profile / --config
--oss
--remote
--dangerously-bypass-approvals-and-sandbox / --yolo
```

Relevant slash commands from official/probe sources:

```txt
/permissions, /model, /plan, /agent, /apps, /plugins, /hooks,
/diff, /review, /mcp, /init, /resume, /fork, /side, /logout, /exit
```

Teaching notes:

- Strong fit for “controlled local agent” and “same prompt in interactive vs non-interactive mode.”
- `codex exec` and `codex review` are useful for reproducible lab tasks.
- `codex sandbox` lets the instructor explain filesystem/network boundaries without relying only on trust.
- Emphasize that sandbox and approvals are separate safety layers.

### `claude` — Claude Code

Local version:

```txt
2.1.117 (Claude Code)
```

Core CLI commands from official docs and local `claude --help`:

```txt
claude
claude "query"
claude -p "query"
cat file | claude -p "query"
claude -c
claude -r <session>
claude update / upgrade
claude install [version]
claude auth login/logout/status
claude agents
claude attach / logs / stop / rm / respawn
claude mcp
claude plugin / plugins
claude doctor
claude remote-control
claude ultrareview
```

Key flags from `claude --help` and official CLI reference:

```txt
--add-dir
--agent / --agents
--allowedTools / --disallowedTools
--permission-mode <acceptEdits|auto|bypassPermissions|default|dontAsk|plan>
--dangerously-skip-permissions
--allow-dangerously-skip-permissions
--tools
--model
--effort
--bg
--chrome
--worktree / -w
--tmux
-p, --print
-c, --continue
-r, --resume
--output-format <text|json|stream-json>
--input-format <text|stream-json>
--json-schema
--mcp-config
--settings
--strict-mcp-config
```

Relevant slash commands from official/probe sources:

```txt
/init, /memory, /mcp, /agents, /permissions, /plan, /model,
/effort, /context, /compact, /btw, /background, /batch,
/diff, /code-review, /review, /security-review, /rewind,
/resume, /branch, /run, /verify, /sandbox, /skills, /hooks, /usage
```

Teaching notes:

- Strong fit for “permission modes as operating policy” and “team onboarding via CLAUDE.md / settings.”
- Official permissions docs distinguish read-only, Bash, and file modification approval requirements.
- `plan` mode is a useful contrast against fully autonomous/bypass modes.
- Anthropic docs note command availability varies by platform, plan, and environment; `claude --help` may not list every flag.

## Constraints and risks for the lecture deck

| Tool | Constraint/risk | Slide-safe framing |
|---|---|---|
| Antigravity CLI | Official docs are SPA-rendered; static scraping may miss content. Local CLI is installed as `agy`, not `antigravity`. | Show product/docs URLs and local `agy --help` side by side. Say “verify with `agy --help` before class.” |
| Antigravity CLI | `--dangerously-skip-permissions` exists locally; probe reports terminal sandbox defaults can be configurable and may be disabled unless set. | Put dangerous bypass in a red “sandbox-only” warning callout; demo with `--sandbox` or explicit permissions. |
| Antigravity CLI | Gemini CLI migration is not 100% parity. | Teach migration as an audit checklist, not a one-command guarantee. |
| Codex CLI | `--dangerously-bypass-approvals-and-sandbox` / `--yolo` bypasses both approvals and sandbox. | Teach `read-only` / `workspace-write` first; keep bypass out of hands-on steps. |
| Codex CLI | Sandbox/approval/network behavior can differ by platform and configuration. | Use a command transcript slide that shows selected `--sandbox` and approval policy. |
| Claude Code | Free Claude.ai plan does not include Claude Code access; account/plan matters. | Add preflight account checklist. |
| Claude Code | Permissions and sandboxing are complementary, not identical; subprocess file access may require OS-level sandboxing for stronger boundaries. | Use a two-layer diagram: “CLI permission prompt” + “OS/container sandbox.” |
| All | CLI surfaces change quickly. | Put exact command output date on instructor notes and re-run `--help` before export. |

## Slide-ready suggestions for Day 2-3 Inline Agent Lab

1. **Permission Ladder Drill**
   - Same repo task in read-only/plan, auto-edit/workspace-write, and bypass modes.
   - Students compare prompts, approvals, generated diff, and risk.

2. **Three-CLI Microtask Race**
   - One safe microtask: read sample JSON and generate a markdown report.
   - Commands: `agy -p`, `codex exec`, `claude -p`.
   - Completion evidence: report artifact + command log + clean source diff.

3. **Subagent Parallelism Lab**
   - Delegate docs lookup, test failure triage, and code search to background/subagents.
   - Compare Antigravity `/agents`, Codex subagents/fork/resume, and Claude `/agents` or `claude agents`.

4. **Context Rules Lab**
   - Create minimal `AGENTS.md`, `CLAUDE.md`, and Antigravity rules/settings.
   - Re-run the same task and compare whether each tool follows local project policy.

5. **Recoverability Lab**
   - Make a safe intentional change.
   - Use `/diff`, `/review` or `/code-review`, `/rewind`/resume/fork to teach controlled iteration.

6. **Danger Flags Are Not Lab Defaults**
   - Red-card slide for `agy --dangerously-skip-permissions`, `codex --dangerously-bypass-approvals-and-sandbox`, and `claude --dangerously-skip-permissions`.
   - Pair each with safer alternatives.

## Verification evidence

- PASS — mailbox messages `48083b61-b571-401f-a730-368f893e0a3c` and `eec9e11c-1511-4538-a420-0390d5390cae` read and marked delivered.
- PASS — official-source browsing performed for Antigravity, OpenAI Codex, and Claude Code URLs listed above.
- PASS — local CLI command checks:
  - `agy --version && agy --help` -> version `1.0.2`, command surface captured.
  - `codex --version && codex --help` -> version `codex-cli 0.133.0`, command surface captured.
  - `claude --version && claude --help` -> version `2.1.117 (Claude Code)`, command surface captured.
- PASS — report file created at `google-workspace-gemini/.omx/team_reports/task-7-cli-docs.md`.
- PASS — Task 7 lifecycle claim: `omx team api claim-task --input '{"team_name":"for-the-active-ultrag-fd6c0cb9","task_id":"7","worker":"worker-2"}' --json` returned claim token `7711e667-dd36-4d02-b2b6-cbefdecdf013`.

## Delegation compliance

Subagent spawn evidence: 1 child research probe `019e6549-f43f-7420-8eed-d5e7f5d49662` checked official Antigravity, OpenAI Codex, and Claude Code sources and contributed the expanded CLI/slash-command surfaces, migration/sandbox risks, and lab suggestions integrated above.
