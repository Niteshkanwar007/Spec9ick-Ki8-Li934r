'use client';

import React, { useState } from 'react';
import {
  Terminal,
  GitBranch,
  Layers,
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
  Database,
  Workflow,
  Cpu,
} from 'lucide-react';
import { WORKFLOW_STEPS } from '@/lib/workflow-constants';
import { WorkflowStep } from '@/lib/types';

interface ArchitectureMapProps {
  onSelectStep: (step: WorkflowStep) => void;
}

export function ArchitectureMap({ onSelectStep }: ArchitectureMapProps) {
  const [activeNode, setActiveNode] = useState<string | null>('clipboard');

  return (
    <div className="space-y-6">
      {/* Architecture Header */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-950 text-violet-400 border border-violet-800/40">
                <Workflow className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-base font-semibold text-neutral-100">
                Spec9ick-Ki8-Li934r System Architecture
              </h2>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Interactive end-to-end data flow: Idea ➔ Linear GraphQL ➔ Versioned Comments ➔ Clipboard Handoff ➔ Just-in-Time Branch Activation.
            </p>
          </div>
          <span className="rounded-full bg-neutral-850 px-3 py-1 text-xs text-neutral-300 border border-neutral-750 self-start sm:self-auto">
            Design Pattern: Non-Destructive State Machine
          </span>
        </div>

        {/* Visual Diagram Box */}
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-6 overflow-x-auto">
          <div className="min-w-[700px] flex flex-col gap-6">
            {/* Top Level: User / CLI Input Resolution */}
            <div className="flex items-center justify-between gap-4">
              <div
                onClick={() => setActiveNode('input')}
                className={`flex-1 rounded-lg border p-4 cursor-pointer transition-all ${
                  activeNode === 'input'
                    ? 'border-violet-500 bg-violet-950/20 text-neutral-100 shadow-md'
                    : 'border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-violet-400" />
                    <span className="text-xs font-semibold">1. Input Resolution Engine</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">CLI / Prompt</span>
                </div>
                <p className="mt-2 text-[11px] text-neutral-400">
                  Accepts <strong>Linear URL</strong>, <strong>Issue Key</strong> (e.g. ENG-101), or automatically extracts key from <strong>current Git branch</strong>.
                </p>
              </div>

              <ArrowRight className="h-5 w-5 text-neutral-600 shrink-0" />

              <div
                onClick={() => setActiveNode('linear_core')}
                className={`flex-1 rounded-lg border p-4 cursor-pointer transition-all ${
                  activeNode === 'linear_core'
                    ? 'border-violet-500 bg-violet-950/20 text-neutral-100 shadow-md'
                    : 'border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-violet-400" />
                    <span className="text-xs font-semibold">2. Linear GraphQL Core</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">api.linear.app</span>
                </div>
                <p className="mt-2 text-[11px] text-neutral-400">
                  Reads issue context, scans existing comments, calculates version (v1, v2, v3), and posts versioned updates.
                </p>
              </div>
            </div>

            {/* Middle Level: 7-Stage Command Pipeline */}
            <div className="rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-4">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800 text-xs text-neutral-400">
                <span className="font-semibold text-neutral-300">
                  3. The 7-Stage Specification Workflow Sequence
                </span>
                <span>Click any stage to execute</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {WORKFLOW_STEPS.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => {
                      setActiveNode(step.id);
                      onSelectStep(step.id);
                    }}
                    className={`flex flex-col items-start rounded-md border p-2.5 text-left transition-all ${
                      activeNode === step.id
                        ? 'border-violet-500 bg-violet-950/40 text-neutral-100'
                        : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] text-neutral-400 font-mono">
                        0{step.number}
                      </span>
                      {step.createsBranch && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      )}
                    </div>
                    <span className="mt-1 text-xs font-medium text-neutral-200">
                      {step.name}
                    </span>
                    <span className="text-[9px] text-neutral-400 line-clamp-1 mt-0.5">
                      {step.id === 'implement' ? 'Branch Activation' : step.writesTo}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Level: Ergonomic Disciplines (Clipboard & Just-in-Time Branching) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setActiveNode('clipboard')}
                className={`rounded-lg border p-4 cursor-pointer transition-all ${
                  activeNode === 'clipboard'
                    ? 'border-emerald-500/80 bg-emerald-950/20 text-neutral-100 shadow-md'
                    : 'border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2 text-emerald-400">
                  <ClipboardCheck className="h-4 w-4" />
                  <span className="text-xs font-semibold">
                    &ldquo;Paste Your Way Through The Flow&rdquo; Clipboard Sync
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-neutral-400 leading-relaxed">
                  Upon completion of any stage, the tool silently places the exact next command (e.g. <code className="text-emerald-300 font-mono">spec-linear clarify ENG-101</code>) onto the developer&apos;s clipboard. You never have to re-type issue keys or step names.
                </p>
              </div>

              <div
                onClick={() => setActiveNode('jit_branch')}
                className={`rounded-lg border p-4 cursor-pointer transition-all ${
                  activeNode === 'jit_branch'
                    ? 'border-amber-500/80 bg-amber-950/20 text-neutral-100 shadow-md'
                    : 'border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2 text-amber-400">
                  <GitBranch className="h-4 w-4" />
                  <span className="text-xs font-semibold">
                    Just-In-Time Git Branch Activation (Stage 7)
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-neutral-400 leading-relaxed">
                  No branches are created during planning or ticket brainstorming. The git branch is created <strong>only</strong> when running <code className="text-amber-300 font-mono">spec-linear implement</code>, using Linear&apos;s canonical child task <code className="text-amber-300 font-mono">branchName</code>. Zero empty branches.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Detail Card for selected node */}
        <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-xs">
          <span className="font-semibold text-neutral-200">
            {activeNode === 'clipboard' && 'Clipboard Experience Deep Dive'}
            {activeNode === 'jit_branch' && 'Git Branch Discipline Deep Dive'}
            {activeNode === 'input' && 'Smart Input Resolution Rules'}
            {activeNode === 'linear_core' && 'Linear GraphQL & Versioning Rules'}
            {!['clipboard', 'jit_branch', 'input', 'linear_core'].includes(activeNode || '') && `Stage: ${activeNode?.toUpperCase()}`}
          </span>
          <p className="mt-1 text-neutral-400 leading-relaxed">
            {activeNode === 'clipboard' &&
              'Every step outputs its next logical command and writes to navigator.clipboard. This allows developers to work uninterrupted in terminal environments, stepping through: specify -> clarify -> analyze -> plan -> checklist -> tasks -> implement.'}
            {activeNode === 'jit_branch' &&
              'Premature branch creation is an anti-pattern that litters repositories with orphaned branches. By delaying branch creation until implementation, the branch name is guaranteed to reflect the exact child task assigned by Linear.'}
            {activeNode === 'input' &&
              'The tool inspects the active git branch via regex (e.g. "9icksA/eng-101-webhook-engine" -> "ENG-101"). Developers can run "spec-linear specify" with zero arguments and it immediately detects the active ticket.'}
            {activeNode === 'linear_core' &&
              'Comments are queried via Linear GraphQL. Comment tags are checked for existing versions. Re-running the same stage increments the version tag to (v2), (v3) while keeping (v1) untouched, ensuring historical decision transparency.'}
          </p>
        </div>
      </div>
    </div>
  );
}
