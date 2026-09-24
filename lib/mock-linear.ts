import { LinearIssue } from './types';

export const INITIAL_MOCK_ISSUES: LinearIssue[] = [
  {
    id: 'iss_eng_101',
    identifier: 'ENG-101',
    title: 'Asynchronous Webhook Ingestion Engine with Dead Letter Queue',
    description: `We need an industrial-strength webhook ingestion pipeline to process third-party events (Stripe, GitHub, Shopify).
Current issues:
- Spikes during peak sale events choke our synchronous web servers.
- When client callback endpoints return 500s or timeout, events are lost permanently.
- No visibility into retry counts or payload inspection for failing deliveries.

Target requirements:
1. Absorb high burst ingress (10,000 req/sec) with sub-50ms ack.
2. Exponential backoff retry policy (1m, 5m, 15m, 1h, 6h, 24h).
3. Dead letter queue (DLQ) after 5 failed attempts with manual replay trigger.
4. Cryptographic HMAC signature verification per tenant.`,
    branchName: '9icksA/eng-101-webhook-ingestion-engine',
    url: 'https://linear.app/9icksA-workspace/issue/ENG-101/webhook-ingestion-engine',
    state: {
      name: 'Todo',
      type: 'unstarted',
      color: '#e2e8f0',
    },
    priority: 1, // Urgent
    teamKey: 'ENG',
    teamName: 'Core Platform',
    createdAt: '2026-09-20T10:00:00Z',
    comments: [],
    children: [],
  },
  {
    id: 'iss_eng_104',
    identifier: 'ENG-104',
    title: 'Multi-tenant Tokenized Rate Limiter with Redis Sliding Windows',
    description: `Design and implement an edge rate limiter service across API gateway endpoints.
- Each tenant has tier-based quotas (Free: 60 rpm, Pro: 600 rpm, Enterprise: 6000 rpm).
- Must use sliding log or sliding window counter in Redis to prevent boundary bursting.
- Return standard RateLimit headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, Retry-After).
- Fail-open strategy if Redis cluster is temporarily unreachable, while emitting critical alerts.`,
    branchName: '9icksA/eng-104-multi-tenant-rate-limiter',
    url: 'https://linear.app/9icksA-workspace/issue/ENG-104/multi-tenant-rate-limiter',
    state: {
      name: 'In Progress',
      type: 'started',
      color: '#f59e0b',
    },
    priority: 2, // High
    teamKey: 'ENG',
    teamName: 'Core Platform',
    createdAt: '2026-09-21T14:30:00Z',
    comments: [
      {
        id: 'comm_init_1',
        userName: '9icksA (Tech Lead)',
        body: `### [Spec9ick-Ki8-Li934r] Specification (v1)
> **Stage**: 1 / 7 · **Next Step**: \`spec-linear clarify ENG-104\` (copied to clipboard)

#### 1. Problem Statement
- **User Problem**: High-volume scrapers and runaway loops degrade API latency for paying enterprise tenants.
- **Current Workaround**: Static IP rate limiting at Cloudflare level, lacking organization-tier awareness.
- **Impact**: Stabilizes infrastructure and unlocks tiered monetization.

#### 2. Goals & Success Metrics
- **Primary Goal**: Sub-2ms rate check overhead on all authenticated API requests.
- **Key Metrics**: 99.99% accuracy on window counters; zero false-positive hard drops.

#### 3. Core User Stories
- As an API consumer, I want clear \`Retry-After\` headers so my SDK can back off intelligently.
- As a tenant admin, I want real-time rate limit usage visible in my dashboard.

#### 4. Scope & Boundaries
- **In-Scope**: Sliding window algorithm, Redis cluster cluster integration, tier quotas.
- **Explicit Non-Goals**: Web application firewall (WAF) rule engine, DDoS mitigation at L4.`,
        createdAt: '2026-09-22T09:00:00Z',
        stepTag: 'specify',
        version: 1,
      },
    ],
    children: [],
  },
  {
    id: 'iss_lin_42',
    identifier: 'LIN-42',
    title: 'Zero-Downtime Distributed Cache Invalidation Engine',
    description: `Synchronize stale database cache keys across 12 globally distributed read replicas using CDC (Change Data Capture) over Kafka/Debezium.`,
    branchName: '9icksA/lin-42-distributed-cache-invalidation',
    url: 'https://linear.app/9icksA-workspace/issue/LIN-42/distributed-cache-invalidation',
    state: {
      name: 'Backlog',
      type: 'backlog',
      color: '#94a3b8',
    },
    priority: 3, // Medium
    teamKey: 'LIN',
    teamName: 'Infrastructure',
    createdAt: '2026-09-23T11:15:00Z',
    comments: [],
    children: [],
  },
];
