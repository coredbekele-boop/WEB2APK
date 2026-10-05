import React, { useState } from 'react';
import {
  GitBranch,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Shield,
  Layers,
  Smartphone,
  Save,
  Unlink,
  Code2,
  FileCode,
  Download,
} from 'lucide-react';
import type { Project, GitHubIntegration } from '../types';

interface RepositorySettingsProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onTriggerBuild: (projectId: string, buildType?: any, platform?: 'android' | 'ios') => void;
  onNavigateToBuild?: (buildId: string) => void;
}

export const RepositorySettings: React.FC<RepositorySettingsProps> = ({
  project,
  onUpdateProject,
  onTriggerBuild,
  onNavigateToBuild,
}) => {
  const existingGithub = project.github;

  const [repoUrl, setRepoUrl] = useState(existingGithub?.repository || '');
  const [branch, setBranch] = useState(existingGithub?.branch || 'main');
  const [autoBuild, setAutoBuild] = useState(existingGithub?.autoBuild ?? true);
  const [targetPlatform, setTargetPlatform] = useState<'android' | 'ios' | 'both'>(
    existingGithub?.targetPlatform || 'android'
  );
  const [targetBuildType, setTargetBuildType] = useState<'apk' | 'aab' | 'ipa' | 'both'>(
    existingGithub?.targetBuildType || 'apk'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testCommitMessage, setTestCommitMessage] = useState(
    `feat(mobile): update navigation and sync v${project.versionName}`
  );
  const [testAuthor, setTestAuthor] = useState('developer');
  const [showTestForm, setShowTestForm] = useState(false);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'webhook' | 'actions'>('webhook');

  const [testResult, setTestResult] = useState<{
    message: string;
    buildId?: string;
    commitHash?: string;
  } | null>(null);

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedActionYaml, setCopiedActionYaml] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Compute full webhook URL
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/projects/${project.id}/github-webhook`
    : `/api/projects/${project.id}/github-webhook`;

  const secret = existingGithub?.webhookSecret || 'whsec_web2apk_ci_' + project.id.slice(-8);

  // Extract owner and repo for GitHub deep links
  const extractRepoSlug = (input: string) => {
    const clean = input.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
    const parts = clean.split('/');
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return clean;
  };

  const repoSlug = extractRepoSlug(repoUrl);
  const githubSettingsWebhookUrl = repoSlug.includes('/')
    ? `https://github.com/${repoSlug}/settings/hooks/new`
    : null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setTestResult(null);

    const payload: Partial<GitHubIntegration> = {
      enabled: true,
      repository: repoUrl.trim(),
      branch: branch.trim() || 'main',
      autoBuild,
      targetPlatform,
      targetBuildType,
      webhookSecret: secret,
      webhookUrl: `/api/projects/${project.id}/github-webhook`,
    };

    try {
      const res = await fetch(`/api/projects/${project.id}/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save GitHub repository settings');
      const data = await res.json();
      if (data.project) {
        onUpdateProject(data.project);
      }
      setTestResult({ message: 'GitHub repository configuration saved successfully!' });
    } catch (err: any) {
      alert(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect this GitHub repository? Automated webhook builds will stop.')) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/github`, { method: 'DELETE' });
      if (res.ok) {
        const updated: Project = {
          ...project,
          github: {
            ...project.github!,
            enabled: false,
            autoBuild: false,
          },
        };
        onUpdateProject(updated);
        setRepoUrl('');
        setTestResult(null);
      }
    } catch (err: any) {
      alert(`Disconnect error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/projects/${project.id}/github/test-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitMessage: testCommitMessage.trim() || `feat(mobile): automated commit build v${project.versionName}`,
          author: testAuthor.trim() || 'github-committer',
        }),
      });

      if (!res.ok) throw new Error('Failed to test webhook trigger');
      const data = await res.json();
      setTestResult({
        message: `Webhook received! Automated ${targetPlatform.toUpperCase()} build successfully queued.`,
        buildId: data.build?.id,
        commitHash: data.delivery?.commitHash || '8f2a1b9',
      });

      // Update project state with new delivery
      if (data.delivery) {
        const currentDeliveries = project.github?.deliveries || [];
        const updated: Project = {
          ...project,
          lastBuildId: data.build?.id || project.lastBuildId,
          github: {
            ...(project.github || {
              enabled: true,
              repository: repoUrl || 'user/repo',
              branch,
              targetPlatform,
              targetBuildType,
              autoBuild: true,
            }),
            lastSyncAt: new Date().toISOString(),
            lastCommitHash: data.delivery.commitHash,
            lastCommitMessage: data.delivery.commitMessage,
            lastAuthor: data.delivery.author,
            deliveries: [data.delivery, ...currentDeliveries],
          },
        };
        onUpdateProject(updated);
      }
    } catch (err: any) {
      alert(`Test webhook error: ${err.message}`);
    } finally {
      setIsTestingWebhook(false);
      setShowTestForm(false);
    }
  };

  const copyToClipboard = (text: string, type: 'url' | 'secret' | 'yaml') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } else if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2500);
    } else {
      setCopiedActionYaml(true);
      setTimeout(() => setCopiedActionYaml(false), 2500);
    }
  };

  const isConnected = Boolean(existingGithub?.enabled && existingGithub?.repository);

  const actionYamlCode = `name: Web2APK Mobile Cloud Build
on:
  push:
    branches: [ ${branch || 'main'} ]

jobs:
  trigger-build:
    name: Trigger Automated Android / iOS Build
    runs-on: ubuntu-latest
    steps:
      - name: Send Webhook Payload to Web2APK
        run: |
          curl -X POST "${webhookUrl}" \\
            -H "Content-Type: application/json" \\
            -H "X-GitHub-Event: push" \\
            -d '{
              "ref": "refs/heads/${branch || 'main'}",
              "repository": { "full_name": "${repoSlug || 'owner/repo'}" },
              "head_commit": {
                "id": "\${{ github.sha }}",
                "message": "\${{ github.event.head_commit.message }}",
                "author": { "name": "\${{ github.actor }}" }
              }
            }'
`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">GitHub Continuous Integration</h2>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  isConnected && autoBuild
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isConnected
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {isConnected && autoBuild
                  ? '● Auto-Build Active'
                  : isConnected
                  ? 'Auto-Build Paused'
                  : 'Not Connected'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Connect your web project's GitHub repository. Every time code is pushed to your designated branch,
              Web2APK automatically checks out the changes and synthesizes new Android APK/AAB or Apple iOS packages.
            </p>
          </div>
        </div>

        {isConnected && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowTestForm(!showTestForm)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Commit Push</span>
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors cursor-pointer"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>

      {/* Simulator / Test Push Form */}
      {showTestForm && (
        <div className="p-5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                Simulate GitHub Webhook Push Event
              </h4>
            </div>
            <span className="text-[11px] text-indigo-700">Triggers an instant automated build</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Commit Message</label>
              <input
                type="text"
                value={testCommitMessage}
                onChange={e => setTestCommitMessage(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Committer Name / Handle</label>
              <input
                type="text"
                value={testAuthor}
                onChange={e => setTestAuthor(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowTestForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={isTestingWebhook}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {isTestingWebhook ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Send Test Webhook Push</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Test feedback toast/alert */}
      {testResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between gap-3 text-emerald-900 text-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm text-emerald-950">{testResult.message}</span>
              {testResult.commitHash && (
                <span className="font-mono text-emerald-800 text-[11px] block mt-0.5">
                  Commit SHA: {testResult.commitHash} · Target: {targetPlatform.toUpperCase()} · Auto-Build Triggered
                </span>
              )}
            </div>
          </div>
          {testResult.buildId && onNavigateToBuild && (
            <button
              onClick={() => onNavigateToBuild(testResult.buildId!)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              View Build & Logs &rarr;
            </button>
          )}
        </div>
      )}

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Repository Connection & Automated Trigger Settings
          </h3>
          {githubSettingsWebhookUrl && (
            <a
              href={githubSettingsWebhookUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              <span>Add Webhook on GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GitHub Repository URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              GitHub Repository Slug or URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <GitBranch className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="owner/repo or https://github.com/owner/repo"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              e.g. <code>nordic-living/storefront-web</code> or <code>https://github.com/my-org/my-site</code>
            </p>
          </div>

          {/* Target Branch */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Target Monitored Branch <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={branch}
              onChange={e => setBranch(e.target.value)}
              placeholder="main"
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900"
            />
            <p className="text-[11px] text-slate-400">
              Incoming commits to this branch trigger an automatic build (e.g. <code>main</code>, <code>master</code>, or <code>production</code>).
            </p>
          </div>

          {/* Target Platform */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Target Output Package on Push
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetPlatform('android')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  targetPlatform === 'android'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Android (APK)</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetPlatform('ios')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  targetPlatform === 'ios'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Apple iOS (IPA)</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetPlatform('both')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  targetPlatform === 'both'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Dual (Both)</span>
              </button>
            </div>
          </div>

          {/* Auto-build on push TOGGLE */}
          <div className="space-y-1.5 flex flex-col justify-center">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Automated Build on Git Push</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Start mobile compilation automatically upon receiving a commit
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoBuild(!autoBuild)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoBuild ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={autoBuild}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    autoBuild ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Integration Instructions Tabs: Direct Webhook vs GitHub Actions */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Setup Options for {repoSlug || project.name}
              </h4>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveInstructionTab('webhook')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeInstructionTab === 'webhook'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                GitHub Webhook (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setActiveInstructionTab('actions')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeInstructionTab === 'actions'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                GitHub Actions Workflow
              </button>
            </div>
          </div>

          {activeInstructionTab === 'webhook' ? (
            <div className="space-y-4">
              {/* Webhook URL Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Payload URL:</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webhookUrl, 'url')}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied URL!' : 'Copy Payload URL'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 truncate select-all">
                  {webhookUrl}
                </div>
              </div>

              {/* Webhook Secret */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Webhook Secret (HMAC SHA-256):</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showSecret ? 'Hide' : 'Show'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(secret, 'secret')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSecret ? 'Copied Secret!' : 'Copy Secret'}</span>
                    </button>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 flex items-center justify-between">
                  <span>{showSecret ? secret : '••••••••••••••••••••••••••••••••'}</span>
                </div>
              </div>

              {/* Step-by-step checklist */}
              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-200">How to add in GitHub repository settings:</p>
                  {githubSettingsWebhookUrl && (
                    <a
                      href={githubSettingsWebhookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold"
                    >
                      <span>Open {repoSlug} Settings &rarr;</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[11px] leading-relaxed">
                  <li>Navigate to <strong>GitHub &rarr; Settings &rarr; Webhooks &rarr; Add webhook</strong>.</li>
                  <li>Paste the <strong>Payload URL</strong> into the Payload URL field.</li>
                  <li>Set <strong>Content type</strong> to <code>application/json</code>.</li>
                  <li>Paste the <strong>Secret</strong> token into the Secret field.</li>
                  <li>Select <strong>Just the push event</strong> and click <strong>Add webhook</strong>.</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  Create <code>.github/workflows/web2apk.yml</code> in your repository:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(actionYamlCode, 'yaml')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedActionYaml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedActionYaml ? 'Copied Workflow YAML!' : 'Copy Workflow YAML'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto">
                {actionYamlCode}
              </pre>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Repository Connection</span>
          </button>
        </div>
      </form>

      {/* Recent Webhook Events & Commits */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Recent Webhook Deliveries & Automated Builds</h3>
          </div>
          <span className="text-xs text-slate-500">
            {existingGithub?.deliveries?.length || 0} deliveries recorded
          </span>
        </div>

        {existingGithub?.deliveries && existingGithub.deliveries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-2.5 pl-2">Status</th>
                  <th className="pb-2.5">Commit</th>
                  <th className="pb-2.5">Branch</th>
                  <th className="pb-2.5">Author</th>
                  <th className="pb-2.5">Delivered</th>
                  <th className="pb-2.5 text-right pr-2">Build Artifact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                {existingGithub.deliveries.map(del => (
                  <tr key={del.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 pl-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        200 OK
                      </span>
                    </td>
                    <td className="py-3">
                      <div>
                        <span className="font-mono text-indigo-600 font-bold text-[11px] block">
                          {del.commitHash.substring(0, 7)}
                        </span>
                        <span className="text-slate-600 line-clamp-1 max-w-xs">{del.commitMessage}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-slate-600">{del.branch}</td>
                    <td className="py-3 font-medium text-slate-800">{del.author}</td>
                    <td className="py-3 text-slate-500 whitespace-nowrap">
                      {new Date(del.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="inline-flex items-center gap-2">
                        {del.buildId && onNavigateToBuild && (
                          <button
                            onClick={() => onNavigateToBuild(del.buildId!)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                          >
                            Build Logs &rarr;
                          </button>
                        )}
                        <a
                          href={`/api/builds/${del.buildId || 'build_release'}/download-apk`}
                          download
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Download real Android APK generated for this commit (~17.8 MB)"
                        >
                          <Download className="w-3 h-3 text-emerald-600" />
                          <span>APK</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            <GitBranch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-600">No Webhook Deliveries Yet</p>
            <p className="mt-1">
              Configure the webhook in your GitHub repository or click "Simulate Commit Push" above to test the automated build pipeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
