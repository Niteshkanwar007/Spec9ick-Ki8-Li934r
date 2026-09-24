export interface RepoFile {
  path: string;
  category: 'workflow' | 'commands' | 'docs' | 'config';
  description: string;
  content: string;
}

export const SPEC_KIT_REPO_FILES: RepoFile[] = [
  {
    path: 'extension.yml',
    category: 'config',
    description: 'Spec-kit extension manifest defining all 7 workflow commands',
    content: `name: Spec9ick-Ki8-Li934r
version: 1.0.0
author: 9icksA
description: "Turn rough ideas into structured Linear issue workflows with versioned specs, auto-clipboard commands, child tasks, and clean branch creation."
homepage: "https://github.com/9icksA/Spec9ick-Ki8-Li934r"
repository: "https://github.com/9icksA/Spec9ick-Ki8-Li934r"
license: MIT

commands:
  - name: specify
    title: "1. Specify"
    description: "Transforms a rough idea or Linear issue into a structured product specification."
    file: commands/specify.md
    nextCommand: clarify
    readsFrom: "Linear Issue Description / Prompt"
    writesTo: "Linear Issue Comment (v{N})"

  - name: clarify
    title: "2. Clarify"
    description: "Analyzes specification versions to uncover ambiguities, edge cases, and propose concrete resolutions."
    file: commands/clarify.md
    nextCommand: analyze
    readsFrom: "Linear Issue + Specification Comment"
    writesTo: "Linear Issue Comment (v{N})"

  - name: analyze
    title: "3. Analyze"
    description: "Evaluates technical architecture, data models, API contracts, security, and performance tradeoffs."
    file: commands/analyze.md
    nextCommand: plan
    readsFrom: "Linear Issue + Clarification Comment"
    writesTo: "Linear Issue Comment (v{N})"

  - name: plan
    title: "4. Plan"
    description: "Builds a phased rollout plan, milestone sequence, migration strategy, and rollback safeguards."
    file: commands/plan.md
    nextCommand: checklist
    readsFrom: "Linear Issue + Analysis Comment"
    writesTo: "Linear Issue Comment (v{N})"

  - name: checklist
    title: "5. Checklist"
    description: "Generates an exhaustive acceptance criteria matrix, test verification checklist, and QA gates."
    file: commands/checklist.md
    nextCommand: tasks
    readsFrom: "Linear Issue + Plan Comment"
    writesTo: "Linear Issue Comment (v{N})"

  - name: tasks
    title: "6. Tasks"
    description: "Decomposes plan into atomic child tasks, creates child issues in Linear with branch names, and links them."
    file: commands/tasks.md
    nextCommand: implement
    readsFrom: "Linear Issue + Checklist Comment"
    writesTo: "Linear Child Issues + Summary Comment (v{N})"
    createsChildIssues: true

  - name: implement
    title: "7. Implement"
    description: "Creates git branch only at this stage using Linear's child task branchName, and guides development."
    file: commands/implement.md
    nextCommand: null
    readsFrom: "Linear Child Task Issue"
    writesTo: "Git Branch & Implementation Guidance"
    createsBranch: true`,
  },
  {
    path: 'linear-config.template.yml',
    category: 'config',
    description: 'Linear integration configuration template',
    content: `# Spec9ick-Ki8-Li934r Configuration Template
# Author: 9icksA
# Repository: Spec9ick-Ki8-Li934r
# Documentation: docs/usage.md

# Linear Authentication
linear:
  # Personal API Key generated in Linear: Settings > Account > Security > Personal API Keys
  apiKey: "\${LINEAR_API_KEY}"
  # Default team identifier (e.g., 'ENG', 'PROD', 'CORE')
  defaultTeamKey: "ENG"

# Workflow Versioning Discipline
workflow:
  # Header tag used to group and identify versioned stages
  commentTagPrefix: "[Spec9ick-Ki8-Li934r]"
  # Preserve older versions in comment history rather than overwriting
  preservePreviousVersions: true
  # Initial version tag when step is first executed
  initialVersion: 1

# User Handoff & Clipboard Experience
clipboard:
  # Automatically copy the next stage command into system clipboard
  autoCopyNextCommand: true
  # Command prefix format: "spec-linear" (CLI) or "/" (slash command)
  commandFormat: "spec-linear"

# Branch Creation Discipline
git:
  # Branch strategy: ONLY create git branch at the "implement" stage
  # Uses the branchName provided by the Linear child task issue
  branchStrategy: "create_on_implement_only"
  # Default branch naming template in Linear: {username}/{issueKey}-{slug}
  branchPrefix: "9icksA"
  # Regular expression to extract issue identifier from active git branch name
  branchIssueRegex: "(?:(?:feature|feat|bugfix|fix|chore|refactor|[a-zA-Z0-9_-]+)/)?([A-Za-z0-9]+-\\d+)"`,
  },
  {
    path: 'commands/specify.md',
    category: 'commands',
    description: 'Step 1: Specify command prompt template',
    content: `---
name: specify
description: "Turn a rough idea into a structured product specification inside Linear"
workflow_step: 1
next_command: clarify
author: 9icksA
extension: Spec9ick-Ki8-Li934r
---

# Command: \`spec-linear specify [issue-key-or-url]\`

## Purpose
Takes a rough concept, brief product idea, or unformatted Linear issue description and synthesizes a structured, rigorous product specification. It posts the generated specification as a versioned comment to the Linear issue and copies the next command (\`spec-linear clarify [issue]\`) to your clipboard.

## Workflow Rules
1. **Issue Resolution**:
   - If an issue key (e.g. \`LIN-101\`) or Linear URL (\`https://linear.app/.../issue/LIN-101/...\`) is supplied, use it.
   - If omitted, extract the issue key from the active git branch name using the regex \`(?:feature|bugfix|fix|chore|[a-zA-Z0-9_-]+)/([A-Za-z0-9]+-\\d+)\`.
   - If no issue exists yet, the command allows creating the initial Linear issue from the rough idea.
2. **Versioning & Non-Destructive Storage**:
   - Fetch all existing comments on the target Linear issue.
   - Scan for comments tagged with \`[Spec9ick-Ki8-Li934r] Specification (v*)\`.
   - Determine the highest existing version number \`N\`. If none exists, version is \`v1\`. Otherwise, increment to \`v{N+1}\`.
   - Never overwrite or delete previous versions; append as a new comment.
3. **Clipboard Handoff**:
   - Upon successful posting, automatically place \`spec-linear clarify <issue-key>\` onto your clipboard.

## Prompt Instructions & Markdown Output Format
Generate the comment body using the following Markdown structure:

\`\`\`markdown
### [Spec9ick-Ki8-Li934r] Specification (v{version})
> **Stage**: 1 / 7 · **Next Step**: \`spec-linear clarify {issueKey}\` (copied to clipboard)

#### 1. Problem Statement
- **User Problem**: What pain point or bottleneck does this solve?
- **Current Workaround**: How is this currently handled without this feature?
- **Impact**: Why does this matter now?

#### 2. Goals & Success Metrics
- **Primary Goal**: Clear, measurable outcome.
- **Key Metrics**: Quantifiable indicators of success (e.g. latency, error rate, adoption).

#### 3. Core User Stories
- As a [role], I want to [action], so that [outcome].
- As a [developer/admin], I want to [action], so that [outcome].

#### 4. Scope & Boundaries
- **In-Scope**: Explicitly defined features and workflows.
- **Explicit Non-Goals**: Things we intentionally will NOT do in this iteration.

#### 5. Open Questions & Initial Assumptions
- Areas requiring clarification in the next stage.
\`\`\``,
  },
  {
    path: 'commands/clarify.md',
    category: 'commands',
    description: 'Step 2: Clarify command prompt template',
    content: `---
name: clarify
description: "Resolve ambiguities, uncover edge cases, and define concrete decisions"
workflow_step: 2
next_command: analyze
author: 9icksA
extension: Spec9ick-Ki8-Li934r
---

# Command: \`spec-linear clarify [issue-key-or-url]\`

## Purpose
Reads the target Linear issue description and all previous specification versions in the issue comment history. It probes edge cases, ambiguous requirements, state transitions, security/auth boundaries, and provides definitive clarification decisions before technical architecture begins.

## Workflow Rules
1. **Issue Resolution**:
   - Resolve issue via supplied key, Linear URL, or current git branch fallback.
2. **Context Ingestion**:
   - Fetch the issue description and the most recent \`[Spec9ick-Ki8-Li934r] Specification (v*)\` comment.
   - If previous clarifications exist, review them to ensure consistency.
3. **Versioning & Non-Destructive Storage**:
   - Scan for existing comments tagged with \`[Spec9ick-Ki8-Li934r] Clarifications (v*)\`.
   - Increment version number to \`v{N+1}\` without altering or removing prior comments.
4. **Clipboard Handoff**:
   - Automatically copy \`spec-linear analyze <issue-key>\` to your clipboard upon completion.

## Prompt Instructions & Markdown Output Format
Generate the comment body using the following Markdown structure:

\`\`\`markdown
### [Spec9ick-Ki8-Li934r] Clarifications (v{version})
> **Stage**: 2 / 7 · **Next Step**: \`spec-linear analyze {issueKey}\` (copied to clipboard)

#### 1. Requirements Disambiguation
| Ambiguity / Question | Options Considered | Decision & Rationale |
| :--- | :--- | :--- |
| *e.g., How to handle rate limit spikes?* | *Option A vs Option B* | *Selected decision + justification* |
| *e.g., Data retention window?* | *30 days vs 90 days* | *Selected decision* |

#### 2. Edge Cases & Boundary Conditions
- **Empty / Null States**: Expected UI and backend behavior when data is missing or empty.
- **Concurrent Mutations**: How race conditions, conflicting writes, or duplicate requests are resolved.
- **Error Handling & Failure Degradation**: Fallback behavior when downstream services or networks timeout.

#### 3. Security, Privacy & Access Control
- **Role Permissions**: Which roles can read, write, or execute.
- **Data Sensitivity**: Any PII, tokens, or credentials that must be scrubbed or encrypted.

#### 4. Agreed Non-Functional Parameters
- Maximum acceptable latency, throughput targets, and availability SLOs.
\`\`\``,
  },
  {
    path: 'commands/analyze.md',
    category: 'commands',
    description: 'Step 3: Analyze command prompt template',
    content: `---
name: analyze
description: "Perform technical architecture, data model, API contract, and tradeoff analysis"
workflow_step: 3
next_command: plan
author: 9icksA
extension: Spec9ick-Ki8-Li934r
---

# Command: \`spec-linear analyze [issue-key-or-url]\`

## Purpose
Synthesizes the Linear issue, the approved specifications, and the clarification decisions into a deep technical analysis. Evaluates architectural patterns, schema changes, API endpoints, performance bottlenecks, and failure modes.

## Workflow Rules
1. **Issue Resolution**:
   - Resolve target issue via argument, URL, or current git branch fallback.
2. **Context Ingestion**:
   - Reads the latest \`Specification (v*)\` and \`Clarifications (v*)\` comments from the Linear issue.
3. **Versioning & Non-Destructive Storage**:
   - Scan for existing comments tagged with \`[Spec9ick-Ki8-Li934r] Technical Analysis (v*)\`.
   - Increment version number to \`v{N+1}\` without modifying previous versions.
4. **Clipboard Handoff**:
   - Automatically copy \`spec-linear plan <issue-key>\` to your clipboard upon completion.

## Prompt Instructions & Markdown Output Format
Generate the comment body using the following Markdown structure:

\`\`\`markdown
### [Spec9ick-Ki8-Li934r] Technical Analysis (v{version})
> **Stage**: 3 / 7 · **Next Step**: \`spec-linear plan {issueKey}\` (copied to clipboard)

#### 1. System Architecture & Component Interaction
- **Component Breakdown**: Modules, services, and libraries affected.
- **Data Flow Diagram (Text / Mermaid)**:
\`\`\`text
Client / CLI -> API Gateway -> Service Domain -> Storage / Cache
\`\`\`

#### 2. Data Models & Schema Design
- **Entities & Fields**: New tables, columns, or types required.
- **Index & Query Patterns**: Query access patterns and indexing strategy to avoid table scans.

#### 3. API & Interface Contracts
- **Endpoints / Methods**: Method signatures, request payloads, and response schemas.
- **Error Codes**: Structured error formats and HTTP / GraphQL status codes.

#### 4. Tradeoff Evaluation
- **Option A (Chosen)**: Benefits vs drawbacks.
- **Option B (Alternative)**: Why it was deferred or rejected.

#### 5. Scalability & Failure Modes
- **Bottlenecks**: Anticipated memory, CPU, or network constraints.
- **Resilience**: Timeouts, circuit breakers, and idempotent retry guarantees.
\`\`\``,
  },
  {
    path: 'commands/plan.md',
    category: 'commands',
    description: 'Step 4: Plan command prompt template',
    content: `---
name: plan
description: "Generate phased implementation roadmap, rollback strategies, and risk mitigations"
workflow_step: 4
next_command: checklist
author: 9icksA
extension: Spec9ick-Ki8-Li934r
---

# Command: \`spec-linear plan [issue-key-or-url]\`

## Purpose
Translates the technical analysis into a phased execution roadmap. Outlines sequencing, prerequisite milestones, zero-downtime database migrations, feature flag configurations, rollback triggers, and risk mitigation strategies.

## Workflow Rules
1. **Issue Resolution**:
   - Resolve target issue via argument, URL, or current git branch fallback.
2. **Context Ingestion**:
   - Reads the latest \`Specification (v*)\`, \`Clarifications (v*)\`, and \`Technical Analysis (v*)\` comments from the Linear issue.
3. **Versioning & Non-Destructive Storage**:
   - Scan for existing comments tagged with \`[Spec9ick-Ki8-Li934r] Implementation Plan (v*)\`.
   - Increment version number to \`v{N+1}\` without overwriting earlier plan iterations.
4. **Clipboard Handoff**:
   - Automatically copy \`spec-linear checklist <issue-key>\` to your clipboard upon completion.

## Prompt Instructions & Markdown Output Format
Generate the comment body using the following Markdown structure:

\`\`\`markdown
### [Spec9ick-Ki8-Li934r] Implementation Plan (v{version})
> **Stage**: 4 / 7 · **Next Step**: \`spec-linear checklist {issueKey}\` (copied to clipboard)

#### 1. Implementation Phases & Milestones
- **Phase 1: Foundation & Data Layer**
  - Schema migrations, seed data, base model types.
- **Phase 2: Core Domain Logic & Integrations**
  - Business logic, service layer, external API clients.
- **Phase 3: Client Interface & UX Polish**
  - Interactive UI components, CLI commands, telemetry, clipboard hooks.
- **Phase 4: Telemetry, Observability & Progressive Rollout**
  - Logging, metrics, feature flag dark launch, canary rollout.

#### 2. Backward Compatibility & Migrations
- **Expand / Contract Strategy**: How changes remain backward compatible with running clients.
- **Zero-Downtime Migration**: Execution order for database schema changes.

#### 3. Rollback Plan & Kill Switches
- **Trigger Conditions**: Error budget consumption, p99 latency spikes, or unhandled exceptions.
- **Rollback Steps**: Revert migration, disable feature flag, or deploy previous commit.

#### 4. Risks & Mitigations Matrix
| Risk | Probability | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| *API rate limit exhaustion* | Low | High | *Implement backoff and Redis token bucket cache* |
| *Empty git branch orphan* | Low | Low | *Enforce 'create branch on implement only' discipline* |
\`\`\``,
  },
  {
    path: 'commands/checklist.md',
    category: 'commands',
    description: 'Step 5: Checklist command prompt template',
    content: `---
name: checklist
description: "Generate exhaustive verification, test matrices, and QA acceptance criteria"
workflow_step: 5
next_command: tasks
author: 9icksA
extension: Spec9ick-Ki8-Li934r
---

# Command: \`spec-linear checklist [issue-key-or-url]\`

## Purpose
Builds a comprehensive QA and verification checklist directly inside Linear. Covers unit test coverage boundaries, integration contracts, end-to-end user journeys, performance thresholds, security audits, and release sign-off gates.

## Workflow Rules
1. **Issue Resolution**:
   - Resolve target issue via argument, URL, or current git branch fallback.
2. **Context Ingestion**:
   - Reads the latest \`Implementation Plan (v*)\` and preceding analysis from the Linear issue comments.
3. **Versioning & Non-Destructive Storage**:
   - Scan for existing comments tagged with \`[Spec9ick-Ki8-Li934r] Quality Checklist (v*)\`.
   - Increment version number to \`v{N+1}\` without removing or modifying prior checklist runs.
4. **Clipboard Handoff**:
   - Automatically copy \`spec-linear tasks <issue-key>\` to your clipboard upon completion.

## Prompt Instructions & Markdown Output Format
Generate the comment body using the following Markdown structure:

\`\`\`markdown
### [Spec9ick-Ki8-Li934r] Quality Checklist (v{version})
> **Stage**: 5 / 7 · **Next Step**: \`spec-linear tasks {issueKey}\` (copied to clipboard)

#### 1. Acceptance Criteria Verification
- [ ] AC-1: Core workflow executes end-to-end with valid inputs.
- [ ] AC-2: Version numbers increment correctly when steps are re-run.
- [ ] AC-3: Previous comments remain completely intact in issue history.
- [ ] AC-4: Next command is automatically copied to system clipboard.

#### 2. Test Coverage Matrix
- [ ] **Unit Tests**: Coverage >= 85% across core business calculation and parser units.
- [ ] **Integration Tests**: Linear API GraphQL mutations (\`commentCreate\`, \`issueCreate\`) verified against schema.
- [ ] **Edge Cases**: Malformed git branch strings, missing issue IDs, unauthenticated API states handled gracefully.

#### 3. Security, Privacy & Compliance
- [ ] No API keys, personal access tokens, or credentials checked into code or logs.
- [ ] Input sanitization applied before posting Markdown comments to avoid injection.

#### 4. Performance & Reliability Sign-Off
- [ ] End-to-end step latency stays under acceptable interactive thresholds (< 2.5s).
- [ ] Memory footprint remains clean under repeated runs.
- [ ] Release gate approved by engineering lead.
\`\`\``,
  },
  {
    path: 'commands/tasks.md',
    category: 'commands',
    description: 'Step 6: Tasks command prompt template',
    content: `---
name: tasks
description: "Decompose plan into atomic sub-tasks, create child issues in Linear, and retrieve branch names"
workflow_step: 6
next_command: implement
author: 9icksA
extension: Spec9ick-Ki8-Li934r
---

# Command: \`spec-linear tasks [issue-key-or-url]\`

## Purpose
Decomposes the approved implementation plan and verification checklist into atomic, discrete developer sub-tasks. Interacts with the Linear GraphQL API to automatically create real child issues under the parent issue. Retrieves the Linear-assigned git branch names for each child issue and posts a summary comment linking all tasks. Finally, copies the next command for the first child task (\`spec-linear implement <child-task-id>\`) to your clipboard.

## Workflow Rules
1. **Issue Resolution**:
   - Resolve target parent issue via argument, URL, or current git branch fallback.
2. **Context Ingestion**:
   - Reads the latest \`Implementation Plan (v*)\` and \`Quality Checklist (v*)\` from parent issue comments.
3. **Child Issue Creation in Linear**:
   - For each atomic sub-task, call Linear's GraphQL \`issueCreate\` mutation:
     \`\`\`graphql
     mutation CreateChildTask($input: IssueCreateInput!) {
       issueCreate(input: $input) {
         success
         issue {
           id
           identifier
           title
           branchName
           url
         }
       }
     }
     \`\`\`
   - Provide \`parentId: parentIssue.id\` and \`teamId: parentIssue.team.id\`.
   - Capture the resulting child issue identifier and its auto-generated \`branchName\`.
4. **Versioning & Non-Destructive Storage**:
   - Scan for existing comments tagged with \`[Spec9ick-Ki8-Li934r] Execution Tasks & Child Issues (v*)\`.
   - Increment version number to \`v{N+1}\` without removing prior task logs.
5. **Clipboard Handoff**:
   - Automatically copy \`spec-linear implement <firstChildIssueKey>\` to your clipboard so you can immediately begin coding on the first sub-task.

## Prompt Instructions & Markdown Output Format
Generate the comment body using the following Markdown structure:

\`\`\`markdown
### [Spec9ick-Ki8-Li934r] Execution Tasks & Child Issues (v{version})
> **Stage**: 6 / 7 · **Next Step**: \`spec-linear implement {firstChildKey}\` (copied to clipboard)

#### Created Child Issues in Linear
| Issue Key | Sub-Task Title | Estimate | Linear Git Branch Name | Status |
| :--- | :--- | :--- | :--- | :--- |
| **{childKey1}** | *{childTitle1}* | 2 pts | \`{branchName1}\` | Todo |
| **{childKey2}** | *{childTitle2}* | 3 pts | \`{branchName2}\` | Todo |
| **{childKey3}** | *{childTitle3}* | 2 pts | \`{branchName3}\` | Todo |

#### Sub-Task Dependencies & Execution Order
1. **{childKey1}**: Foundation & Schema setup (Blocks {childKey2})
2. **{childKey2}**: Core Logic implementation (Requires {childKey1})
3. **{childKey3}**: Verification & UI polish (Requires {childKey2})

> 💡 **Branch Discipline Notice**: No local or remote git branches have been created yet. Git branches will be created **only** when running \`spec-linear implement <child-key>\` to prevent empty or orphaned branches.
\`\`\``,
  },
  {
    path: 'commands/implement.md',
    category: 'commands',
    description: 'Step 7: Implement command prompt template',
    content: `---
name: implement
description: "Create git branch from Linear child issue and guide step-by-step implementation"
workflow_step: 7
next_command: null
author: 9icksA
extension: Spec9ick-Ki8-Li934r
creates_branch: true
---

# Command: \`spec-linear implement [issue-key-or-url]\`

## Purpose
The culmination of the specification workflow. Reads the targeted child task issue from Linear, retrieves its Linear-assigned \`branchName\`, and creates the git branch **only at this exact moment**. This prevents premature branch clutter and ensures developers never have empty, abandoned branches. It then provides focused, context-aware implementation guidance, code snippets, test execution commands, and Linear-linked commit messages.

## Workflow Rules
1. **Issue Resolution**:
   - If an issue key (e.g. \`LIN-102\`) or URL is passed, resolve it.
   - If omitted, extract the issue identifier from the current git branch name using regex \`(?:feature|bugfix|fix|chore|[a-zA-Z0-9_-]+)/([A-Za-z0-9]+-\\d+)\`.
2. **Fetch Child Issue Metadata from Linear**:
   - Query Linear GraphQL for the issue's title, description, parent issue spec context, and \`branchName\`.
3. **Just-In-Time Git Branch Creation (CRITICAL)**:
   - Check if current branch matches \`issue.branchName\`.
   - If not already on that branch, create and checkout the branch using Linear's exact branch name:
     \`\`\`bash
     git fetch origin
     git checkout -b <branchName>
     \`\`\`
4. **Implementation Guide Generation**:
   - Provide concrete file modifications, function signatures, unit test templates, and verification steps.
   - Supply ready-to-use conventional commit message referencing the Linear issue identifier.

## Prompt Instructions & Output Format
Generate the implementation guidance using the following Markdown structure:

\`\`\`markdown
# Implementation Guide: {issueIdentifier} — {issueTitle}
Parent Issue: [{parentIdentifier}]({parentUrl}) · Linear URL: [{issueIdentifier}]({issueUrl})

### 🌿 Git Branch Activation
The branch is created **only now** to prevent empty branch pollution:
\`\`\`bash
git fetch origin main
git checkout -b {branchName}
\`\`\`
*Current Active Branch: \`{branchName}\`*

---

### 🛠️ Scope of Implementation
- **Target Component**: \`{targetModuleOrFile}\`
- **Context from Parent Spec**: \`{parentGoalSummary}\`

---

### 💻 Step-by-Step Code Instructions
1. **File Modification Plan**:
   - \`src/domain/{module}.ts\`: Add core logic and validation
   - \`src/tests/{module}.test.ts\`: Add unit test coverage
2. **Code Implementation Guidance**:
   \`\`\`typescript
   export function executeTaskLogic(input: TaskInput): TaskResult {
     // Implementation fulfilling AC
   }
   \`\`\`

---

### 🧪 Test & Verification Commands
\`\`\`bash
npm run test -- --grep="{issueIdentifier}"
npm run lint
\`\`\`

---

### 📦 Ready-to-use Commit & PR
\`\`\`bash
git add .
git commit -m "feat({scope}): {issueTitle} [fixes {issueIdentifier}]"
git push -u origin {branchName}
\`\`\`
\`\`\``,
  },
  {
    path: 'docs/architecture.md',
    category: 'docs',
    description: 'Deep architectural overview, append-only versioning, and branch lifecycle',
    content: `# Spec9ick-Ki8-Li934r System Architecture

**Author**: 9icksA  
**Repository**: [Spec9ick-Ki8-Li934r](https://github.com/9icksA/Spec9ick-Ki8-Li934r)  
**Classification**: Engineering Work Sample — Spec-to-Ticket Agentic Engine  

---

## 1. System Overview & Data Flow

Spec9ick-Ki8-Li934r bridges high-level feature requirements and concrete code implementation by transforming a continuous reasoning agent into a state-tracked, structured Linear issue lifecycle.

\`\`\`text
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
\`\`\`

---

## 2. Core Architectural Invariants

### Invariant A: Append-Only Versioning (Non-Destructive State)
- The system strictly treats Linear comment history as an append-only event log.
- Every run increments to v{N+1} (e.g. v1 -> v2).
- Prior versions remain completely intact for compliance, retrospective review, and diffing.

### Invariant B: Just-In-Time (JIT) Branch Activation
- Branch creation is strictly deferred until Stage 7 (implement).
- Stages 1–6 operate strictly in the specification and planning domain.
- In Stage 7, the developer runs spec-linear implement <childKey> and checks out the branch:
  \`git fetch origin main && git checkout -b <linear-assigned-branchName>\`

### Invariant C: Explicit Issue Resolution
- Explicit URL or Key takes precedence.
- Active git branch is used as fallback.
- Fails explicitly with an informative error rather than silently guessing.

### Invariant D: Idempotent Child Task Creation
- When running tasks, the engine checks existing child task titles to prevent duplicate tickets on re-runs.`,
  },
  {
    path: 'docs/example-workflow.md',
    category: 'docs',
    description: 'Complete walkthrough of taking ENG-101 through all 7 stages (Synthetic Demo Data)',
    content: `# Example End-to-End Workflow: Webhook Ingestion Engine

> Notice: Fictional representative walkthrough demonstrating Spec9ick-Ki8-Li934r with synthetic demo data.

---

## Scenario Brief
- **Target Parent Issue**: \`ENG-101\`
- **Feature Title**: *Add resilient webhook ingestion with exponential backoff and dead-letter queue*
- **Team**: Core Platform (\`ENG\`)
- **Author**: \`9icksA\`

---

## Step 1: spec-linear specify ENG-101
- Posts \`[Spec9ick-Ki8-Li934r] Specification (v1)\` to Linear.
- Copies \`spec-linear clarify ENG-101\` to system clipboard.

## Step 2: spec-linear clarify ENG-101
- Evaluates duplicate delivery handling, retry curves, signature failures.
- Posts \`[Spec9ick-Ki8-Li934r] Clarifications (v1)\` to Linear.
- Copies \`spec-linear analyze ENG-101\` to system clipboard.

## Step 3: spec-linear analyze ENG-101
- Defines Fastify/Next API edge receiver, BullMQ queue, and Postgres schema.
- Posts \`[Spec9ick-Ki8-Li934r] Technical Analysis (v1)\` to Linear.
- Copies \`spec-linear plan ENG-101\` to system clipboard.

## Step 4: spec-linear plan ENG-101
- Builds 4 phased milestones and rollback flags.
- Posts \`[Spec9ick-Ki8-Li934r] Implementation Plan (v1)\` to Linear.
- Copies \`spec-linear checklist ENG-101\` to system clipboard.

## Step 5: spec-linear checklist ENG-101
- Formulates QA verification matrix and >85% test coverage goals.
- Posts \`[Spec9ick-Ki8-Li934r] Quality Checklist (v1)\` to Linear.
- Copies \`spec-linear tasks ENG-101\` to system clipboard.

## Step 6: spec-linear tasks ENG-101
- Creates 3 child issues in Linear:
  1. ENG-101-1: Webhook Persistence & Redis Queue (Branch: 9icksA/eng-101-1-webhook-persistence)
  2. ENG-101-2: Fast HTTP Receiver & HMAC Auth (Branch: 9icksA/eng-101-2-fast-http-receiver)
  3. ENG-101-3: Worker Retry Engine & DLQ (Branch: 9icksA/eng-101-3-worker-retry-engine)
- Notice: No git branches created yet!
- Copies \`spec-linear implement ENG-101-1\` to system clipboard.

## Step 7: spec-linear implement ENG-101-1
- Branch created ONLY NOW:
  \`git fetch origin main && git checkout -b 9icksA/eng-101-1-webhook-persistence\`
- Step-by-step developer code guide and conventional commit prepared.`,
  },
  {
    path: 'docs/usage.md',
    category: 'docs',
    description: 'Complete usage and CLI command guide',
    content: `# Spec9ick-Ki8-Li934r: Complete Usage & Technical Reference

**Author**: \`9icksA\`  
**Package**: \`Spec9ick-Ki8-Li934r\`  
**Integration Target**: Linear Issue Tracking & Git Workflow

---

## 1. Overview & Philosophy
Spec9ick-Ki8-Li934r connects spec-kit directly with Linear's GraphQL engine. It takes any rough idea, links it with a Linear issue, and guides engineering through an auditable, 7-stage specification workflow:

1. **Specify** ──► Comment v1 ──► Auto-copy \`spec-linear clarify\`
2. **Clarify** ──► Comment v1 ──► Auto-copy \`spec-linear analyze\`
3. **Analyze** ──► Comment v1 ──► Auto-copy \`spec-linear plan\`
4. **Plan** ──► Comment v1 ──► Auto-copy \`spec-linear checklist\`
5. **Checklist** ──► Comment v1 ──► Auto-copy \`spec-linear tasks\`
6. **Tasks** ──► Creates Child Issues in Linear ──► Auto-copy \`spec-linear implement\`
7. **Implement** ──► Branch created ONLY now (using Linear branchName) ──► Guided Code

---

## 2. Operational Modes
- **Interactive Sandbox Mode**: Zero credentials required. Runs against preloaded mock data for instant evaluation.
- **Live Linear Mode**: Set \`LINEAR_API_KEY\` to query and mutate your live Linear workspace with full GraphQL integration.

---

## 3. Issue Resolution Precedence
1. Explicit Linear URL
2. Explicit Issue Key
3. Current Git branch fallback
4. Deterministic error if unresolvable (no silent guessing)`,
  },
  {
    path: '.github/workflows/ci.yml',
    category: 'workflow',
    description: 'GitHub Actions Continuous Integration workflow',
    content: `name: Spec9ick-Ki8-Li934r CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  validate:
    name: Validate Spec9ick-Ki8-Li934r Commands & Templates
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run build`,
  },
  {
    path: 'README.md',
    category: 'docs',
    description: 'Project README with quickstart and architecture',
    content: `# Spec9ick-Ki8-Li934r

> Linear integration for spec-kit that turns rough ideas into structured issue workflows inside Linear with versioned specs, auto-clipboard progression, child tasks, and clean git branch activation.

**Author**: 9icksA  
**License**: MIT  
**Integration**: Linear GraphQL API  

Demonstrates an agentic spec-to-ticket workflow satisfying the client requirement for a specification -> tickets -> task-tracker system.`,
  },
  {
    path: '.gitignore',
    category: 'config',
    description: 'Git ignore rules preventing credential leaks',
    content: `# Dependencies and build outputs
node_modules/
.next/
coverage/
.DS_Store
*.log

# Environment and Secret Configurations
.env
.env.*
!.env.example

# Local Linear Config (User Secrets)
linear-config.yml
linear-config.local.yml

# IDE and OS files
.vscode/
.idea/`,
  },
  {
    path: '.editorconfig',
    category: 'config',
    description: 'EditorConfig formatting rules',
    content: `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
max_line_length = 120

[*.yml]
indent_size = 2`,
  },
  {
    path: 'CHANGELOG.md',
    category: 'docs',
    description: 'Changelog records',
    content: `# Changelog
All notable changes to Spec9ick-Ki8-Li934r by 9icksA.

## [1.0.0] - 2026-09-24
- Initial release of Spec9ick-Ki8-Li934r by 9icksA.
- 7-Stage specification workflow: specify, clarify, analyze, plan, checklist, tasks, implement.
- Linear GraphQL integration for versioned comments and child issues.
- Just-in-Time git branch creation at implement stage.
- System clipboard sync for frictionless progression.`,
  },
  {
    path: 'LICENSE',
    category: 'docs',
    description: 'MIT License (c) 2026 9icksA',
    content: `MIT License

Copyright (c) 2026 9icksA

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.`,
  },
];
