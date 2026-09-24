'use client';

import React, { useState } from 'react';
import {
  Folder,
  FileText,
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  File,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import JSZip from 'jszip';
import { SPEC_KIT_REPO_FILES, RepoFile } from '@/lib/repository-files';

export function RepoExplorer() {
  const [selectedFile, setSelectedFile] = useState<RepoFile>(SPEC_KIT_REPO_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    commands: true,
    docs: true,
    '.github': true,
    '.github/workflows': true,
  });

  const toggleFolder = (folderName: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    SPEC_KIT_REPO_FILES.forEach((f) => {
      zip.file(f.path, f.content);
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
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm overflow-hidden">
      {/* Explorer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 p-4 bg-neutral-950/60">
        <div>
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-neutral-100">
              Spec9ick-Ki8-Li934r Repository Tree
            </h2>
            <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-300">
              13 extension files
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Full spec-kit extension repository by 9icksA ready for distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md border border-neutral-750 bg-neutral-850 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Current File</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadZip}
            className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-white transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Repo (.zip)</span>
          </button>
        </div>
      </div>

      {/* Main Split: Tree Navigation on Left, Code Viewer on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
        {/* File Tree Left Pane */}
        <div className="md:col-span-4 border-r border-neutral-800 bg-neutral-950/80 p-3 space-y-1 text-xs">
          <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Files & Commands
          </div>

          {/* Root directory listing */}
          <div className="space-y-0.5">
            {/* Commands Folder */}
            <div>
              <button
                onClick={() => toggleFolder('commands')}
                className="flex items-center gap-1.5 w-full rounded px-2 py-1.5 text-neutral-300 hover:bg-neutral-900 transition-colors"
              >
                {openFolders['commands'] ? (
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-500" />
                )}
                <Folder className="h-3.5 w-3.5 text-violet-400" />
                <span className="font-mono font-medium">commands/</span>
              </button>

              {openFolders['commands'] && (
                <div className="ml-5 pl-2 border-l border-neutral-800 space-y-0.5">
                  {SPEC_KIT_REPO_FILES.filter((f) => f.path.startsWith('commands/')).map(
                    (file) => (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`flex items-center gap-2 w-full rounded px-2 py-1 text-left font-mono text-[11px] transition-colors ${
                          selectedFile.path === file.path
                            ? 'bg-violet-950/60 text-violet-200 border border-violet-800/40'
                            : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                        }`}
                      >
                        <FileCode className="h-3 w-3 text-neutral-500" />
                        <span>{file.path.replace('commands/', '')}</span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Docs Folder */}
            <div>
              <button
                onClick={() => toggleFolder('docs')}
                className="flex items-center gap-1.5 w-full rounded px-2 py-1.5 text-neutral-300 hover:bg-neutral-900 transition-colors"
              >
                {openFolders['docs'] ? (
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-500" />
                )}
                <Folder className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-mono font-medium">docs/</span>
              </button>

              {openFolders['docs'] && (
                <div className="ml-5 pl-2 border-l border-neutral-800 space-y-0.5">
                  {SPEC_KIT_REPO_FILES.filter((f) => f.path.startsWith('docs/')).map(
                    (file) => (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`flex items-center gap-2 w-full rounded px-2 py-1 text-left font-mono text-[11px] transition-colors ${
                          selectedFile.path === file.path
                            ? 'bg-violet-950/60 text-violet-200 border border-violet-800/40'
                            : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                        }`}
                      >
                        <FileText className="h-3 w-3 text-neutral-500" />
                        <span>{file.path.replace('docs/', '')}</span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* .github / workflows */}
            <div>
              <button
                onClick={() => toggleFolder('.github')}
                className="flex items-center gap-1.5 w-full rounded px-2 py-1.5 text-neutral-300 hover:bg-neutral-900 transition-colors"
              >
                {openFolders['.github'] ? (
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-500" />
                )}
                <Folder className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-mono font-medium">.github/workflows/</span>
              </button>

              {openFolders['.github'] && (
                <div className="ml-5 pl-2 border-l border-neutral-800 space-y-0.5">
                  {SPEC_KIT_REPO_FILES.filter((f) => f.path.startsWith('.github/')).map(
                    (file) => (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`flex items-center gap-2 w-full rounded px-2 py-1 text-left font-mono text-[11px] transition-colors ${
                          selectedFile.path === file.path
                            ? 'bg-violet-950/60 text-violet-200 border border-violet-800/40'
                            : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                        }`}
                      >
                        <FileCode className="h-3 w-3 text-neutral-500" />
                        <span>ci.yml</span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Root Config & Metadata Files */}
            <div className="pt-2 border-t border-neutral-850">
              {SPEC_KIT_REPO_FILES.filter(
                (f) => !f.path.includes('/')
              ).map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`flex items-center gap-2 w-full rounded px-2 py-1.5 text-left font-mono text-[11px] transition-colors ${
                    selectedFile.path === file.path
                      ? 'bg-violet-950/60 text-violet-200 border border-violet-800/40'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                  }`}
                >
                  <File className="h-3.5 w-3.5 text-neutral-500" />
                  <span>{file.path}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Code Content Right Pane */}
        <div className="md:col-span-8 flex flex-col bg-neutral-950">
          {/* File Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2 text-xs bg-neutral-900/40">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-200">{selectedFile.path}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-[11px] text-neutral-400">{selectedFile.description}</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              {selectedFile.content.split('\n').length} lines
            </span>
          </div>

          {/* File Code Pre */}
          <div className="p-4 overflow-auto max-h-[580px] font-mono text-xs leading-relaxed text-neutral-300 select-all">
            <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
