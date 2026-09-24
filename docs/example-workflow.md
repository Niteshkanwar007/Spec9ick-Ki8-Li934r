# Example End-to-End Workflow: Webhook Ingestion Engine

> ⚠️ **Notice**: This document presents a **fictional, representative walkthrough** demonstrating how Spec9ick-Ki8-Li934r operates in practice. All issue keys, team IDs, and organization names are synthetic mock data for technical demonstration purposes.

---

## Scenario Brief
- **Target Parent Issue**: `ENG-101`
- **Feature Title**: *Add resilient webhook ingestion with exponential backoff and dead-letter queue*
- **Team**: Core Platform (`ENG`)
- **Author / Engineer**: `9icksA`

---

## Step 1: `spec-linear specify ENG-101`

### Execution Command
```bash
spec-linear specify ENG-101
# ✅ Generated [Spec9ick-Ki8-Li934r] Specification (v1)
# 📋 Copied to clipboard: spec-linear clarify ENG-101
```

### Linear Issue Comment Created
```markdown
### [Spec9ick-Ki8-Li934r] Specification (v1)
> **Stage**: 1 / 7 · **Next Step**: `spec-linear clarify ENG-101` (copied to clipboard)

#### 1. Problem Statement
- **User Problem**: Partner webhook events frequently drop during traffic surges because our HTTP receiver executes synchronous database writes.
- **Current Workaround**: Manual log inspection and SQL re-insert scripts when partners report missing events.
- **Impact**: Breaches enterprise SLA guarantees and causes data discrepancies in downstream billing accounts.

#### 2. Goals & Success Metrics
- **Primary Goal**: Asynchronous webhook receiver with immediate HTTP 202 acceptance and guaranteed at-least-once processing.
- **Key Metrics**: Receiver latency p99 < 20ms, zero lost webhook payloads up to 10,000 req/sec, automatic retry with exponential jitter.

#### 3. Core User Stories & Acceptance Boundaries
- **US-1**: As a 3rd-party webhook producer, I receive an immediate `202 Accepted` with an `X-Event-ID` header upon valid signature verification.
- **US-2**: As an SRE, I want unprocessable payloads routed to a Dead Letter Queue (DLQ) after 5 exponential retries with alerts triggered.

#### 4. Scope & Explicit Non-Goals
- **In-Scope**: HMAC-SHA256 signature verification, Redis-backed buffering queue, worker retry loop, and DLQ persistence.
- **Explicit Non-Goals**: Building a self-serve partner webhook UI portal (scheduled for Q3).

#### 5. Open Questions & Initial Assumptions
- What is the max payload size limit (assume 1MB)?
- What is the retention policy for DLQ payloads (assume 14 days)?
```

---

## Step 2: `spec-linear clarify ENG-101`

### Execution Command
```bash
# Simply press Cmd+V / Ctrl+V in terminal
spec-linear clarify ENG-101
# ✅ Generated [Spec9ick-Ki8-Li934r] Clarifications (v1)
# 📋 Copied to clipboard: spec-linear analyze ENG-101
```

### Linear Issue Comment Created
```markdown
### [Spec9ick-Ki8-Li934r] Clarifications (v1)
> **Stage**: 2 / 7 · **Next Step**: `spec-linear analyze ENG-101` (copied to clipboard)

#### 1. Requirements Disambiguation
| Ambiguity / Question | Options Considered | Decision & Rationale |
| :--- | :--- | :--- |
| **Duplicate delivery handling** | In-memory cache vs Postgres unique index vs Redis RedisSETNX | **Redis SETNX with 24-hr TTL** on `eventId`: Near-zero latency and automatically cleans up expired idempotency keys. |
| **Retry Backoff Curve** | Linear 5s intervals vs Exponential + Full Jitter | **Exponential backoff with full jitter**: base 2s, factor 2, max 5 attempts to prevent thundering herds on downstream dependencies. |
| **Signature Failures** | Return generic 400 vs explicit 401 Unauthorized | **Return HTTP 401 Unauthorized**: Prevents payload queuing and clearly signals signature mismatch to sender. |

#### 2. Edge Cases & Boundary Conditions
- **Payload Corrupted / Malformed JSON**: Immediately reject with HTTP 400; do not push to processing queue.
- **Redis Buffer Outage**: Gracefully fallback to write directly into Postgres fallback table without dropping HTTP request.
```

---

## Step 3: `spec-linear analyze ENG-101`

### Execution Command
```bash
spec-linear analyze ENG-101
# ✅ Generated [Spec9ick-Ki8-Li934r] Technical Analysis (v1)
# 📋 Copied to clipboard: spec-linear plan ENG-101
```

### Linear Issue Comment Created
```markdown
### [Spec9ick-Ki8-Li934r] Technical Analysis (v1)
> **Stage**: 3 / 7 · **Next Step**: `spec-linear plan ENG-101` (copied to clipboard)

#### 1. System Architecture & Component Interaction
```text
[Webhook Producer]
       │ (POST /api/webhooks/v1/events)
       ▼
