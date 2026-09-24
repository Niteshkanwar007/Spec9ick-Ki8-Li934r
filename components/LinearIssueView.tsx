'use client';

import React from 'react';
import {
  GitBranch,
  ExternalLink,
  MessageSquare,
  Clock,
  Copy,
  Check,
  ListOrdered,
  Sparkles,
  ArrowUpRight,
  Code2,
} from 'lucide-react';
import { LinearIssue, LinearComment, LinearChildTask, WorkflowStep } from '@/lib/types';
import { STEP_DISPLAY_NAMES } from '@/lib/workflow-constants';

interface LinearIssueViewProps {
  issue: LinearIssue | null;
  onRunImplementOnChild: (childKey: string) => void;
  onCopyText: (text: string) => void;
}

export function LinearIssueView({
  issue,
  onRunImplementOnChild,
  onCopyText,
}: LinearIssueViewProps) {
  const [copiedCommentId, setCopiedCommentId] = React.useState<string | null>(null);

  if (!issue) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/30 p-8 text-center">
        <MessageSquare className="h-10 w-10 text-neutral-600 mb-3" />
        <p className="text-sm font-medium text-neutral-300">No Linear Issue Selected</p>
        <p className="text-xs text-neutral-500 mt-1">
          Select an issue above or type a Linear issue key or URL to begin the workflow.
        </p>
      </div>
    );
  }

  const handleCopyComment = (id: string, body: string) => {
    onCopyText(body);
    setCopiedCommentId(id);
    setTimeout(() => setCopiedCommentId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Linear Issue Card Header */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-violet-400 bg-violet-950/60 border border-violet-800/40 rounded px-2 py-0.5">
              {issue.identifier}
            </span>
            <span className="text-neutral-400 text-xs">·</span>
            <span className="text-xs text-neutral-400">{issue.teamName}</span>
            <span className="text-neutral-400 text-xs">·</span>
            <div className="flex items-center gap-1.5 text-xs text-neutral-300">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: issue.state.color }}
              />
              <span>{issue.state.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <span>Open in Linear</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Issue Title */}
        <h1 className="mt-3 text-lg font-semibold text-neutral-100 tracking-tight">
          {issue.title}
        </h1>

        {/* Git Branch Metadata */}
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          <GitBranch className="h-3.5 w-3.5 text-neutral-400" />
          <span className="text-neutral-400">Canonical Linear Git Branch:</span>
          <code className="font-mono text-[11px] text-neutral-300 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
            {issue.branchName}
          </code>
        </div>

        {/* Issue Description */}
        <div className="mt-4 rounded-lg bg-neutral-950/80 p-4 border border-neutral-800/80 text-xs text-neutral-300 whitespace-pre-line leading-relaxed font-sans">
          {issue.description || '(No description provided in Linear)'}
        </div>
      </div>

      {/* Child Tasks / Sub-Issues Created via 'tasks' command */}
      {issue.children && issue.children.length > 0 && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-violet-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Linear Child Issues (Created in Stage 6)
              </h2>
              <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-mono text-neutral-300">
                {issue.children.length} tasks
              </span>
            </div>
            <span className="text-[11px] text-neutral-400">
              Branches activated only upon implementation
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-1">
            {issue.children.map((child) => (
              <div
                key={child.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950/80 p-3 text-xs hover:border-neutral-750 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-violet-300">
                      {child.identifier}
                    </span>
                    <span className="font-medium text-neutral-200">
                      {child.title}
                    </span>
                    {child.estimate && (
                      <span className="rounded bg-neutral-800 px-1.5 py-0.2 text-[10px] text-neutral-400">
                        {child.estimate} pts
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                    <GitBranch className="h-3 w-3 text-emerald-400" />
                    <span className="font-mono text-emerald-300/90">
                      {child.branchName}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onRunImplementOnChild(child.identifier)}
                  className="flex items-center justify-center gap-1.5 rounded-md bg-emerald-950/60 border border-emerald-700/50 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/60 transition-colors"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Implement & Checkout Branch</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Versioned Linear Comments Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-neutral-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Linear Comment History ({issue.comments.length})
            </h2>
          </div>
          <span className="text-[11px] text-neutral-400">
            Non-destructive audit trail · earlier versions preserved
          </span>
        </div>

        {issue.comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-800 p-8 text-center">
            <p className="text-xs text-neutral-400">
              No comments posted on this issue yet.
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Run <code className="text-violet-400 font-mono">spec-linear specify</code> above to create the initial v1 specification comment!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {issue.comments.map((comment, index) => {
              const isSpecKitComment = comment.body.includes('[Spec9ick-Ki8-Li934r]');
              const versionMatch = comment.body.match(/\(v(\d+)\)/);
              const versionNum = versionMatch ? versionMatch[1] : null;

              return (
                <div
                  key={comment.id || index}
                  className={`rounded-xl border p-4 sm:p-5 transition-all ${
                    isSpecKitComment
                      ? 'border-neutral-800 bg-neutral-900/80 shadow-xs'
                      : 'border-neutral-850 bg-neutral-950/60'
                  }`}
                >
                  {/* Comment Author Bar */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-900/60 text-violet-200 text-[10px] font-semibold">
                        {comment.userName.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-neutral-200">
                        {comment.userName}
                      </span>
                      {isSpecKitComment && (
                        <span className="rounded bg-violet-950/80 border border-violet-700/50 px-1.5 py-0.5 text-[10px] font-mono text-violet-300">
                          Spec9ick-Ki8-Li934r
                        </span>
                      )}
                      {versionNum && (
                        <span className="rounded bg-emerald-950/80 border border-emerald-700/50 px-1.5 py-0.5 text-[10px] font-mono text-emerald-300">
                          v{versionNum}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-neutral-400">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3" />
                        <span>
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyComment(comment.id, comment.body)}
                        className="rounded p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                        title="Copy comment markdown"
                      >
                        {copiedCommentId === comment.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Comment Markdown Content */}
                  <div className="mt-3 text-xs text-neutral-300 leading-relaxed font-sans whitespace-pre-line space-y-2">
                    {comment.body}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
