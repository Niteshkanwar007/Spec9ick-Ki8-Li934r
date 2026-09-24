'use client';

import React, { useState } from 'react';
import {
  Key,
  Check,
  AlertCircle,
  ExternalLink,
  X,
  RotateCw,
  ShieldCheck,
} from 'lucide-react';

interface LinearConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  isLiveMode: boolean;
  setIsLiveMode: (val: boolean) => void;
}

export function LinearConfigModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  isLiveMode,
  setIsLiveMode,
}: LinearConfigModalProps) {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    viewerName?: string;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!keyInput.trim()) {
      setTestResult({ error: 'Please enter a Linear Personal API Key first' });
      return;
    }
    try {
      setTesting(true);
      setTestResult(null);

      const res = await fetch('/api/linear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection', apiKey: keyInput.trim() }),
      });
      const data = await res.json();
      if (data.success && data.viewer) {
        setTestResult({
          success: true,
          viewerName: `${data.viewer.name} (${data.viewer.email})`,
        });
      } else {
        setTestResult({
          success: false,
          error: data.error || 'Failed to authenticate with Linear API',
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveApiKey(keyInput.trim());
    if (keyInput.trim()) {
      setIsLiveMode(true);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-950 text-violet-400 border border-violet-800/40">
              <Key className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-100">
              Linear API Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Info */}
        <div className="text-xs text-neutral-400 space-y-2">
          <p>
            Connect your real Linear workspace to read issues, post versioned comments, and create child tasks directly via Linear&apos;s GraphQL API.
          </p>
          <div className="rounded-md border border-neutral-800 bg-neutral-950 p-3">
            <span className="text-neutral-300 font-medium">How to get your API Key:</span>
            <ol className="list-decimal ml-4 mt-1 space-y-0.5 text-neutral-400">
              <li>Open Linear app or web</li>
              <li>Go to <strong>Settings</strong> &gt; <strong>Account</strong> &gt; <strong>Security</strong></li>
              <li>Under <strong>Personal API keys</strong>, generate a new key</li>
            </ol>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300">
            Personal API Key
          </label>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="lin_api_xxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full rounded-md border border-neutral-750 bg-neutral-950 px-3 py-2 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:border-violet-500 focus:outline-hidden"
          />
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`rounded-md p-3 text-xs flex items-start gap-2 ${
              testResult.success
                ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300'
                : 'bg-red-950/40 border border-red-800/40 text-red-300'
            }`}
          >
            {testResult.success ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            )}
            <div>
              {testResult.success ? (
                <>
                  <span className="font-semibold">Connected:</span>{' '}
                  {testResult.viewerName}
                </>
              ) : (
                <>
                  <span className="font-semibold">Connection failed:</span>{' '}
                  {testResult.error}
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleTest}
            disabled={testing || !keyInput.trim()}
            className="flex items-center gap-1.5 rounded-md border border-neutral-750 bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-750 disabled:opacity-50"
          >
            {testing && <RotateCw className="h-3.5 w-3.5 animate-spin" />}
            <span>Test Connection</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-violet-500"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
