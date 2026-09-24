'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Copy,
  Check,
  CornerDownLeft,
  GitBranch,
  Search,
  Sparkles,
  ClipboardCheck,
  ExternalLink,
  RotateCw,
} from 'lucide-react';
import { WorkflowStep, LinearIssue } from '@/lib/types';
import { WORKFLOW_STEPS } from '@/lib/workflow-constants';
import { resolveIssueKey } from '@/lib/issue-resolver';
import { getNextStepVersion } from '@/lib/version-tracker';

interface CommandBarProps {
  currentStep: WorkflowStep;
  activeIssue: LinearIssue | null;
  onExecuteStep: (step: WorkflowStep, customRoughIdea?: string) => Promise<void>;
  isRunning: boolean;
  copiedCommand: string | null;
  onCopyText: (text: string) => void;
  currentGitBranch: string;
  setCurrentGitBranch: (branch: string) => void;
  issueInput: string;
  setIssueInput: (val: string) => void;
  onSelectIssue: (issue: LinearIssue) => void;
  availableIssues: LinearIssue[];
}

export function CommandBar({
  currentStep,
  activeIssue,
  onExecuteStep,
  isRunning,
  copiedCommand,
  onCopyText,
  currentGitBranch,
  setCurrentGitBranch,
  issueInput,
  setIssueInput,
  onSelectIssue,
  availableIssues,
}: CommandBarProps) {
  const [showBranchDrawer, setShowBranchDrawer] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [roughIdeaPrompt, setRoughIdeaPrompt] = useState('');
  const [showIdeaDrawer, setShowIdeaDrawer] = useState(false);

  const stepMeta = WORKFLOW_STEPS.find((s) => s.id === currentStep)!;
  const resolved = resolveIssueKey(issueInput, currentGitBranch);
  const targetKey = resolved.extractedKey || activeIssue?.identifier || 'ENG-101';

  // Format current command line
  let activeCommandLine = `spec-linear ${currentStep} ${targetKey}`;
  if (currentStep === 'implement' && activeIssue?.children && activeIssue.children.length > 0) {
    activeCommandLine = `spec-linear implement ${activeIssue.children[0].identifier}`;
  }

  // Calculate next version
  const nextVersion = activeIssue ? getNextStepVersion(activeIssue.comments, currentStep) : 1;

  const handleCopy = () => {
    onCopyText(activeCommandLine);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  };

  const handleRun = () => {
    if (isRunning) return;
    onExecuteStep(currentStep, roughIdeaPrompt.trim() || undefined);
  };

  return (
    <div className="border-b border-neutral-800 bg-neutral-900/70 p-4 sm:p-5">
      <div className="mx-auto max-w-7xl space-y-3">
        {/* Top Control Bar: Issue Selector, Git Branch Fallback Indicator, and Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Issue Input & Quick Select */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-neutral-750 bg-neutral-950 px-2.5 py-1.5 text-neutral-300">
              <Search className="h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Linear URL, Key (ENG-101) or leave empty for git branch..."
                value={issueInput}
                onChange={(e) => setIssueInput(e.target.value)}
                className="w-56 sm:w-80 bg-transparent text-xs text-neutral-100 placeholder-neutral-500 focus:outline-hidden"
              />
              {resolved.extractedKey && (
                <span className="rounded bg-violet-950/80 border border-violet-700/50 px-1.5 py-0.5 text-[10px] font-mono text-violet-300">
                  {resolved.extractedKey}
                </span>
              )}
            </div>

            {/* Quick Switch Issue Dropdown / Buttons */}
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-[11px] text-neutral-400">Quick:</span>
              {availableIssues.slice(0, 3).map((iss) => (
                <button
                  key={iss.id}
                  onClick={() => {
                    setIssueInput(iss.identifier);
                    onSelectIssue(iss);
                  }}
                  className={`rounded px-2 py-0.5 text-[11px] font-mono transition-colors ${
                    activeIssue?.identifier === iss.identifier
                      ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                      : 'text-neutral-400 hover:bg-neutral-850 hover:text-neutral-300'
                  }`}
                >
                  {iss.identifier}
                </button>
              ))}
            </div>
          </div>

          {/* Git Branch Simulator Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBranchDrawer(!showBranchDrawer)}
              className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-neutral-300 hover:border-neutral-700 transition-colors"
              title="Current Git branch for automatic issue key resolution"
            >
              <GitBranch className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-neutral-400">git branch:</span>
              <span className="font-mono text-emerald-300 max-w-[140px] truncate">
                {currentGitBranch}
              </span>
            </button>

            {/* Version Preview Badge */}
            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
              <span>Next target:</span>
              <span className="rounded bg-neutral-800 border border-neutral-700 px-1.5 py-0.5 font-mono text-neutral-200">
                v{nextVersion}
              </span>
            </div>
          </div>
        </div>

        {/* Git Branch Editor Drawer (if opened) */}
        {showBranchDrawer && (
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-200">
                Simulate Current Git Branch
              </span>
              <span className="text-[11px] text-neutral-400">
                Tests automatic issue key extraction from branch names
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentGitBranch}
                onChange={(e) => setCurrentGitBranch(e.target.value)}
                placeholder="e.g. 9icksA/eng-101-webhook-engine or feature/LIN-42-cache"
                className="flex-1 rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs font-mono text-neutral-200 focus:border-violet-500 focus:outline-hidden"
              />
              <button
                onClick={() => setCurrentGitBranch('9icksA/eng-101-webhook-engine')}
                className="rounded bg-neutral-850 px-2 py-1.5 text-[11px] text-neutral-300 hover:bg-neutral-800"
              >
                Reset to ENG-101
              </button>
            </div>
          </div>
        )}

        {/* Command Line Prompt Execution Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Monospace Interactive Shell Bar */}
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-neutral-750 bg-neutral-950 px-3.5 py-2.5 shadow-inner">
            <span className="text-violet-400 font-mono text-xs select-none">$</span>
            <span className="font-mono text-xs text-neutral-100 select-all flex-1 tracking-wide">
              {activeCommandLine}
            </span>

            {/* Copy Command Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded bg-neutral-800/80 px-2 py-1 text-[11px] text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
              title="Copy command to system clipboard"
            >
              {justCopied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Action Button: Run / Execute */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold transition-all shadow-sm ${
              isRunning
                ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-violet-600 text-white hover:bg-violet-500 active:scale-[0.99]'
            }`}
          >
            {isRunning ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                <span>Generating v{nextVersion}...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>
                  Run {stepMeta.name} (v{nextVersion})
                </span>
                <CornerDownLeft className="h-3 w-3 opacity-60 ml-1 hidden sm:inline" />
              </>
            )}
          </button>
        </div>

        {/* "Paste Your Way Through The Flow" Notice & Last Copied Notification */}
        {copiedCommand && (
          <div className="flex items-center justify-between rounded-md border border-emerald-500/20 bg-emerald-950/20 px-3 py-1.5 text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <ClipboardCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-neutral-400">Next command on clipboard:</span>
              <code className="rounded bg-emerald-950/60 px-1.5 py-0.5 font-mono text-[11px] text-emerald-200 border border-emerald-800/40">
                {copiedCommand}
              </code>
            </div>
            <span className="text-[11px] text-emerald-400/80 hidden sm:inline">
              Press Cmd+V / Ctrl+V to paste through the flow
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
