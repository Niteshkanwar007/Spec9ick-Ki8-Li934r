---
name: specify
description: "Turn a rough idea into a structured product specification inside Linear"
workflow_step: 1
next_command: clarify
author: 9icksA
extension: Spec9ick-Ki8-Li934r
---

# Command: `spec-linear specify [issue-key-or-url]`

## Purpose
Takes a rough concept, brief product idea, or unformatted Linear issue description and synthesizes a structured, rigorous product specification. It posts the generated specification as a versioned comment to the Linear issue and copies the next command (`spec-linear clarify [issue]`) to your clipboard.

## Workflow Rules
1. **Issue Resolution**:
   - If an issue key (e.g. `LIN-101`) or Linear URL (`https://linear.app/.../issue/LIN-101/...`) is supplied, use it.
   - If omitted, extract the issue key from the active git branch name using the regex `(?:feature|bugfix|fix|chore|[a-zA-Z0-9_-]+)/([A-Za-z0-9]+-\d+)`.
   - If no issue exists yet, the command allows creating the initial Linear issue from the rough idea.
2. **Versioning & Non-Destructive Storage**:
   - Fetch all existing comments on the target Linear issue.
   - Scan for comments tagged with `[Spec9ick-Ki8-Li934r] Specification (v*)`.
   - Determine the highest existing version number `N`. If none exists, version is `v1`. Otherwise, increment to `v{N+1}`.
   - Never overwrite or delete previous versions; append as a new comment.
3. **Clipboard Handoff**:
   - Upon successful posting, automatically place `spec-linear clarify <issue-key>` onto your clipboard.

## Prompt Instructions & Markdown Output Format
Generate the comment body using the following Markdown structure:

```markdown
### [Spec9ick-Ki8-Li934r] Specification (v{version})
> **Stage**: 1 / 7 · **Next Step**: `spec-linear clarify {issueKey}` (copied to clipboard)

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
```
