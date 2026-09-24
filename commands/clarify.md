---
name: clarify
description: "Resolve ambiguities, uncover edge cases, and define concrete decisions"
workflow_step: 2
next_command: analyze
author: 9icksA
extension: Spec9ick-Ki8-Li934r
---

# Command: `spec-linear clarify [issue-key-or-url]`

## Purpose
Reads the target Linear issue description and all previous specification versions in the issue comment history. It probes edge cases, ambiguous requirements, state transitions, security/auth boundaries, and provides definitive clarification decisions before technical architecture begins.

## Workflow Rules
1. **Issue Resolution**:
   - Resolve issue via supplied key, Linear URL, or current git branch fallback.
2. **Context Ingestion**:
   - Fetch the issue description and the most recent `[Spec9ick-Ki8-Li934r] Specification (v*)` comment.
   - If previous clarifications exist, review them to ensure consistency.
3. **Versioning & Non-Destructive Storage**:
   - Scan for existing comments tagged with `[Spec9ick-Ki8-Li934r] Clarifications (v*)`.
   - Increment version number to `v{N+1}` without altering or removing prior comments.
4. **Clipboard Handoff**:
   - Automatically copy `spec-linear analyze <issue-key>` to your clipboard upon completion.

## Prompt Instructions & Markdown Output Format
Generate the comment body using the following Markdown structure:

```markdown
### [Spec9ick-Ki8-Li934r] Clarifications (v{version})
> **Stage**: 2 / 7 · **Next Step**: `spec-linear analyze {issueKey}` (copied to clipboard)

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
```
