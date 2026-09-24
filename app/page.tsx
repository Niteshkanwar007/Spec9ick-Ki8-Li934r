'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { WorkflowProgress } from '@/components/WorkflowProgress';
import { CommandBar } from '@/components/CommandBar';
import { LinearIssueView } from '@/components/LinearIssueView';
import { ImplementationGuideView } from '@/components/ImplementationGuideView';
import { ArchitectureMap } from '@/components/ArchitectureMap';
import { RepoExplorer } from '@/components/RepoExplorer';
import { LinearConfigModal } from '@/components/LinearConfigModal';
import { WorkflowStep, LinearIssue, LinearChildTask, StepExecutionResult } from '@/lib/types';
import { WORKFLOW_STEPS } from '@/lib/workflow-constants';
import { INITIAL_MOCK_ISSUES } from '@/lib/mock-linear';
import { resolveIssueKey } from '@/lib/issue-resolver';
import { Check, ClipboardCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'runner' | 'architecture' | 'files' | 'settings'>('runner');
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('specify');
  const [issues, setIssues] = useState<LinearIssue[]>(INITIAL_MOCK_ISSUES);
  const [activeIssueId, setActiveIssueId] = useState<string>(INITIAL_MOCK_ISSUES[0].id);
  const [issueInput, setIssueInput] = useState<string>('ENG-101');
  const [currentGitBranch, setCurrentGitBranch] = useState<string>('9icksA/eng-101-webhook-ingestion-engine');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [linearApiKey, setLinearApiKey] = useState<string>('');
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);

  // Implement step state
  const [selectedChildTaskKey, setSelectedChildTaskKey] = useState<string | null>(null);
  const [implementMarkdown, setImplementMarkdown] = useState<string>('');
  const [gitBranchName, setGitBranchName] = useState<string>('');
  const [gitCheckoutCommand, setGitCheckoutCommand] = useState<string>('');

  // Sync active issue derived from input or selection
  const resolved = resolveIssueKey(issueInput, currentGitBranch);
  const matchedFromInput = resolved.extractedKey
    ? issues.find((i) => i.identifier.toUpperCase() === resolved.extractedKey?.toUpperCase())
    : null;
  const activeIssue = matchedFromInput || issues.find((i) => i.id === activeIssueId) || issues[0];

  // Helper to copy text to clipboard with notification
  const handleCopyText = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedCommand(text);
    setToastMessage(`Copied to clipboard: ${text}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Switch issue when user changes input
  const handleSelectIssue = (issue: LinearIssue) => {
    setActiveIssueId(issue.id);
    setIssueInput(issue.identifier);
    setCurrentGitBranch(issue.branchName);
  };

  // Execute workflow step
  const handleExecuteStep = async (stepToRun: WorkflowStep, customRoughIdea?: string) => {
    if (!activeIssue) return;
    try {
      setIsRunning(true);

      const payload = {
        step: stepToRun,
        issue: activeIssue,
        roughIdea: customRoughIdea,
        linearApiKey: isLiveMode ? linearApiKey : undefined,
        targetChildKey: selectedChildTaskKey || undefined,
        postToLinearDirectly: isLiveMode && Boolean(linearApiKey),
      };

      const res = await fetch('/api/spec-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to execute workflow step');
      }

      const result: StepExecutionResult = await res.json();

      // Append new comment to active issue without overwriting previous comments
      const newComment = {
        id: `comm_${Date.now()}`,
        body: result.commentMarkdown,
        createdAt: new Date().toISOString(),
        userName: '9icksA (Spec Engine)',
        stepTag: stepToRun,
        version: result.version,
      };

      const updatedIssues = issues.map((iss) => {
        if (iss.id === activeIssue.id) {
          const updatedComments = [...iss.comments, newComment];
          let updatedChildren = iss.children || [];

          // If child tasks were generated
          if (result.createdChildTasks && result.createdChildTasks.length > 0) {
            updatedChildren = result.createdChildTasks;
          }

          return {
            ...iss,
            comments: updatedComments,
            children: updatedChildren,
          };
        }
        return iss;
      });

      setIssues(updatedIssues);

      // Handle step specific outputs
      if (result.branchName) {
        setGitBranchName(result.branchName);
      }
      if (result.gitCheckoutCommand) {
        setGitCheckoutCommand(result.gitCheckoutCommand);
      }
      if (stepToRun === 'implement') {
        setImplementMarkdown(result.commentMarkdown);
      }

      // Auto-copy next command to clipboard ("paste your way through the flow")
      if (result.nextCommand) {
        handleCopyText(result.nextCommand);
      }

      // If this step completed and there is a next step, prompt user or auto advance
      const stepMeta = WORKFLOW_STEPS.find((s) => s.id === stepToRun);
      if (stepMeta?.nextStep) {
        // Prepare next step
        setCurrentStep(stepMeta.nextStep);
      }
    } catch (err: any) {
      console.error('Error in handleExecuteStep:', err);
      setToastMessage(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Run implement step on a specific child task
  const handleRunImplementOnChild = (childKey: string) => {
    setSelectedChildTaskKey(childKey);
    setCurrentStep('implement');
    // Scroll or trigger implement
    const child = activeIssue?.children?.find((c) => c.identifier === childKey);
    if (child) {
      setGitBranchName(child.branchName);
      setGitCheckoutCommand(`git fetch origin main && git checkout -b ${child.branchName}`);
    }
  };

  const targetChild =
    activeIssue?.children?.find((c) => c.identifier === selectedChildTaskKey) ||
    activeIssue?.children?.[0] ||
    null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-violet-900 selection:text-violet-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-neutral-900/95 px-4 py-2.5 text-xs text-emerald-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <ClipboardCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLiveMode={isLiveMode}
        setIsLiveMode={setIsLiveMode}
        hasLinearApiKey={Boolean(linearApiKey)}
        onOpenSettings={() => setIsConfigModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="pb-16">
        {activeTab === 'runner' && (
          <div className="space-y-0">
            {/* Step Progress Bar */}
            <WorkflowProgress
              currentStep={currentStep}
              onSelectStep={setCurrentStep}
              activeIssue={activeIssue}
              isRunning={isRunning}
            />

            {/* Interactive Command Runner */}
            <CommandBar
              currentStep={currentStep}
              activeIssue={activeIssue}
              onExecuteStep={handleExecuteStep}
              isRunning={isRunning}
              copiedCommand={copiedCommand}
              onCopyText={handleCopyText}
              currentGitBranch={currentGitBranch}
              setCurrentGitBranch={setCurrentGitBranch}
              issueInput={issueInput}
              setIssueInput={setIssueInput}
              onSelectIssue={handleSelectIssue}
              availableIssues={issues}
            />

            {/* Workflow Workspace Main Views */}
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              {currentStep === 'implement' ? (
                <ImplementationGuideView
                  parentIssue={activeIssue}
                  targetChildTask={targetChild}
                  branchName={gitBranchName || targetChild?.branchName || activeIssue?.branchName || ''}
                  gitCheckoutCommand={gitCheckoutCommand}
                  markdownContent={implementMarkdown}
                  onCopyText={handleCopyText}
                />
              ) : (
                <LinearIssueView
                  issue={activeIssue}
                  onRunImplementOnChild={handleRunImplementOnChild}
                  onCopyText={handleCopyText}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <ArchitectureMap
              onSelectStep={(step) => {
                setCurrentStep(step);
                setActiveTab('runner');
              }}
            />
          </div>
        )}

        {activeTab === 'files' && (
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <RepoExplorer />
          </div>
        )}
      </main>

      {/* Linear API Configuration Modal */}
      <LinearConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        apiKey={linearApiKey}
        onSaveApiKey={setLinearApiKey}
        isLiveMode={isLiveMode}
        setIsLiveMode={setIsLiveMode}
      />
    </div>
  );
}
