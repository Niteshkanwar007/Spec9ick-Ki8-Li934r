# Spec9ick-Ki8-Li934r: Complete Usage & Technical Reference

**Author**: `9icksA`  
**Package**: `Spec9ick-Ki8-Li934r`  
**Integration Target**: Linear Issue Tracking & Git Workflow  
**Documentation**: [docs/architecture.md](architecture.md) · [docs/example-workflow.md](example-workflow.md)

---

## 1. Overview & Philosophy

Building high-quality software often breaks down in the chasm between a rough brainstorm and concrete code execution. Teams typically encounter two failure modes:
1. **Premature Implementation**: Engineers rush to write code before clarifying edge cases, schemas, and security boundaries, leading to architectural debt and rework.
2. **Empty Branch Abandonment**: Ticket trackers or tools automatically spawn git branches when tickets are created, resulting in dozens of stale, empty branches for stalled or deprioritized initiatives.

**Spec9ick-Ki8-Li934r** solves both problems. It introduces an auditable, 7-stage specification workflow connected directly to Linear via GraphQL. Every stage progressively enriches the Linear issue, preserves past versions, generates atomic child tasks, and delays git branch creation until the exact instant of implementation.

```text
Rough Idea / Linear Issue
    │
    ▼
1. Specify    ───► Linear Comment (v1) ───► Auto-copied `spec-linear clarify`
    │
    ▼
2. Clarify    ───► Linear Comment (v1) ───► Auto-copied `spec-linear analyze`
    │
    ▼
3. Analyze    ───► Linear Comment (v1) ───► Auto-copied `spec-linear plan`
    │
    ▼
4. Plan       ───► Linear Comment (v1) ───► Auto-copied `spec-linear checklist`
    │
    ▼
5. Checklist  ───► Linear Comment (v1) ───► Auto-copied `spec-linear tasks`
    │
    ▼
6. Tasks      ───► Creates Child Issues in Linear ───► Auto-copied `spec-linear implement`
    │
    ▼
7. Implement  ───► Git branch created ONLY now (Linear branchName) ───► Guided Code
```

---

## 2. Core Pillars & Guardrails

### A. Non-Destructive Versioning (Append-Only)
Whenever a step is re-run (e.g., following stakeholder feedback or requirement shifts):
- The tool reads previous comments.
- It detects existing tagged versions (`v1`, `v2`, etc.).
- It increments to `v{N+1}` and posts an additional comment.
- **Earlier versions remain completely intact**, ensuring an immutable audit trail of how technical decisions evolved.

### B. "Paste Your Way Through The Flow" Clipboard Sync
Every command outputs the next sequential command and writes it directly to your system clipboard. You can progress from specification to implementation simply by pressing `Cmd+V` (or `Ctrl+V`) and `Enter` in your terminal.

### C. Just-In-Time Git Branch Creation
- **Disciplined Rule**: Stages 1 through 6 **never** touch git branches.
- Branch creation is strictly deferred until Stage 7 (`implement`).
- In Stage 7, the command reads the Linear child task's canonical `branchName` and executes:
  ```bash
  git fetch origin main && git checkout -b <linear-assigned-branchName>
  ```
- This completely eliminates abandoned, empty branches.

### D. Deterministic Issue Resolution
All commands resolve the target issue through the following precedence:
1. **Explicit Linear URL**: `https://linear.app/{workspace}/issue/{ISSUE-KEY}/{slug}`
2. **Explicit Issue Key**: `{TEAM}-{NUMBER}` (e.g., `ENG-101`, `API-42`)
3. **Current Git Branch Fallback**: If no argument is passed, the tool inspects the active git branch using the regex:
   ```regex
   (?:(?:feature|feat|bugfix|fix|chore|refactor|[a-zA-Z0-9_-]+)/)?([A-Za-z0-9]+-\d+)
   ```
4. **Explicit Error**: If no key can be parsed and the current branch does not match an issue pattern, the CLI exits immediately with an error:
   ```text
   Error: Could not resolve Linear issue. Please provide an issue key (e.g. spec-linear specify ENG-101) or checkout an issue-linked branch.
   ```
   The tool **never silently guesses** or modifies the wrong issue.

---

## 3. Command Reference

| Step | Command | Input Source | Primary Action | Next Copied Command |
| :--- | :--- | :--- | :--- | :--- |
| **1. Specify** | `spec-linear specify [issue]` | Rough idea or Linear issue | Synthesizes formal PRD & scope | `spec-linear clarify <issue>` |
| **2. Clarify** | `spec-linear clarify [issue]` | Spec comments + issue | Uncovers edge cases & decisions | `spec-linear analyze <issue>` |
| **3. Analyze** | `spec-linear analyze [issue]` | Clarifications + spec | Architecture, schemas & tradeoffs | `spec-linear plan <issue>` |
| **4. Plan** | `spec-linear plan [issue]` | Tech analysis comments | Phased rollout & rollback plan | `spec-linear checklist <issue>` |
| **5. Checklist** | `spec-linear checklist [issue]` | Implementation plan | QA matrix & acceptance criteria | `spec-linear tasks <issue>` |
| **6. Tasks** | `spec-linear tasks [issue]` | Plan + checklist | Creates Linear child issues idempotently | `spec-linear implement <child>` |
| **7. Implement** | `spec-linear implement [child]`| Child issue metadata | Creates git branch & guides code | *(Complete)* |

---

## 4. Operational Modes: Sandbox vs. Live Linear

### Sandbox / Interactive Demo Mode
- Runs without any external credentials or network dependencies.
- Features realistic preloaded sample issues (`ENG-101`, `PROD-204`).
- Simulates Linear's GraphQL responses, comment threading, child issue decomposition, and branch name formatting.
- Perfect for evaluating the workflow, reviewing outputs, and trying the clipboard progression.

### Live Linear Integration Mode
- Requires a user-supplied personal access token:
  ```bash
  export LINEAR_API_KEY="lin_api_your_actual_token_here"
  ```
- Reads live issues from your Linear team workspace.
- Mutates the real issue by appending versioned comments via Linear GraphQL `commentCreate`.
- Creates real child issues under the parent issue via `issueCreate`.
- Pulls Linear's exact `branchName` format defined in your organization's settings.

---

## 5. Security & Configuration Best Practices

1. **Never commit secrets**: `linear-config.yml` and `.env` are included in `.gitignore`.
2. **Template copy**:
   ```bash
   cp linear-config.template.yml linear-config.yml
   ```
3. **Environment variable alternative**:
   Set `LINEAR_API_KEY` in your shell profile (`~/.zshrc` or `~/.bashrc`).
