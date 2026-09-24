# Spec9ick-Ki8-Li934r System Architecture

**Author**: 9icksA  
**Repository**: [Spec9ick-Ki8-Li934r](https://github.com/9icksA/Spec9ick-Ki8-Li934r)  
**Classification**: Engineering Work Sample — Spec-to-Ticket Agentic Engine  

---

## 1. System Overview & Data Flow

Spec9ick-Ki8-Li934r bridges high-level feature requirements and concrete code implementation by transforming a continuous reasoning agent into a state-tracked, structured Linear issue lifecycle.

```text
User / Developer (CLI or Agent)
               │
               ▼
┌────────────────────────────────────────┐
│ 1. Input Resolution Engine             │
│    • Linear URL (explicit)             │
│    • Issue identifier (explicit)       │
│    • Active Git branch (inferred)      │
│    • Error if unresolved (no guessing) │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│ 2. Linear GraphQL Context Fetcher      │
│    • Target issue title & description  │
│    • Existing comment history          │
│    • Current child tasks & estimates   │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│ 3. State & Version Analyzer            │
│    • Scan for [Spec9ick-Ki8-Li934r] tags│
│    • Calculate next non-destructive vN │
│    • Ingest previous stages' context   │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│ 4. Structured Reasoning Step (AI Model)│
│    • Evaluates inputs against stage MD │
│    • Generates strictly formatted spec │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│ 5. Linear GraphQL Mutator              │
│    • Append-only commentCreate (vN)    │
│    • Idempotent child issueCreate      │
│    • Extracts canonical branchName     │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│ 6. Ergonomic Clipboard Synchronization │
│    • Format next sequential command    │
│    • Place command on system clipboard │
│    • Zero manual re-typing of keys     │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│ 7. Implementation & JIT Branch Hook   │
│    • Resolves target Linear child task │
│    • Reads Linear-assigned branchName  │
│    • Creates git branch ONLY at stage 7│
└────────────────────────────────────────┘
```

---

## 2. Core Architectural Invariants

### Invariant A: Append-Only Versioning (Non-Destructive State)
- **Problem with Traditional Spec Tools**: Many tools overwrite issue descriptions or replace prior specifications. When requirements pivot or scope is clarified, the original architectural rationale and assumptions are permanently lost.
- **Spec9ick-Ki8-Li934r Solution**: The system strictly treats Linear comment history as an append-only event log.
  - Every run identifies existing comments tagged with `[Spec9ick-Ki8-Li934r] {StageName} (v*)`.
  - The next execution increments to `v{N+1}` (e.g. `v1` ➔ `v2`).
  - Prior versions (`v1`) remain completely intact for compliance, retrospective review, and diffing.

### Invariant B: Just-In-Time (JIT) Branch Activation
- **Problem with Premature Branching**: Creating git branches during initial brainstorming (`specify` or `plan`) pollutes the central repository with stale, orphaned branches for initiatives that may be deprioritized, redesigned, or merged.
- **Spec9ick-Ki8-Li934r Solution**: Branch creation is strictly deferred until Stage 7 (`implement`).
  - Stages 1–6 operate strictly in the specification and planning domain.
  - Linear generates the canonical `branchName` when the child task is created in Stage 6 (`tasks`).
  - In Stage 7 (`implement`), the developer runs `spec-linear implement <childKey>`. Only at that point does the system execute:
    ```bash
    git fetch origin main && git checkout -b <linear-assigned-branchName>
    ```
  - If a child issue does not have an assigned branch name, the system halts with a clear error rather than inventing inconsistent local branch names.

### Invariant C: Explicit Issue Resolution (No Silent Guessing)
1. **Explicit URL**: Fully qualified Linear URLs (e.g., `https://linear.app/team/issue/ENG-101/slug`) are parsed via regex.
2. **Explicit Issue Key**: Direct identifier (e.g., `ENG-101`, `PROD-402`) takes immediate precedence.
3. **Current Git Branch Fallback**: If no argument is provided, the tool reads the current branch name via `git branch --show-current` and applies the pattern `(?:feature|bugfix|fix|chore|[a-zA-Z0-9_-]+)/([A-Za-z0-9]+-\d+)`.
4. **Deterministic Failure**: If no key can be resolved from arguments or branch, the execution terminates immediately with an explicit error message directing the developer to provide an issue key. It never guesses or defaults to an arbitrary issue.

### Invariant D: Idempotent Child Task Creation
- When running `spec-linear tasks`, the engine inspects existing child tasks under the parent issue in Linear.
- If child tasks already exist with matching titles, the engine avoids generating duplicate tickets, ensuring the Linear backlog remains clean even if Stage 6 is re-evaluated.

---

## 3. Ergonomic Design: "Paste Your Way Through The Flow"

Context switching between terminal, browser, and issue trackers breaks developer flow state. Spec9ick-Ki8-Li934r resolves this with deterministic clipboard handoffs:

| Step Completed | Auto-Copied Command Placed on Clipboard | Next Action |
| :--- | :--- | :--- |
| `spec-linear specify ENG-101` | `spec-linear clarify ENG-101` | Press `Cmd+V` / `Ctrl+V` + `Enter` |
| `spec-linear clarify ENG-101` | `spec-linear analyze ENG-101` | Press `Cmd+V` / `Ctrl+V` + `Enter` |
| `spec-linear analyze ENG-101` | `spec-linear plan ENG-101` | Press `Cmd+V` / `Ctrl+V` + `Enter` |
| `spec-linear plan ENG-101` | `spec-linear checklist ENG-101` | Press `Cmd+V` / `Ctrl+V` + `Enter` |
| `spec-linear checklist ENG-101` | `spec-linear tasks ENG-101` | Press `Cmd+V` / `Ctrl+V` + `Enter` |
| `spec-linear tasks ENG-101` | `spec-linear implement ENG-101-1` | Press `Cmd+V` / `Ctrl+V` + `Enter` |
| `spec-linear implement ENG-101-1` | `git commit -m "feat: ... [fixes ENG-101-1]"` | Start code authoring |

---

## 4. Credential & Security Boundary

- **Zero Bundled Secrets**: The codebase contains zero hardcoded API keys, tokens, or personal identifiers.
- **Environment Isolation**: `LINEAR_API_KEY` is loaded exclusively from process environment variables or local ignored files (`linear-config.yml`).
- **Sandbox Decoupling**: An interactive simulated playground runs out-of-the-box with preloaded issues without requiring third-party credentials.
