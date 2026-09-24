---
name: checklist
description: "Generate exhaustive verification, test matrices, and QA acceptance criteria"
workflow_step: 5
next_command: tasks
author: 9icksA
extension: Spec9ick-Ki8-Li934r
---

# Command: `spec-linear checklist [issue-key-or-url]`

## Purpose
Builds a comprehensive QA and verification checklist directly inside Linear. Covers unit test coverage boundaries, integration contracts, end-to-end user journeys, performance thresholds, security audits, and release sign-off gates.

## Workflow Rules
1. **Issue Resolution**:
   - Resolve target issue via argument, URL, or current git branch fallback.
2. **Context Ingestion**:
   - Reads the latest `Implementation Plan (v*)` and preceding analysis from the Linear issue comments.
3. **Versioning & Non-Destructive Storage**:
   - Scan for existing comments tagged with `[Spec9ick-Ki8-Li934r] Quality Checklist (v*)`.
   - Increment version number to `v{N+1}` without removing or modifying prior checklist runs.
4. **Clipboard Handoff**:
   - Automatically copy `spec-linear tasks <issue-key>` to your clipboard upon completion.

## Prompt Instructions & Markdown Output Format
Generate the comment body using the following Markdown structure:

```markdown
### [Spec9ick-Ki8-Li934r] Quality Checklist (v{version})
> **Stage**: 5 / 7 · **Next Step**: `spec-linear tasks {issueKey}` (copied to clipboard)

#### 1. Acceptance Criteria Verification
- [ ] AC-1: Core workflow executes end-to-end with valid inputs.
- [ ] AC-2: Version numbers increment correctly when steps are re-run.
- [ ] AC-3: Previous comments remain completely intact in issue history.
- [ ] AC-4: Next command is automatically copied to system clipboard.

#### 2. Test Coverage Matrix
- [ ] **Unit Tests**: Coverage $\ge 85\%$ across core business calculation and parser units.
- [ ] **Integration Tests**: Linear API GraphQL mutations (`commentCreate`, `issueCreate`) verified against schema.
- [ ] **Edge Cases**: Malformed git branch strings, missing issue IDs, unauthenticated API states handled gracefully.

#### 3. Security, Privacy & Compliance
- [ ] No API keys, personal access tokens, or credentials checked into code or logs.
- [ ] Input sanitization applied before posting Markdown comments to avoid injection.

#### 4. Performance & Reliability Sign-Off
- [ ] End-to-end step latency stays under acceptable interactive thresholds (< 2.5s).
- [ ] Memory footprint remains clean under repeated runs.
- [ ] Release gate approved by engineering lead.
```
