'use client';

import React from 'react';
import {
  FileText,
  HelpCircle,
  Cpu,
  CalendarRange,
  CheckSquare,
  ListOrdered,
  GitBranch,
  ArrowRight,
  RotateCw,
} from 'lucide-react';
import { WorkflowStep, LinearIssue } from '@/lib/types';
import { WORKFLOW_STEPS } from '@/lib/workflow-constants';
import { getStepVersions } from '@/lib/version-tracker';

const STEP_ICONS: Record<WorkflowStep, React.ComponentType<{ className?: string }>> = {
  specify: FileText,
  clarify: HelpCircle,
  analyze: Cpu,
  plan: CalendarRange,
  checklist: CheckSquare,
  tasks: ListOrdered,
  implement: GitBranch,
};

interface WorkflowProgressProps {
  currentStep: WorkflowStep;
  onSelectStep: (step: WorkflowStep) => void;
  activeIssue: LinearIssue | null;
  isRunning: boolean;
}

export function WorkflowProgress({
  currentStep,
  onSelectStep,
  activeIssue,
  isRunning,
}: WorkflowProgressProps) {
  return (
    <div className="border-b border-neutral-800 bg-neutral-950/60 px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 scrollbar-none">
          {WORKFLOW_STEPS.map((stepMeta, index) => {
            const Icon = STEP_ICONS[stepMeta.id];
            const isCurrent = currentStep === stepMeta.id;
            const existingVersions = activeIssue
              ? getStepVersions(activeIssue.comments, stepMeta.id)
              : [];
            const hasRun = existingVersions.length > 0;
            const highestVersion = hasRun
              ? existingVersions[existingVersions.length - 1]
              : null;

            return (
              <React.Fragment key={stepMeta.id}>
                <button
                  onClick={() => onSelectStep(stepMeta.id)}
                  className={`group relative flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-all ${
                    isCurrent
                      ? 'border-violet-500/50 bg-violet-950/20 text-neutral-100 shadow-sm'
                      : hasRun
                      ? 'border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                      : 'border-neutral-850 bg-neutral-950 text-neutral-400 hover:border-neutral-800 hover:text-neutral-300'
                  }`}
                >
                  {/* Step Number & Icon */}
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-semibold ${
                      isCurrent
                        ? 'border-violet-400/50 bg-violet-900/50 text-violet-200'
                        : hasRun
                        ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  {/* Step Title & Version */}
                  <div className="flex flex-col min-w-[76px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium tracking-tight">
                        {stepMeta.name}
                      </span>
                      {highestVersion && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          v{highestVersion}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      Step {stepMeta.number} of 7
                    </span>
                  </div>

                  {/* Special indicator for branch creation */}
                  {stepMeta.createsBranch && (
                    <span className="ml-1 rounded bg-amber-950/60 border border-amber-800/40 px-1 py-0.5 text-[9px] font-mono text-amber-300">
                      Branch
                    </span>
                  )}
                </button>

                {/* Arrow connector */}
                {index < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-neutral-700 hidden lg:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
