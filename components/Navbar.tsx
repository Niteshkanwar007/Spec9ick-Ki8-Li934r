'use client';

import React from 'react';
import { Terminal, Download, ShieldCheck, RefreshCw, Key } from 'lucide-react';
import JSZip from 'jszip';
import { SPEC_KIT_REPO_FILES } from '@/lib/repository-files';

interface NavbarProps {
  activeTab: 'runner' | 'architecture' | 'files' | 'settings';
  setActiveTab: (tab: 'runner' | 'architecture' | 'files' | 'settings') => void;
  isLiveMode: boolean;
  setIsLiveMode: (live: boolean) => void;
  hasLinearApiKey: boolean;
  onOpenSettings: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  isLiveMode,
  setIsLiveMode,
  hasLinearApiKey,
  onOpenSettings,
}: NavbarProps) {
  const [downloadingZip, setDownloadingZip] = React.useState(false);

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      const zip = new JSZip();

      // Add all repository files
      SPEC_KIT_REPO_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Spec9ick-Ki8-Li934r-spec-kit.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 shadow-sm">
            <Terminal className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-neutral-100">
                Spec9ick-Ki8-Li934r
              </span>
              <span className="text-xs text-neutral-400">by 9icksA</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Linear Spec Kit Workflow Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900/60 p-1 text-xs">
          <button
            onClick={() => setActiveTab('runner')}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              activeTab === 'runner'
                ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Workflow Studio
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              activeTab === 'architecture'
                ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Architecture Flow
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              activeTab === 'files'
                ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Command Kit Repo (13 files)
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Live vs Sandbox Switch */}
          <button
            onClick={() => {
              if (!hasLinearApiKey && !isLiveMode) {
                onOpenSettings();
              } else {
                setIsLiveMode(!isLiveMode);
              }
            }}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
              isLiveMode
                ? 'border-violet-500/40 bg-violet-950/30 text-violet-300 hover:bg-violet-950/50'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
            }`}
            title={
              isLiveMode
                ? 'Posting directly to Linear GraphQL API'
                : 'Running in Interactive Sandbox simulator'
            }
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLiveMode ? 'bg-violet-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span>{isLiveMode ? 'Live Linear API' : 'Interactive Sandbox'}</span>
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-800 transition-colors"
            title="Configure Linear API Credentials"
          >
            <Key className="h-3.5 w-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Linear Key</span>
          </button>

          {/* Download Zip */}
          <button
            onClick={handleDownloadZip}
            disabled={downloadingZip}
            className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-900 hover:bg-white transition-colors"
            title="Download complete Spec9ick-Ki8-Li934r repo as ZIP"
          >
            {downloadingZip ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Download Kit (.zip)</span>
          </button>
        </div>
      </div>
    </header>
  );
}
