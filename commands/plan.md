---
name: plan
description: "Generate phased implementation roadmap, rollback strategies, and risk mitigations"
workflow_step: 4
next_command: checklist
author: 9icksA
extension: Spec9ick-Ki8-Li934r
---

# Command: `spec-linear plan [issue-key-or-url]`

## Purpose
Translates the technical analysis into a phased execution roadmap. Outlines sequencing, prerequisite milestones, zero-downtime database migrations, feature flag configurations, rollback triggers, and risk mitigation strategies.

## Workflow Rules
1. **Issue Resolution**:
   - Resolve target issue via argument, URL, or current git branch fallback.
2. **Context Ingestion**:
   - Reads the latest `Specification (v*)`, `Clarifications (v*)`, and `Technical Analysis (v*)` comments from the Linear issue.
3. **Versioning & Non-Destructive Storage**:
   - Scan for existing comments tagged with `[Spec9ick-Ki8-Li934r] Implementation Plan (v*)`.
   - Increment version number to `v{N+1}` without overwriting earlier plan iterations.
4. **Clipboard Handoff**:
   - Automatically copy `spec-linear checklist <issue-key>` to your clipboard upon completion.

## Prompt Instructions & Markdown Output Format
Generate the comment body using the following Markdown structure:

```markdown
### [Spec9ick-Ki8-Li934r] Implementation Plan (v{version})
> **Stage**: 4 / 7 · **Next Step**: `spec-linear checklist {issueKey}` (copied to clipboard)

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
```
