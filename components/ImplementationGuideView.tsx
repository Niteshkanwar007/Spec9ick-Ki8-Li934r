'use client';

import React, { useState } from 'react';
import {
  GitBranch,
  Terminal,
  Copy,
  Check,
  Code2,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ShieldAlert,
} from 'lucide-react';
import { LinearIssue, LinearChildTask } from '@/lib/types';

interface ImplementationGuideViewProps {
  parentIssue: LinearIssue | null;
  targetChildTask: LinearChildTask | null;
  branchName: string;
  gitCheckoutCommand: string;
  markdownContent?: string;
  onCopyText: (text: string) => void;
}

export function ImplementationGuideView({
  parentIssue,
  targetChildTask,
  branchName,
  gitCheckoutCommand,
  markdownContent,
  onCopyText,
}: ImplementationGuideViewProps) {
  const [copiedBranch, setCopiedBranch] = useState(false);
  const [copiedCommit, setCopiedCommit] = useState(false);
  const [copiedGuide, setCopiedGuide] = useState(false);

  const issueKey = targetChildTask?.identifier || (parentIssue ? `${parentIssue.identifier}-1` : 'ENG-101-1');
  const issueTitle = targetChildTask?.title || parentIssue?.title || 'Core Implementation';
  const effectiveBranch = branchName || targetChildTask?.branchName || `9icksA/${issueKey.toLowerCase()}-task`;
  const checkoutCmd = gitCheckoutCommand || `git fetch origin main && git checkout -b ${effectiveBranch}`;
  const commitMsg = `git commit -m "feat: ${issueTitle} [fixes ${issueKey}]"`;

  const handleCopyBranch = () => {
    onCopyText(checkoutCmd);
    setCopiedBranch(true);
    setTimeout(() => setCopiedBranch(false), 2000);
  };

  const handleCopyCommit = () => {
    onCopyText(commitMsg);
    setCopiedCommit(true);
    setTimeout(() => setCopiedCommit(false), 2000);
  };

  const handleCopyGuide = () => {
    if (markdownContent) {
      onCopyText(markdownContent);
      setCopiedGuide(true);
      setTimeout(() => setCopiedGuide(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* JIT Branch Banner */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-900/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900/60 text-emerald-300">
                <GitBranch className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-sm font-semibold text-emerald-200">
                Just-In-Time Git Branch Activation
              </h2>
              <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-700/50">
                Step 7: Implement
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Branch created <strong className="text-emerald-300 font-normal">only at this implementation moment</strong> using the Linear child issue branch name. No empty branches created prematurely.
            </p>
          </div>

          <button
            onClick={handleCopyBranch}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm transition-colors"
          >
            {copiedBranch ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Git Command</span>
              </>
            )}
          </button>
        </div>

        {/* Interactive Terminal View */}
        <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between pb-2 text-[11px] text-neutral-400 border-b border-neutral-900">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              <span className="ml-2 text-neutral-400">bash — checkout branch</span>
            </div>
            <span className="text-[10px] text-neutral-400">Linear branchName source</span>
          </div>

          <div className="mt-3 space-y-1 text-neutral-300 select-all">
            <p className="text-neutral-400"># 1. Fetch latest changes and checkout child task branch</p>
            <p className="text-emerald-400 font-semibold">{checkoutCmd}</p>
            <p className="text-neutral-400 mt-2"># 2. Verify active branch</p>
            <p className="text-neutral-400">git branch --show-current</p>
            <p className="text-violet-400"># Output: {effectiveBranch}</p>
          </div>
        </div>
      </div>

      {/* Target Issue Context & Implementation Guide */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-violet-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Implementation Guide: {issueKey}
            </h3>
          </div>
          {markdownContent && (
            <button
              onClick={handleCopyGuide}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {copiedGuide ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Guide Markdown</span>
                </>
              )}
            </button>
          )}
        </div>

        {markdownContent ? (
          <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800 text-xs text-neutral-300 leading-relaxed font-sans whitespace-pre-line">
            {markdownContent}
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800 space-y-2">
              <h4 className="font-semibold text-neutral-200">
                Ready to Implement: {issueTitle}
              </h4>
              <p className="text-neutral-400">
                Run the command above or click <strong>Run Implement</strong> in the command bar to generate the full step-by-step code guidance, touched files, tests, and commit template.
              </p>
            </div>
          </div>
        )}

        {/* Ready to Commit Box */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-medium text-neutral-300">
              Conventional Linear Commit Command:
            </span>
            <code className="block font-mono text-[11px] text-violet-300">
              {commitMsg}
            </code>
          </div>
          <button
            onClick={handleCopyCommit}
            className="flex items-center gap-1 rounded bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-200 hover:bg-neutral-750 transition-colors shrink-0"
          >
            {copiedCommit ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>Copy Commit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
