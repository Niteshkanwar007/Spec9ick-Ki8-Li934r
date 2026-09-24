---
name: analyze
description: "Perform technical architecture, data model, API contract, and tradeoff analysis"
workflow_step: 3
next_command: plan
author: 9icksA
extension: Spec9ick-Ki8-Li934r
---

# Command: `spec-linear analyze [issue-key-or-url]`

## Purpose
Synthesizes the Linear issue, the approved specifications, and the clarification decisions into a deep technical analysis. Evaluates architectural patterns, schema changes, API endpoints, performance bottlenecks, and failure modes.

## Workflow Rules
1. **Issue Resolution**:
   - Resolve target issue via argument, URL, or current git branch fallback.
2. **Context Ingestion**:
   - Reads the latest `Specification (v*)` and `Clarifications (v*)` comments from the Linear issue.
3. **Versioning & Non-Destructive Storage**:
   - Scan for existing comments tagged with `[Spec9ick-Ki8-Li934r] Technical Analysis (v*)`.
   - Increment version number to `v{N+1}` without modifying previous versions.
4. **Clipboard Handoff**:
   - Automatically copy `spec-linear plan <issue-key>` to your clipboard upon completion.

## Prompt Instructions & Markdown Output Format
Generate the comment body using the following Markdown structure:

```markdown
### [Spec9ick-Ki8-Li934r] Technical Analysis (v{version})
> **Stage**: 3 / 7 · **Next Step**: `spec-linear plan {issueKey}` (copied to clipboard)

#### 1. System Architecture & Component Interaction
- **Component Breakdown**: Modules, services, and libraries affected.
- **Data Flow Diagram (Text / Mermaid)**:
```text
Client / CLI -> API Gateway -> Service Domain -> Storage / Cache
```

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
```
