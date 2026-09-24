---
name: implement
description: "Create git branch from Linear child issue and guide step-by-step implementation"
workflow_step: 7
next_command: null
author: 9icksA
extension: Spec9ick-Ki8-Li934r
creates_branch: true
---

# Command: `spec-linear implement [issue-key-or-url]`

## Purpose
The culmination of the specification workflow. Reads the targeted child task issue from Linear, retrieves its Linear-assigned `branchName`, and creates the git branch **only at this exact moment**. This prevents premature branch clutter and ensures developers never have empty, abandoned branches. It then provides focused, context-aware implementation guidance, code snippets, test execution commands, and Linear-linked commit messages.

## Workflow Rules
1. **Issue Resolution**:
   - If an issue key (e.g. `LIN-102`) or URL is passed, resolve it.
   - If omitted, extract the issue identifier from the current git branch name using regex `(?:feature|bugfix|fix|chore|[a-zA-Z0-9_-]+)/([A-Za-z0-9]+-\d+)`.
2. **Fetch Child Issue Metadata from Linear**:
   - Query Linear GraphQL for the issue's title, description, parent issue spec context, and `branchName`.
     ```graphql
     query GetChildIssue($id: String!) {
       issue(id: $id) {
         id
         identifier
         title
         description
         branchName
         url
         parent {
           id
           identifier
           title
         }
       }
     }
     ```
3. **Just-In-Time Git Branch Creation (CRITICAL)**:
   - Check if current branch matches `issue.branchName`.
   - If not already on that branch, create and checkout the branch using Linear's exact branch name:
     ```bash
     git fetch origin
     git checkout -b <branchName>
     ```
   - If branch already exists locally, check it out cleanly:
     ```bash
     git checkout <branchName>
     ```
4. **Implementation Guide Generation**:
   - Provide concrete file modifications, function signatures, unit test templates, and verification steps.
   - Supply ready-to-use conventional commit message referencing the Linear issue identifier.
5. **Update Linear Status**:
   - (Optional / Configurable) Move the Linear child issue state to `In Progress`.

## Prompt Instructions & Output Format
Generate the implementation guidance using the following Markdown structure:

```markdown
# Implementation Guide: {issueIdentifier} — {issueTitle}
Parent Issue: [{parentIdentifier}]({parentUrl}) · Linear URL: [{issueIdentifier}]({issueUrl})

### 🌿 Git Branch Activation
The branch is created **only now** to prevent empty branch pollution:
```bash
git fetch origin main
git checkout -b {branchName}
```
*Current Active Branch: `{branchName}`*

---

### 🛠️ Scope of Implementation
- **Target Component**: `{targetModuleOrFile}`
- **Context from Parent Spec**: `{parentGoalSummary}`
- **Specific Acceptance Criteria**:
  - [ ] `{criterion1}`
  - [ ] `{criterion2}`

---

### 💻 Step-by-Step Code Instructions
1. **File Modification Plan**:
   - `src/domain/{module}.ts`: Add core logic and validation
   - `src/tests/{module}.test.ts`: Add unit test coverage
2. **Code Implementation Guidance**:
   ```typescript
   // Example skeleton for {issueIdentifier}
   export function executeTaskLogic(input: TaskInput): TaskResult {
     // Implementation fulfilling AC
   }
   ```

---

### 🧪 Test & Verification Commands
```bash
npm run test -- --grep="{issueIdentifier}"
npm run lint
```

---

### 📦 Ready-to-use Commit & PR
```bash
git add .
git commit -m "feat({scope}): {issueTitle} [fixes {issueIdentifier}]"
git push -u origin {branchName}
```
```
