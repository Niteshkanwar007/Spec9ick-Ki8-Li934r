# Spec9ick-Ki8-Li934r

> **Linear Integration for Spec Kit**: An agentic spec-to-ticket workflow engine that transforms rough product concepts into structured, versioned Linear issue workflows, decomposed child tasks, and clean just-in-time Git branches.

[![Author](https://img.shields.io/badge/author-9icksA-blue.svg)](https://github.com/9icksA)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Linear](https://img.shields.io/badge/Linear-GraphQL%20API-5E6AD2.svg)](https://linear.app)
[![Spec Kit](https://img.shields.io/badge/Spec%20Kit-Extension%20v1.0-FF6B6B.svg)](https://github.com/github/spec-kit)

---

## What This Demonstrates

This repository is an engineering work sample demonstrating an **end-to-end agentic specification-to-ticket workflow** that bridges high-level product ideation with Linear issue tracking and Git execution.

It directly satisfies the technical client requirement:
> *“Required: a link to a repository with a similar system (spec → tickets → task tracker). Applications without a link will not be considered.”*

### Key Capabilities Demonstrated
1. **Agentic Spec-to-Ticket Pipeline**: Takes ambiguous, unformatted user ideas and progressively refines them through 7 discrete engineering stages directly recorded into Linear.
2. **True Linear GraphQL Integration**: Interacts with Linear's GraphQL API to fetch issues, post formatted versioned comments, and dynamically generate linked child issues (`issueCreate`).
3. **Ergonomic Developer Handoff**: Each stage writes the next sequential command directly to your system clipboard (`Cmd+V` / `Ctrl+V` to progress).
4. **Just-In-Time Git Branch Activation**: Git branches are created **only at the final implementation stage**, preventing abandoned, empty branches.
5. **Production-Grade Version Discipline**: All stages use an append-only versioning model (`v1`, `v2`, `v3`) in comment history so context and architectural rationale are never lost.

---

## The 7-Stage Workflow

```text
  [Rough Idea / Linear Issue]
               │
               ▼
   1. SPECIFY (commands/specify.md)
      • Synthesizes Problem Statement, Goals, User Stories, Scope Boundaries.
      • Posts [Spec9ick-Ki8-Li934r] Specification (v1) to Linear comment stream.
      • 📋 Clipboard: spec-linear clarify <issue>
               │
               ▼
   2. CLARIFY (commands/clarify.md)
      • Evaluates edge cases, rate limits, race conditions, RBAC, and data sensitivity.
      • Produces decision matrix with rationale.
      • 📋 Clipboard: spec-linear analyze <issue>
               │
               ▼
   3. ANALYZE (commands/analyze.md)
      • Architectural breakdown, data schemas, API contracts, and tradeoff analysis.
      • 📋 Clipboard: spec-linear plan <issue>
               │
               ▼
   4. PLAN (commands/plan.md)
      • Phased execution milestones, zero-downtime migrations, and rollback triggers.
      • 📋 Clipboard: spec-linear checklist <issue>
               │
               ▼
   5. CHECKLIST (commands/checklist.md)
      • Acceptance criteria matrix, unit test thresholds, and QA sign-off gates.
      • 📋 Clipboard: spec-linear tasks <issue>
               │
               ▼
   6. TASKS (commands/tasks.md)
      • Decomposes plan into atomic sub-tasks.
      • Interacts with Linear GraphQL API to CREATE real child issues under parent.
      • Extracts canonical branchName for each child task.
      • 📋 Clipboard: spec-linear implement <child-task-id>
               │
               ▼
   7. IMPLEMENT (commands/implement.md)
      • 🌿 Branch created ONLY NOW using Linear's canonical child task branchName.
      • Generates concrete file modifications, tests, and conventional commit.
```

---

## Architecture

```text
┌────────────────────────────────────────────────────────┐
│             Spec Kit CLI / Extension Host             │
│   (commands/*.md orchestrating prompt-driven stages)   │
└───────────┬────────────────────────────────────────────┘
            │ 1. Resolves issue (URL, key, or active branch)
            ▼
┌────────────────────────────────────────────────────────┐
│             Input & Context Resolver Engine            │
│   (Fetches issue state + existing comment history)     │
└───────────┬────────────────────────────────────────────┘
            │ 2. Reads existing [Spec9ick-Ki8-Li934r] tags
            ▼
┌────────────────────────────────────────────────────────┐
│             Append-Only Version Tracker                │
│   (Calculates next non-destructive version v{N+1})     │
└───────────┬────────────────────────────────────────────┘
            │ 3. Posts structured Markdown comment
            ▼
┌────────────────────────────────────────────────────────┐
│             Linear GraphQL API Integration             │
│   • commentCreate (immutable versioned audit trail)   │
│   • issueCreate   (atomic child tasks with branchName)│
└───────────┬────────────────────────────────────────────┘
            │ 4. Places next command on system clipboard
            ▼
┌────────────────────────────────────────────────────────┐
│             Ergonomic Clipboard Pipeline               │
│   (e.g., "spec-linear clarify ENG-101" ready to paste) │
└───────────┬────────────────────────────────────────────┘
            │ 5. Triggered ONLY at Stage 7 (Implement)
            ▼
┌────────────────────────────────────────────────────────┐
│             Git Branch Just-In-Time Hook               │
│   git checkout -b <linear-assigned-branchName>         │
└────────────────────────────────────────────────────────┘
```

For comprehensive architectural design details, see [docs/architecture.md](docs/architecture.md).

---

## Key Design Decisions

1. **Append-Only Versions**: Re-running a step never overwrites previous comments. It appends a new `v2`, `v3` comment, preserving technical decision evolution.
2. **Linear as Persistent Task Tracker**: Rather than maintaining a separate database, Linear serves as the single source of truth for specifications, child tasks, and statuses.
3. **Delayed Branch Creation**: Git branches are strictly created in the `implement` step. Never create empty branches for ideas that get deferred.
4. **Deterministic Issue Resolution**: Supports explicit URLs (`https://linear.app/.../issue/ENG-101`), issue keys (`ENG-101`), or automatic inference from the active git branch (`feature/ENG-101-slug`). Fails explicitly if unresolvable.
5. **Duplicate-Safe Child Tasks**: When re-running the `tasks` stage, the engine prevents duplicate tickets by checking existing child issue titles before invoking `issueCreate`.
6. **Strict Credential Separation**: No secrets are bundled. `LINEAR_API_KEY` is provided exclusively via environment variables or untracked local config.

---

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/9icksA/Spec9ick-Ki8-Li934r.git
cd Spec9ick-Ki8-Li934r
```

### 2. Configure Credentials (Optional for Demo / Required for Live Linear)
```bash
cp linear-config.template.yml linear-config.yml
# Edit linear-config.yml with your Linear API key, or export it in your shell:
export LINEAR_API_KEY="your_linear_api_key_here"
```

### 3. Run the Development / Interactive Demo Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the interactive workflow playground.

---

## Configuration

Spec9ick-Ki8-Li934r uses a secure, environment-variable-first configuration pattern:

```yaml
# linear-config.template.yml
linear:
  # User personal API key from Linear Settings > Account > Security > Personal API Keys
  apiKey: "${LINEAR_API_KEY}"
  defaultTeamKey: "ENG"

workflow:
  commentTagPrefix: "[Spec9ick-Ki8-Li934r]"
  preservePreviousVersions: true

git:
  branchStrategy: "create_on_implement_only"
  branchPrefix: "9icksA"
  branchIssueRegex: "(?:(?:feature|feat|bugfix|fix|chore|refactor|[a-zA-Z0-9_-]+)/)?([A-Za-z0-9]+-\\d+)"
```

- `linear-config.yml` and `.env` files are included in `.gitignore`.
- If no key is configured, the system operates seamlessly in **Interactive Sandbox Mode**.

---

## Operational Modes

| Feature | Interactive Sandbox / Demo Mode | Live Linear Mode |
| :--- | :--- | :--- |
| **Linear API Key** | Not required | Required (`LINEAR_API_KEY`) |
| **Workspace Connection** | Preloaded mock issues (`ENG-101`, `PROD-204`) | Queries live Linear workspace via GraphQL |
| **Comments** | Simulated in memory & previewed live | Appended as live comments on your Linear tickets |
| **Child Tasks** | Simulated with preview branch names | Created in Linear backlog with real issue keys |
| **Branch Creation** | Outputs copyable checkout command | Outputs command matching Linear's organization settings |
| **Ideal For** | Demos, evaluations, review & tests | Production team engineering workflows |

---

## Concrete Workflow Example

See [docs/example-workflow.md](docs/example-workflow.md) for a complete walkthrough of taking **ENG-101** (*Resilient Webhook Ingestion Engine*) through all 7 stages with exact Linear comments, GraphQL payloads, and generated child issues.

---

## Limitations & Boundaries

1. **Requires Spec Kit or AI Runtime**: The markdown command prompts in `commands/` are designed for Spec Kit extension hosts or LLM agents (e.g. Gemini 2.5 Flash).
2. **Linear GraphQL Schema**: Live mode requires a valid Personal API Key with read/write access to the target team.
3. **Local Git Environment**: Stage 7 (`implement`) executes git commands in your local shell; git must be initialized in your project.

---

## Repository Structure

```text
├── .github/
│   └── workflows/
│       └── ci.yml                     # CI validation for commands, linting, and build
├── commands/
│   ├── specify.md                     # Step 1: Synthesize structured specification
│   ├── clarify.md                     # Step 2: Uncover edge cases & decisions
│   ├── analyze.md                     # Step 3: Technical architecture & schemas
│   ├── plan.md                        # Step 4: Phased implementation & rollback plan
│   ├── checklist.md                   # Step 5: Verification & QA checklist
│   ├── tasks.md                       # Step 6: Create Linear child issues
│   └── implement.md                   # Step 7: JIT branch creation & code guidance
├── docs/
│   ├── architecture.md                # In-depth system architecture & data flow
│   ├── example-workflow.md            # Complete walkthrough on sample issue ENG-101
│   └── usage.md                       # Complete usage and CLI command guide
├── .editorconfig                      # Consistent indentation and coding style
├── .gitignore                         # Strict exclusion for secrets, logs, and build files
├── CHANGELOG.md                       # Version history and release notes
├── extension.yml                      # Spec Kit extension manifest
├── LICENSE                            # MIT License
├── linear-config.template.yml         # Safe configuration template (placeholders only)
└── README.md                          # Repository overview and documentation
```

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.  
Developed with precision by [9icksA](https://github.com/9icksA).
