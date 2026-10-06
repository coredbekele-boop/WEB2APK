import React, { useState, useEffect, useRef } from 'react';
import { InstallModal } from '../components/InstallModal';
import {
  Hammer,
  ArrowLeft,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  FileCode2,
  Layers,
  Sparkles,
  ExternalLink,
  GitBranch,
  Loader2,
  Cpu,
  ShieldCheck,
  PackageCheck,
  Check,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import type { Build } from '../types';

interface BuildDetailsViewProps {
  buildId: string;
  onBack: () => void;
  onRetryBuild: (buildId: string) => void;
}

interface PipelineStageConfig {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  startPct: number;
  endPct: number;
  icon: React.ComponentType<{ className?: string }>;
}

const ANDROID_STAGES: PipelineStageConfig[] = [
  {
    id: 'prepare',
    name: 'Workspace & Security Validation',
    shortLabel: 'Validation',
    description: 'Verifying package name, AndroidX WebView bindings and security rules',
    startPct: 0,
    endPct: 20,
    icon: ShieldCheck,
  },
  {
    id: 'generate',
    name: 'Source Synthesis & Layouts',
    shortLabel: 'Code Synthesis',
    description: 'Generating Kotlin MainActivity.kt, manifests, and mipmap icons',
    startPct: 20,
    endPct: 40,
    icon: FileCode2,
  },
  {
    id: 'compile',
    name: 'Gradle 8.3 & Bytecode Compiler',
    shortLabel: 'Gradle Build',
    description: 'Compiling Dalvik classes.dex with R8 optimization & native bindings',
    startPct: 40,
    endPct: 65,
    icon: Cpu,
  },
  {
    id: 'signing',
    name: 'APK Assembly & Cryptographic Signing',
    shortLabel: 'V2/V3 Signing',
    description: 'Packaging APK container with SHA-256 digest & release keystore',
    startPct: 65,
    endPct: 85,
    icon: Sparkles,
  },
  {
    id: 'release',
    name: 'Artifact Storage & Verification',
    shortLabel: 'Package Release',
    description: 'Verifying ~17.8 MB binary package and preparing secure download URLs',
    startPct: 85,
    endPct: 100,
    icon: PackageCheck,
  },
];

const IOS_STAGES: PipelineStageConfig[] = [
  {
    id: 'prepare',
    name: 'Bundle & Provisioning Validation',
    shortLabel: 'Validation',
    description: 'Validating iOS bundle identifier, entitlements, and provisioning profile',
    startPct: 0,
    endPct: 20,
    icon: ShieldCheck,
  },
  {
    id: 'generate',
    name: 'SwiftUI & WKWebView Synthesis',
    shortLabel: 'Swift UI',
    description: 'Generating Swift app coordinator, WebViewModel, and Asset catalog',
    startPct: 20,
    endPct: 40,
    icon: FileCode2,
  },
  {
    id: 'compile',
    name: 'Xcodebuild & Mach-O Clang Compiler',
    shortLabel: 'Clang Compile',
    description: 'Compiling 64-bit ARM Mach-O executable with WebKit acceleration',
    startPct: 40,
    endPct: 70,
    icon: Cpu,
  },
  {
    id: 'signing',
    name: 'Apple Distribution Code Signing',
    shortLabel: 'Code Signing',
    description: 'Applying Apple Distribution certificate and sealing Payload bundle',
    startPct: 70,
    endPct: 90,
    icon: Sparkles,
  },
  {
    id: 'release',
    name: 'IPA Package Release & Storage',
    shortLabel: 'IPA Release',
    description: 'Finalizing ~22.0 MB standalone IPA archive and uploading to storage',
    startPct: 90,
    endPct: 100,
    icon: PackageCheck,
  },
];

export const BuildDetailsView: React.FC<BuildDetailsViewProps> = ({
  buildId,
  onBack,
  onRetryBuild,
}) => {
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  // Poll real-time status API
  const fetchBuildStatus = async () => {
    try {
      const res = await fetch(`/api/builds/${buildId}/status`);
      if (!res.ok) throw new Error('Build not found');
      const data = await res.json();
      setBuild(data.build);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch build status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildStatus();

    // Fast polling (1s) during active compilation, slows down if completed
    const interval = setInterval(() => {
      fetchBuildStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, [buildId]);

  // Live Timer for In-Progress Builds
  useEffect(() => {
    if (!build) return;
    if (build.status === 'COMPLETED' || build.status === 'FAILED') {
      if (build.durationSeconds) setElapsedSeconds(build.durationSeconds);
      return;
    }
    const startTime = new Date(build.createdAt).getTime();
    const updateElapsed = () => {
      const secs = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      setElapsedSeconds(secs);
    };
    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [build?.status, build?.createdAt, build?.durationSeconds]);

  // Auto-scroll ONLY inside the terminal log box, NEVER triggering parent/page scroll
  const handleLogsScroll = () => {
    if (!logsContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
    userScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 40;
  };

  useEffect(() => {
    if (!userScrolledUpRef.current && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [build?.logs?.length]);

  if (loading && !build) {
    return (
      <div className="py-24 text-center text-xs text-slate-500">
        <Hammer className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="font-semibold text-slate-700">Connecting to Build Pipeline API...</p>
        <p className="text-[11px] text-slate-400 mt-1">Sourcing real-time pipeline status for {buildId}</p>
      </div>
    );
  }

  if (error || !build) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
          <p className="font-bold">Build Error</p>
          <p className="mt-1">{error || 'Build record does not exist.'}</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isCompleted = build.status === 'COMPLETED';
  const isFailed = build.status === 'FAILED';
  const isInProgress = !isCompleted && !isFailed;
  const isIos = build.platform === 'ios';
  const stages = isIos ? IOS_STAGES : ANDROID_STAGES;

  // Calculate individual stage progress
  const getStageProgress = (stage: PipelineStageConfig, currentPct: number) => {
    if (isCompleted) return 100;
    if (currentPct >= stage.endPct) return 100;
    if (currentPct <= stage.startPct) return 0;
    return Math.min(100, Math.max(0, Math.round(((currentPct - stage.startPct) / (stage.endPct - stage.startPct)) * 100)));
  };

  const getStageState = (stage: PipelineStageConfig, currentPct: number) => {
    if (isCompleted) return 'completed';
    if (isFailed && currentPct >= stage.startPct && currentPct < stage.endPct) return 'failed';
    if (currentPct >= stage.endPct) return 'completed';
    if (currentPct > stage.startPct) return 'active';
    return 'pending';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {build.appName} Build
              </h1>
              <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                isIos ? 'bg-slate-900 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isIos ? 'iOS' : 'Android'}
              </span>
              <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold uppercase">
                {build.buildType}
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400 mt-0.5">
              ID: {build.id} · Identifier: {build.packageName} · v{build.versionName}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isCompleted && isIos && (
            <>
              <a
                href={`/api/builds/${build.id}/download-ipa`}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download IPA ({build.fileSize || '22.0 MB'})</span>
              </a>

              <a
                href={`/api/builds/${build.id}/download-ios-zip`}
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Xcode Project</span>
              </a>
            </>
          )}

          {isCompleted && !isIos && (
            <>
              <button
                type="button"
                onClick={() => setIsInstallModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors shadow-2xs cursor-pointer"
                title="Scan QR Code to install APK on Android smartphone"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Install on Smartphone</span>
              </button>

              <a
                href={`/api/builds/${build.id}/download-apk`}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download APK ({build.fileSize || '17.8 MB'})</span>
              </a>

              <a
                href={`/api/builds/${build.id}/download-aab`}
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download AAB</span>
              </a>

              <a
                href={`/api/builds/${build.id}/download-zip`}
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Source ZIP</span>
              </a>
            </>
          )}

          <button
            onClick={() => onRetryBuild(build.id)}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
            title="Rebuild Project"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* GitHub Webhook Trigger Banner if applicable */}
      {(build.triggerSource === 'github_webhook' || build.gitCommitHash) && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-emerald-400">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">Automated GitHub Push Trigger:</span>
                <span className="font-mono text-indigo-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {build.gitCommitHash || 'webhook'}
                </span>
                <span className="text-slate-400">on branch [{build.gitBranch || 'main'}]</span>
              </div>
              <p className="text-slate-200 font-medium mt-0.5">
                "{build.gitCommitMessage || 'Commit push'}"
                <span className="text-slate-400 text-[11px] ml-2">by {build.gitAuthor || 'GitHub Committer'}</span>
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800 self-start sm:self-auto">
            ● Webhook Verified
          </span>
        </div>
      )}

      {/* PRIMARY REAL-TIME PIPELINE PROGRESS CARD */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              {isCompleted ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : isFailed ? (
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shadow-xs">
                  <AlertCircle className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shadow-xs">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-none">
                  {build.currentStage || 'Initializing Pipeline'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isFailed
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse'
                  }`}
                >
                  {isCompleted ? 'COMPLETED' : isFailed ? 'FAILED' : 'IN PROGRESS'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Real-time APK synthesis pipeline status via <code>/api/builds/{build.id}/status</code>
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-1 self-end sm:self-center">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {build.progress}
            </span>
            <span className="text-sm font-bold text-slate-500 font-mono">%</span>
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200/80">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : isFailed
                  ? 'bg-red-500'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400'
              }`}
              style={{ width: `${Math.max(5, build.progress)}%` }}
            >
              {isInProgress && (
                <div className="absolute inset-0 bg-white/25 animate-shimmer" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>0% Queued</span>
            <span>40% Bytecode</span>
            <span>85% Signed</span>
            <span>100% Release</span>
          </div>
        </div>

        {/* Live Pipeline Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[11px]">Runner Architecture</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isIos ? 'Apple Silicon M3' : 'Linux x86_64 / ARM'}</span>
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Execution Time</span>
            <span className="font-mono text-slate-800 font-semibold flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{elapsedSeconds}s elapsed</span>
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Target Package</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isIos ? 'Apple IPA' : 'Android APK'}</span>
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Artifact Size</span>
            <span className="font-mono font-bold text-slate-900 mt-0.5 block">
              {build.fileSize || (isIos ? '22.0 MB' : '17.8 MB')}
            </span>
          </div>
        </div>
      </div>

      {/* MULTI-STAGE DETAILED PROGRESS BARS GRID */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pipeline Stage Breakdown & Progress
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Individual execution checkpoints monitored by the automated compiler runner.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
            {stages.filter(s => getStageState(s, build.progress) === 'completed').length} / {stages.length} Stages Passed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {stages.map((stage, idx) => {
            const stagePct = getStageProgress(stage, build.progress);
            const state = getStageState(stage, build.progress);
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  state === 'completed'
                    ? 'bg-slate-50/70 border-slate-200 text-slate-700'
                    : state === 'active'
                    ? 'bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-200/50 text-slate-900 shadow-2xs'
                    : 'bg-white border-slate-100 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        state === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : state === 'active'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {state === 'completed' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : state === 'active' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                        <span>{stage.name}</span>
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Target range: {stage.startPct}% - {stage.endPct}%
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-xs font-bold tabular-nums ${
                      state === 'completed'
                        ? 'text-emerald-700'
                        : state === 'active'
                        ? 'text-indigo-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {stagePct}%
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mb-2 leading-relaxed line-clamp-1">
                  {stage.description}
                </p>

                {/* Sub-stage Progress Bar */}
                <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      state === 'completed'
                        ? 'bg-emerald-500'
                        : state === 'active'
                        ? 'bg-indigo-600 animate-pulse'
                        : 'bg-transparent'
                    }`}
                    style={{ width: `${stagePct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="font-mono text-slate-400 ml-2">
              {isIos ? 'xcode-runner.log' : 'gradle-daemon.log'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isInProgress && (
              <span className="text-[11px] font-mono text-indigo-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Live Log Stream
              </span>
            )}
            <span className="text-[11px] font-mono text-slate-500">UTF-8</span>
          </div>
        </div>

        {/* Log Lines */}
        <div
          ref={logsContainerRef}
          onScroll={handleLogsScroll}
          className="p-4 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto overscroll-contain space-y-1.5 leading-relaxed"
        >
          {build.logs && build.logs.length > 0 ? (
            build.logs.map((log, idx) => {
              const colors = {
                info: 'text-slate-300',
                warn: 'text-amber-400',
                error: 'text-red-400 font-bold',
                success: 'text-emerald-400 font-semibold',
              };

              return (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="text-slate-500 select-none text-[11px]">
                    [{log.timestamp}]
                  </span>
                  <span className={colors[log.level]}>{log.message}</span>
                </div>
              );
            })
          ) : (
            <p className="text-slate-500 italic">Awaiting build log output from daemon...</p>
          )}
        </div>
      </div>

      {/* Release Verification & Download Card */}
      {isCompleted && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-emerald-950">
                {isIos
                  ? 'Apple Distribution Signature & Provisioning Profile Validated'
                  : 'Cryptographic APK Signature Scheme (V2/V3) Validated'}
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {isIos
                  ? 'Package is signed for Ad-Hoc device installation or App Store Connect TestFlight upload.'
                  : `APK release binary (${build.fileSize || '17.8 MB'}) is ready for immediate deployment on Android devices.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isIos && (
              <button
                type="button"
                onClick={() => setIsInstallModalOpen(true)}
                className="px-4 py-2.5 font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Scan QR to Install</span>
              </button>
            )}
            <a
              href={isIos ? `/api/builds/${build.id}/download-ipa` : `/api/builds/${build.id}/download-apk`}
              download
              className="px-5 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{isIos ? 'Download Release IPA' : 'Download Release APK'}</span>
            </a>
          </div>
        </div>
      )}

      {/* Smartphone QR Code & Installation Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        build={build}
      />
    </div>
  );
};
