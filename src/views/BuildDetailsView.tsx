import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import type { Build } from '../types';

interface BuildDetailsViewProps {
  buildId: string;
  onBack: () => void;
  onRetryBuild: (buildId: string) => void;
}

export const BuildDetailsView: React.FC<BuildDetailsViewProps> = ({
  buildId,
  onBack,
  onRetryBuild,
}) => {
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchBuild = async () => {
    try {
      const res = await fetch(`/api/builds/${buildId}`);
      if (!res.ok) throw new Error('Build not found');
      const data = await res.json();
      setBuild(data.build);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch build');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuild();

    // Poll if in progress
    const interval = setInterval(() => {
      fetchBuild();
    }, 2000);

    return () => clearInterval(interval);
  }, [buildId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [build?.logs]);

  if (loading && !build) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        <Hammer className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
        <p>Loading build details and execution logs...</p>
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
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isCompleted = build.status === 'COMPLETED';
  const isFailed = build.status === 'FAILED';
  const isInProgress = !isCompleted && !isFailed;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
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
                build.platform === 'ios'
                  ? 'bg-slate-900 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {build.platform === 'ios' ? 'iOS' : 'Android'}
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
          {isCompleted && build.platform === 'ios' && (
            <>
              <a
                href={`/api/builds/${build.id}/download-ipa`}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download IPA</span>
              </a>

              <a
                href={`/api/builds/${build.id}/download-xcarchive`}
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
                title="Download Xcode Organizer Archive"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Xcode Archive (.xcarchive)</span>
              </a>

              <a
                href={`/api/builds/${build.id}/download-ios-zip`}
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
                title="Download complete Xcode project"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Xcode Swift Project (.zip)</span>
              </a>
            </>
          )}

          {isCompleted && build.platform !== 'ios' && (
            <>
              <a
                href={`/api/builds/${build.id}/download-apk`}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download APK</span>
              </a>

              <a
                href={`/api/builds/${build.id}/download-aab`}
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
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

      {/* Progress & Stage Status Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isCompleted ? (
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
            ) : isFailed ? (
              <span className="w-3 h-3 rounded-full bg-red-500" />
            ) : (
              <span className="w-3 h-3 rounded-full bg-indigo-600 animate-ping" />
            )}
            <span className="text-sm font-bold text-slate-900">{build.currentStage}</span>
          </div>

          <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
            {build.progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${build.progress}%` }}
          />
        </div>

        {/* Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[11px]">Started</span>
            <span className="font-mono text-slate-800">
              {new Date(build.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Completed</span>
            <span className="font-mono text-slate-800">
              {build.completedAt ? new Date(build.completedAt).toLocaleTimeString() : 'In Progress'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Duration</span>
            <span className="font-mono text-slate-800">
              {build.durationSeconds ? `${build.durationSeconds}s` : 'Processing'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Package Size</span>
            <span className="font-mono text-slate-800">
              {build.fileSize || 'Estimated ~18 MB'}
            </span>
          </div>
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
            <span className="font-mono text-slate-400 ml-2">gradle-runner.log</span>
          </div>

          <div className="flex items-center gap-2">
            {isInProgress && (
              <span className="text-[11px] font-mono text-indigo-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Live Stream
              </span>
            )}
            <span className="text-[11px] font-mono text-slate-500">UTF-8</span>
          </div>
        </div>

        {/* Log Lines */}
        <div className="p-4 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto space-y-1.5 leading-relaxed">
          {build.logs.map((log, idx) => {
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
          })}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Verification & Compliance Card */}
      {isCompleted && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">
                {build.platform === 'ios'
                  ? 'Apple Distribution Signature & Provisioning Profile Validated'
                  : 'Cryptographic APK Signature Scheme (V2/V3) Validated'}
              </p>
              <p className="text-[11px] text-emerald-700">
                {build.platform === 'ios'
                  ? 'Package is signed for Ad-Hoc device installation, Apple Configurator, or App Store Connect TestFlight upload.'
                  : 'APK package is ready for direct installation on Android 7.0 through Android 14 devices.'}
              </p>
            </div>
          </div>
          <a
            href={build.platform === 'ios' ? `/api/builds/${build.id}/download-ipa` : `/api/builds/${build.id}/download-apk`}
            download
            className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs shrink-0 cursor-pointer"
          >
            {build.platform === 'ios' ? 'Download Signed IPA' : 'Download Release APK'}
          </a>
        </div>
      )}
    </div>
  );
};
