import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { WorkflowStep, LinearIssue, LinearChildTask, StepExecutionResult } from '@/lib/types';
import { WORKFLOW_STEPS, STEP_DISPLAY_NAMES } from '@/lib/workflow-constants';
import { getNextStepVersion, formatCommentHeader } from '@/lib/version-tracker';
import { formatLinearBranchName } from '@/lib/issue-resolver';
import { postLinearComment, createLinearChildIssue } from '@/lib/linear-api';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      step,
      issue,
      roughIdea,
      linearApiKey,
      targetChildKey,
      postToLinearDirectly = false,
    }: {
      step: WorkflowStep;
      issue: LinearIssue;
      roughIdea?: string;
      linearApiKey?: string;
      targetChildKey?: string;
      postToLinearDirectly?: boolean;
    } = body;

    if (!step || !issue) {
      return NextResponse.json({ error: 'Missing step or issue data' }, { status: 400 });
    }

    const stepMeta = WORKFLOW_STEPS.find((s) => s.id === step);
    if (!stepMeta) {
      return NextResponse.json({ error: `Unknown workflow step: ${step}` }, { status: 400 });
    }

    // Determine non-destructive version number for this step
    const version = getNextStepVersion(issue.comments || [], step);

    // Compute next command template
    let nextCommand: string | null = null;
    if (step === 'tasks') {
      // For tasks, next command will target the first created child issue
      nextCommand = `spec-linear implement ${issue.identifier}-1`;
    } else if (stepMeta.nextStep) {
      nextCommand = `spec-linear ${stepMeta.nextStep} ${issue.identifier}`;
    }

    // Build context from previous comments
    const previousCommentsSummary = (issue.comments || [])
      .map((c) => `--- Comment by ${c.userName} (${c.createdAt}) ---\n${c.body}`)
      .join('\n\n');

    let generatedBodyMarkdown = '';
    let createdTasks: LinearChildTask[] = [];
    let gitBranchName = '';
    let gitCheckoutCommand = '';

    // Specialized generation prompt per step
    const systemPrompt = `You are Spec9ick-Ki8-Li934r, an elite software engineering specification engine built by 9icksA.
Your role is to produce rigorous, production-grade technical specifications for Linear issues.
Follow these rules strictly:
1. Always be concise, highly technical, and actionable. Avoid generic placeholder filler or buzzwords.
2. Structure output cleanly in Markdown. Do not include markdown code block backticks around your entire output.
3. Keep existing decisions intact and increment upon previous comments.
4. Author tag: 9icksA. Extension: Spec9ick-Ki8-Li934r.`;

    let stepPrompt = '';

    if (step === 'specify') {
      stepPrompt = `We are running Step 1: Specify (v${version}) on Linear issue ${issue.identifier}: "${issue.title}".
Context / Rough Idea:
${roughIdea || issue.description}

Generate a comprehensive Product Specification with the following sections:
#### 1. Problem Statement
- User Problem & Current Workarounds
- Business & Technical Impact

#### 2. Goals & Success Metrics
- Concrete quantitative goals (e.g. throughput, latency, reliability)

#### 3. Core User Stories & Acceptance Boundaries
- 3 to 4 detailed user stories with acceptance criteria

#### 4. Scope & Explicit Non-Goals
- In-Scope items
- Explicit Non-Goals for this iteration

#### 5. Open Questions & Assumptions
- Assumptions made and questions for clarification in the next stage.`;
    } else if (step === 'clarify') {
      stepPrompt = `We are running Step 2: Clarify (v${version}) on Linear issue ${issue.identifier}: "${issue.title}".
Issue Description:
${issue.description}

Previous Comments & Specs on this issue:
${previousCommentsSummary}

Perform a deep disambiguation and clarify edge cases:
#### 1. Requirements Disambiguation
Provide a Markdown table with columns: | Ambiguity / Question | Options Considered | Decision & Rationale |
Include at least 3 critical engineering decisions.

#### 2. Edge Cases & Boundary Conditions
- Empty / Null / Corrupted payloads
- Concurrent mutations & race conditions
- Partial failure & network partitions

#### 3. Security, Privacy & Access Control
- Authentication, Authorization, RBAC boundaries
- Token handling and sensitive data masking

#### 4. Non-Functional Latency & Throughput Targets`;
    } else if (step === 'analyze') {
      stepPrompt = `We are running Step 3: Analyze (v${version}) on Linear issue ${issue.identifier}: "${issue.title}".
Issue Description:
${issue.description}

Previous Specifications & Clarifications:
${previousCommentsSummary}

Perform an exhaustive Technical Architecture Analysis:
#### 1. System Architecture & Component Interaction
- Components affected
- Data flow sequence (text/ASCII diagram)

#### 2. Data Models & Schema Design
- Exact entities, columns/fields, relational constraints
- Indexing strategy and query access patterns

#### 3. API & Interface Contracts
- Detailed endpoint/RPC/event payloads, response types, HTTP status codes

#### 4. Architectural Tradeoffs
- Chosen pattern vs alternative patterns evaluated

#### 5. Scalability, Failure Modes & Idempotency`;
    } else if (step === 'plan') {
      stepPrompt = `We are running Step 4: Plan (v${version}) on Linear issue ${issue.identifier}: "${issue.title}".
Technical Analysis & Specs:
${previousCommentsSummary}

Build a concrete Phased Implementation Plan:
#### 1. Phased Execution Roadmap
- **Phase 1: Foundation & Data Layer** (Schema, models, migrations)
- **Phase 2: Core Domain Logic & Integrations** (Services, business rules, API handlers)
- **Phase 3: Client UX & Integration Hooks** (Components, CLI commands, clipboard events)
- **Phase 4: Telemetry, Observability & Progressive Rollout**

#### 2. Backward Compatibility & Expand/Contract Migration Strategy

#### 3. Rollback Procedure & Kill Switches
- Concrete trigger conditions and rollback steps

#### 4. Risk Mitigation Matrix
- Table with columns: | Risk | Probability | Severity | Mitigation Strategy |`;
    } else if (step === 'checklist') {
      stepPrompt = `We are running Step 5: Checklist (v${version}) on Linear issue ${issue.identifier}: "${issue.title}".
Implementation Plan & Specs:
${previousCommentsSummary}

Generate an exhaustive Verification & Quality Assurance Checklist:
#### 1. Acceptance Criteria Checklist
- Markdown checkboxes for key functional outcomes

#### 2. Test Coverage Matrix
- Unit test targets (>85%)
- Integration test scenarios
- Edge case & fault-injection tests

#### 3. Security, Privacy & Data Integrity Sign-Off
- Checkboxes for security posture, secret isolation, sanitization

#### 4. Observability & SRE Verification
- Metrics, dashboards, logs, alert thresholds`;
    } else if (step === 'tasks') {
      stepPrompt = `We are running Step 6: Tasks (v${version}) on Linear issue ${issue.identifier}: "${issue.title}".
Implementation Plan & Quality Checklist:
${previousCommentsSummary}

Decompose this into 3 to 5 atomic developer sub-tasks suitable for Linear child issues.
Output the response in two parts:
First, a clean Markdown summary table:
#### Execution Tasks & Child Issues
| Issue Key | Sub-Task Title | Estimate | Scope Summary |
(use keys ${issue.identifier}-1, ${issue.identifier}-2, etc.)

Second, output a valid JSON block at the very end enclosed in \`\`\`json ... \`\`\` containing:
[
  {
    "keySuffix": "1",
    "title": "Sub-task title",
    "description": "2-sentence implementation brief",
    "estimate": 2,
    "slug": "kebab-case-slug"
  }
]`;
    } else if (step === 'implement') {
      // Implement stage
      const child = (issue.children || []).find((c) => c.identifier === targetChildKey) || issue.children?.[0];
      const targetKey = child?.identifier || targetChildKey || `${issue.identifier}-1`;
      const targetTitle = child?.title || `Implementation of ${issue.title}`;
      gitBranchName = child?.branchName || formatLinearBranchName('9icksA', targetKey, targetTitle);
      gitCheckoutCommand = `git fetch origin main && git checkout -b ${gitBranchName}`;

      stepPrompt = `We are running Step 7: Implement on Linear child task ${targetKey}: "${targetTitle}".
Parent Issue: ${issue.identifier} - "${issue.title}".
Assigned Git Branch: ${gitBranchName}
Parent Specs & Context:
${previousCommentsSummary}

Generate the developer implementation guide:
# Implementation Guide: ${targetKey} — ${targetTitle}

### 🌿 Git Branch Activation
\`\`\`bash
git fetch origin main
git checkout -b ${gitBranchName}
\`\`\`
*(Notice: Created ONLY now at implementation time to prevent empty branches!)*

### 🛠️ Scope of Implementation
- Target files and modules
- Specific requirements from parent specification

### 💻 Step-by-Step Code Instructions
- Concrete TypeScript / Node code snippets
- Validation & business logic implementation

### 🧪 Test Execution
\`\`\`bash
npm test -- --grep="${targetKey}"
\`\`\`

### 📦 Commit & PR Command
\`\`\`bash
git commit -m "feat: ${targetTitle} [fixes ${targetKey}]"
\`\`\``;
    }

    // Call Gemini
    let geminiResponseText = '';
    try {
      const model = 'gemini-2.5-flash';
      const response = await ai.models.generateContent({
        model,
        contents: `${systemPrompt}\n\n${stepPrompt}`,
      });
      geminiResponseText = response.text || '';
    } catch (apiErr: any) {
      console.warn('Gemini API call warning:', apiErr.message);
      // Fallback deterministic content if API key not available
      geminiResponseText = getDeterministicFallbackContent(step, version, issue, roughIdea, targetChildKey);
    }

    // If step is tasks, extract JSON child tasks if present
    if (step === 'tasks') {
      const jsonMatch = geminiResponseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          createdTasks = parsed.map((item: any, idx: number): LinearChildTask => {
            const key = `${issue.identifier}-${item.keySuffix || idx + 1}`;
            const title = item.title || `Subtask ${idx + 1}`;
            const bName = formatLinearBranchName('9icksA', key, item.slug || title);
            return {
              id: `child_${Date.now()}_${idx}`,
              identifier: key,
              title,
              description: item.description || '',
              estimate: item.estimate || 2,
              branchName: bName,
              status: 'Todo',
              url: `https://linear.app/9icksA-workspace/issue/${key}`,
            };
          });
          // Remove the raw JSON block from displayed comment markdown
          geminiResponseText = geminiResponseText.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
        } catch (parseErr) {
          console.error('Failed to parse subtasks JSON', parseErr);
        }
      }

      // If no tasks were extracted, generate fallback tasks
      if (createdTasks.length === 0) {
        createdTasks = [
          {
            id: `child_${Date.now()}_1`,
            identifier: `${issue.identifier}-1`,
            title: `Data Layer & Persistence Migration`,
            description: `Database tables, relational schema, and indexing for ${issue.title}.`,
            estimate: 2,
            branchName: formatLinearBranchName('9icksA', `${issue.identifier}-1`, 'data-layer-migration'),
            status: 'Todo',
            url: `https://linear.app/9icksA-workspace/issue/${issue.identifier}-1`,
          },
          {
            id: `child_${Date.now()}_2`,
            identifier: `${issue.identifier}-2`,
            title: `Core Business Service & Ingestion API`,
            description: `Endpoint routes, validation middleware, and service logic.`,
            estimate: 3,
            branchName: formatLinearBranchName('9icksA', `${issue.identifier}-2`, 'core-service-api'),
            status: 'Todo',
            url: `https://linear.app/9icksA-workspace/issue/${issue.identifier}-2`,
          },
          {
            id: `child_${Date.now()}_3`,
            identifier: `${issue.identifier}-3`,
            title: `Verification Tests & Quality Gates`,
            description: `Unit & integration tests, edge case coverage, and error metrics.`,
            estimate: 2,
            branchName: formatLinearBranchName('9icksA', `${issue.identifier}-3`, 'verification-tests'),
            status: 'Todo',
            url: `https://linear.app/9icksA-workspace/issue/${issue.identifier}-3`,
          },
        ];
      }

      // Update next command to target the first created child issue
      if (createdTasks[0]) {
        nextCommand = `spec-linear implement ${createdTasks[0].identifier}`;
      }
    }

    if (step === 'implement') {
      const child = (issue.children || []).find((c) => c.identifier === targetChildKey) || issue.children?.[0];
      const targetKey = child?.identifier || targetChildKey || `${issue.identifier}-1`;
      const targetTitle = child?.title || issue.title;
      gitBranchName = child?.branchName || formatLinearBranchName('9icksA', targetKey, targetTitle);
      gitCheckoutCommand = `git fetch origin main && git checkout -b ${gitBranchName}`;
    }

    // Build the full versioned comment markdown
    const fullComment = `${formatCommentHeader(step, version, stepMeta.number, nextCommand)}${geminiResponseText}`;

    // If user provided a real Linear API key and requested posting
    if (linearApiKey && postToLinearDirectly && issue.id && !issue.id.startsWith('iss_')) {
      try {
        await postLinearComment(linearApiKey, issue.id, fullComment);

        if (step === 'tasks' && createdTasks.length > 0) {
          // Prevent accidental duplicate child task creation on re-runs
          const existingChildTitles = new Set(
            (issue.children || []).map((c) => c.title.toLowerCase().trim())
          );
          for (const task of createdTasks) {
            if (existingChildTitles.has(task.title.toLowerCase().trim())) {
              continue;
            }
            await createLinearChildIssue(linearApiKey, {
              parentId: issue.id,
              teamId: issue.teamKey,
              title: task.title,
              description: task.description,
              estimate: task.estimate,
            });
          }
        }
      } catch (postErr) {
        console.error('Failed to post directly to Linear API:', postErr);
      }
    }

    const result: StepExecutionResult = {
      step,
      version,
      commentMarkdown: fullComment,
      nextCommand,
      copiedToClipboard: true,
      createdChildTasks: createdTasks.length > 0 ? createdTasks : undefined,
      branchName: gitBranchName || undefined,
      gitCheckoutCommand: gitCheckoutCommand || undefined,
      summary: `Generated ${STEP_DISPLAY_NAMES[step]} (v${version}) and copied next command to clipboard.`,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error executing spec-step:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

function getDeterministicFallbackContent(
  step: WorkflowStep,
  version: number,
  issue: LinearIssue,
  roughIdea?: string,
  targetChildKey?: string
): string {
  const idea = roughIdea || issue.description || issue.title;

  switch (step) {
    case 'specify':
      return `#### 1. Problem Statement
- **User Problem**: ${idea.slice(0, 160)}...
- **Current Workarounds**: Ad-hoc scripts and unmonitored cron jobs lacking unified observability.
- **Impact**: Elevates engineering velocity, stops production regressions, and unlocks reliable multi-tenant scale.

#### 2. Goals & Success Metrics
- **Primary Goal**: Fully automate the ${issue.title} pipeline with complete audit trails in Linear.
- **Key Metrics**: p99 latency < 45ms, zero data loss on failure, 100% test pass rate.

#### 3. Core User Stories & Acceptance Boundaries
- As a developer, I want this workflow to run seamlessly from my CLI so I can paste commands without context switching.
- As a tech lead, I want all spec revisions versioned as Linear comments so earlier context is never overwritten.

#### 4. Scope & Explicit Non-Goals
- **In-Scope**: Structured specifications, clarification tables, technical analysis, and child task decomposition.
- **Explicit Non-Goals**: Rewriting unrelated legacy monolithic models.`;

    case 'clarify':
      return `#### 1. Requirements Disambiguation
| Ambiguity / Question | Options Considered | Decision & Rationale |
| :--- | :--- | :--- |
| How to persist version history? | Overwrite comment vs append versioned comments | **Append versioned comments** (v1, v2) to preserve historical decisions |
| When to create git branches? | At task generation vs at implementation | **At implement only** using Linear child task branchName to avoid empty branches |
| Issue reference resolution? | URL vs Key vs Branch name | **Support all 3** with automatic branch name regex fallback |

#### 2. Edge Cases & Boundary Conditions
- **Missing Issue Key**: Regex auto-extracts from current active git branch (e.g. \`9icksA/eng-101-slug\`).
- **Concurrent Re-runs**: Automatically increments version tag to \`v${version + 1}\` without destroying existing comments.
- **Linear API Outages**: Gracefully falls back to interactive simulated workbench.

#### 3. Security, Privacy & Access Control
- Zero plain-text credentials stored in repository; Linear API keys kept in environment or browser memory.`;

    case 'analyze':
      return `#### 1. System Architecture & Component Interaction
\`\`\`text
[Developer / CLI] ───► [Spec9ick-Ki8-Li934r Engine] ───► [Linear GraphQL API]
         ▲                                                       │
         └───────── (Auto-Copy Next Command to Clipboard) ───────┘
\`\`\`

#### 2. Data Models & Schema Design
- Linear GraphQL Mutation: \`commentCreate(input: { issueId, body })\`
- Sub-Issue Generation: \`issueCreate(input: { parentId, teamId, title, description, estimate })\`
- Version Tag: \`[Spec9ick-Ki8-Li934r] {StepName} (v{N})\`

#### 3. Tradeoffs & Performance
- **Client-Side Clipboard Hook**: Ensures zero-latency copy upon step completion.
- **Just-In-Time Branch Activation**: Eliminates orphaned branches.`;

    case 'plan':
      return `#### 1. Phased Execution Roadmap
- **Phase 1: Foundation & Data Contracts** (Linear GraphQL mutations & schema validators)
- **Phase 2: Step Prompt Orchestration** (Gemini AI specification templates & version increments)
- **Phase 3: Clipboard Sync & UI Ergonomics** (One-click paste flows & branch generator)
- **Phase 4: Telemetry & Automated Verification**

#### 2. Risks & Mitigations Matrix
| Risk | Probability | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| Orphaned empty git branches | Medium | Low | Create branch **only** on implement step |
| Accidental comment overwrite | Low | High | Strict version increment regex scanner |`;

    case 'checklist':
      return `#### 1. Acceptance Criteria Checklist
- [x] AC-1: Generates valid versioned comments on target Linear issue
- [x] AC-2: Re-running step increments version tag (v${version}) without deleting v${Math.max(1, version - 1)}
- [x] AC-3: Automatically copies next command to user clipboard
- [x] AC-4: Extracts issue key from branch name when argument omitted
- [x] AC-5: Creates git branch only at implementation stage

#### 2. Test Coverage & Verification Matrix
- [x] Unit test for issue URL, issue key, and branch name parser
- [x] Integration test for Linear commentCreate and issueCreate mutations
- [x] End-to-end simulation of all 7 workflow stages`;

    case 'tasks':
      return `#### Execution Tasks & Child Issues
| Issue Key | Sub-Task Title | Estimate | Linear Git Branch Name | Status |
| :--- | :--- | :--- | :--- | :--- |
| **${issue.identifier}-1** | Data Layer & Schema Migration | 2 pts | \`9icksA/${issue.identifier.toLowerCase()}-1-data-migration\` | Todo |
| **${issue.identifier}-2** | Ingestion Service & API Gateway | 3 pts | \`9icksA/${issue.identifier.toLowerCase()}-2-ingestion-service\` | Todo |
| **${issue.identifier}-3** | End-to-End Quality Gates & Tests | 2 pts | \`9icksA/${issue.identifier.toLowerCase()}-3-quality-gates\` | Todo |

\`\`\`json
[
  {
    "keySuffix": "1",
    "title": "Data Layer & Schema Migration",
    "description": "Create relational models and database migrations.",
    "estimate": 2,
    "slug": "data-migration"
  },
  {
    "keySuffix": "2",
    "title": "Ingestion Service & API Gateway",
    "description": "Implement async ingestion worker with retry backoff.",
    "estimate": 3,
    "slug": "ingestion-service"
  },
  {
    "keySuffix": "3",
    "title": "End-to-End Quality Gates & Tests",
    "description": "Integration test coverage and failure recovery checks.",
    "estimate": 2,
    "slug": "quality-gates"
  }
]
\`\`\``;

    case 'implement':
      const targetKey = targetChildKey || `${issue.identifier}-1`;
      const bName = formatLinearBranchName('9icksA', targetKey, issue.title);
      return `# Implementation Guide: ${targetKey}
Parent Issue: ${issue.identifier} · Linear URL: https://linear.app/9icksA-workspace/issue/${targetKey}

### 🌿 Git Branch Activation
\`\`\`bash
git fetch origin main
git checkout -b ${bName}
\`\`\`
*(Notice: Branch is created **only now** to prevent empty branch waste!)*

### 🛠️ Scope of Implementation
- Target file: \`src/services/${issue.identifier.toLowerCase()}.ts\`
- Implement core logic according to approved specifications.

### 💻 Step-by-Step Code Instructions
\`\`\`typescript
export async function executeTask() {
  // Business logic implementation for ${targetKey}
}
\`\`\`

### 📦 Commit & PR Command
\`\`\`bash
git add .
git commit -m "feat: implement ${targetKey} [fixes ${targetKey}]"
git push -u origin ${bName}
\`\`\``;
  }
}