[Edge Receiver (Fastify / Next.js API)]
  ├── 1. Verify HMAC Signature
  ├── 2. Check Idempotency Key (Redis SETNX)
  ├── 3. Enqueue to BullMQ Queue (`webhooks_inbound`)
  └── 4. Return HTTP 202 Accepted (Latency ~12ms)
       │
[BullMQ Worker Pool]
  ├── 1. Dequeue job
  ├── 2. Dispatch to registered handler
  ├── 3. On failure: Exponential backoff (max 5 retries)
  └── 4. Exhausted retries -> Dead Letter Queue Table (Postgres)
```

#### 2. Data Models & Schema Design
```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(128) NOT NULL,
  source VARCHAR(64) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'received',
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_event_source_id UNIQUE (source, event_id)
);
CREATE INDEX idx_webhook_status_created ON webhook_events (status, created_at);
```
```

---

## Step 4: `spec-linear plan ENG-101`

### Execution Command
```bash
spec-linear plan ENG-101
# ✅ Generated [Spec9ick-Ki8-Li934r] Implementation Plan (v1)
# 📋 Copied to clipboard: spec-linear checklist ENG-101
```

### Linear Issue Comment Created
```markdown
### [Spec9ick-Ki8-Li934r] Implementation Plan (v1)
> **Stage**: 4 / 7 · **Next Step**: `spec-linear checklist ENG-101` (copied to clipboard)

#### 1. Phased Execution Roadmap
- **Phase 1: Ingestion Infrastructure & Schema**: Migration script for `webhook_events` table and Redis client integration.
- **Phase 2: Fast Ingestion Endpoint**: HTTP receiver with HMAC validation and fast 202 response.
- **Phase 3: Worker & Retry Engine**: BullMQ background processor with exponential backoff and DLQ routing.
- **Phase 4: Telemetry & Quality Gates**: Prometheus metrics for queue depth, DLQ count, and processing latency.

#### 2. Rollback Safeguards
- Feature flag `ENABLE_ASYNC_WEBHOOK_INGESTION`: When disabled, routes traffic through legacy synchronous handler.
```

---

## Step 5: `spec-linear checklist ENG-101`

### Execution Command
```bash
spec-linear checklist ENG-101
# ✅ Generated [Spec9ick-Ki8-Li934r] Quality Checklist (v1)
# 📋 Copied to clipboard: spec-linear tasks ENG-101
```

### Linear Issue Comment Created
```markdown
### [Spec9ick-Ki8-Li934r] Quality Checklist (v1)
> **Stage**: 5 / 7 · **Next Step**: `spec-linear tasks ENG-101` (copied to clipboard)

#### 1. Acceptance Criteria Verification
- [ ] Valid signature returns HTTP 202 Accepted within < 30ms.
- [ ] Invalid signature returns HTTP 401 and drops execution immediately.
- [ ] Duplicate event ID within 24 hours returns HTTP 202 without reprocessing.
- [ ] Failed downstream processing triggers retry with exponential jitter.
- [ ] Payloads failing after 5 attempts reside in `webhook_events` with status `dlq`.
```

---

## Step 6: `spec-linear tasks ENG-101`

### Execution Command
```bash
spec-linear tasks ENG-101
# ✅ Created 3 Child Issues in Linear under ENG-101
# 📋 Copied to clipboard: spec-linear implement ENG-101-1
```

### Linear Child Issues Created via GraphQL API
1. **`ENG-101-1`**: *Webhook Persistence & Redis Queue Setup*  
   - Branch: `9icksA/eng-101-1-webhook-persistence-redis-queue-setup`  
   - Estimate: 2 points  
   - Parent: `ENG-101`
2. **`ENG-101-2`**: *Fast HTTP Receiver & HMAC Authentication Handler*  
   - Branch: `9icksA/eng-101-2-fast-http-receiver-hmac-auth`  
   - Estimate: 3 points  
   - Parent: `ENG-101`
3. **`ENG-101-3`**: *Worker Retry Engine, DLQ Routing & Observability*  
   - Branch: `9icksA/eng-101-3-worker-retry-engine-dlq-routing`  
   - Estimate: 3 points  
   - Parent: `ENG-101`

> 💡 **Notice**: No git branches were created yet. Local and remote git branches remain completely clean.

---

## Step 7: `spec-linear implement ENG-101-1`

### Execution Command
```bash
spec-linear implement ENG-101-1
```

### Just-In-Time Git Branch Activation
The branch is **only created at this exact moment**:
```bash
git fetch origin main
git checkout -b 9icksA/eng-101-1-webhook-persistence-redis-queue-setup
# Switched to a new branch '9icksA/eng-101-1-webhook-persistence-redis-queue-setup'
```

### Output Developer Guide
- **Target Child Issue**: `ENG-101-1`
- **Active Branch**: `9icksA/eng-101-1-webhook-persistence-redis-queue-setup`
- **Code Instructions**: File changes, migration SQL, and test instructions provided.
- **Conventional Commit Prepared**:
  ```bash
  git commit -m "feat(webhooks): persistence schema and Redis connection setup [fixes ENG-101-1]"
  ```
