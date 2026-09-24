---
name: tasks
description: "Decompose plan into atomic sub-tasks, create child issues in Linear, and retrieve branch names"
workflow_step: 6
next_command: implement
author: 9icksA
extension: Spec9ick-Ki8-Li934r
---

# Command: `spec-linear tasks [issue-key-or-url]`

## Purpose
Decomposes the approved implementation plan and verification checklist into atomic, discrete developer sub-tasks. Interacts with the Linear GraphQL API to automatically create real child issues under the parent issue. Retrieves the Linear-assigned git branch names for each child issue and posts a summary comment linking all tasks. Finally, copies the next command for the first child task (`spec-linear implement <child-task-id>`) to your clipboard.

## Workflow Rules
1. **Issue Resolution**:
   - Resolve target parent issue via argument, URL, or current git branch fallback.
2. **Context Ingestion**:
   - Reads the latest `Implementation Plan (v*)` and `Quality Checklist (v*)` from parent issue comments.
3. **Child Issue Creation in Linear**:
   - For each atomic sub-task, call Linear's GraphQL `issueCreate` mutation:
     ```graphql
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
     ```
   - Provide `parentId: parentIssue.id` and `teamId: parentIssue.team.id`.
   - Capture the resulting child issue identifier and its auto-generated `branchName`.
4. **Versioning & Non-Destructive Storage**:
   - Scan for existing comments tagged with `[Spec9ick-Ki8-Li934r] Execution Tasks & Child Issues (v*)`.
   - Increment version number to `v{N+1}` without removing prior task logs.
5. **Clipboard Handoff**:
   - Automatically copy `spec-linear implement <firstChildIssueKey>` to your clipboard so you can immediately begin coding on the first sub-task.

## Prompt Instructions & Markdown Output Format
Generate the comment body using the following Markdown structure:

```markdown
### [Spec9ick-Ki8-Li934r] Execution Tasks & Child Issues (v{version})
> **Stage**: 6 / 7 · **Next Step**: `spec-linear implement {firstChildKey}` (copied to clipboard)

#### Created Child Issues in Linear
| Issue Key | Sub-Task Title | Estimate | Linear Git Branch Name | Status |
| :--- | :--- | :--- | :--- | :--- |
| **{childKey1}** | *{childTitle1}* | 2 pts | `{branchName1}` | Todo |
| **{childKey2}** | *{childTitle2}* | 3 pts | `{branchName2}` | Todo |
| **{childKey3}** | *{childTitle3}* | 2 pts | `{branchName3}` | Todo |

#### Sub-Task Dependencies & Execution Order
1. **{childKey1}**: Foundation & Schema setup (Blocks {childKey2})
2. **{childKey2}**: Core Logic implementation (Requires {childKey1})
3. **{childKey3}**: Verification & UI polish (Requires {childKey2})

> 💡 **Branch Discipline Notice**: No local or remote git branches have been created yet. Git branches will be created **only** when running `spec-linear implement <child-key>` to prevent empty or orphaned branches.
```
