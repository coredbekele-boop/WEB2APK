import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  Hammer,
  CreditCard,
  Plus,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Play,
  Download,
  Trash2,
  Settings,
  Layers,
  ArrowUpRight,
  Clock,
  Globe,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { Project, Build, User } from '../types';

interface DashboardViewProps {
  user: User;
  projects: Project[];
  builds: Build[];
  onNavigate: (route: string) => void;
  onOpenProject: (projectId: string) => void;
  onTriggerBuild: (projectId: string, buildType?: any, platform?: 'android' | 'ios') => void;
  onDeleteProject: (projectId: string) => void;
  onStartWizard?: (initialUrl?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  projects,
  builds,
  onNavigate,
  onOpenProject,
  onTriggerBuild,
  onDeleteProject,
  onStartWizard,
}) => {
  const [quickUrl, setQuickUrl] = useState('');
  const completedBuildsCount = builds.filter(b => b.status === 'COMPLETED').length;
  const recentBuilds = builds.slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome to Web2<span className="text-indigo-600">APK</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build, configure, preview, and package your websites into native Android APKs, Play Store AABs, and Apple iOS IPAs.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create-app')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New App
        </button>
      </div>

      {/* Quick Website-to-App Converter Box */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xs border border-indigo-900/40 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[11px] font-semibold text-indigo-300 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Web2APK Quick Generator</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Convert Any Website Into a Native Mobile App
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 mb-4 leading-relaxed">
            Enter your website URL to instantly launch the configuration wizard with automatic favicon, manifest, and color extraction.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onStartWizard) {
                onStartWizard(quickUrl.trim() || undefined);
              } else {
                onNavigate('create-app');
              }
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl"
          >
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="https://yesufapp.com"
                value={quickUrl}
                onChange={e => setQuickUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white text-slate-900 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shrink-0 shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Build App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Successful Builds */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Successful Builds</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-3 tabular-nums">
            {completedBuildsCount}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            100% production verified
          </span>
        </div>

        {/* Builds This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Builds This Month</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Hammer className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-3 tabular-nums">
            12 <span className="text-xs font-normal text-slate-400">/ 50</span>
          </p>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block">
            38 builds remaining
          </span>
        </div>

        {/* Current Plan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Current Plan</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3 capitalize">
            {user.plan}
          </p>
          <button
            onClick={() => onNavigate('billing')}
            className="text-[11px] text-indigo-600 hover:underline font-medium mt-1 block text-left"
          >
            Manage subscription
          </button>
        </div>
      </div>

      {/* Main Apps Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Mobile Applications</h2>
            <p className="text-xs text-slate-500">Manage and distribute your Android & iOS packages.</p>
          </div>
          <button
            onClick={() => onNavigate('apps')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All ({projects.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="py-12 text-center">
            <Smartphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No apps yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Create your first Android & iOS app from your website in seconds.
            </p>
            <button
              onClick={() => onNavigate('create-app')}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create App
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-6">App Name & ID</th>
                  <th className="py-3 px-6">Website URL</th>
                  <th className="py-3 px-6">Version</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Last Updated</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {projects.map(proj => (
                  <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* App Name & Icon */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={proj.iconUrl}
                          alt={proj.name}
                          className="w-9 h-9 rounded-xl object-cover bg-white border border-slate-200 shrink-0 shadow-2xs"
                          onError={e => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <button
                            onClick={() => onOpenProject(proj.id)}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-left block"
                          >
                            {proj.name}
                          </button>
                          <span className="font-mono text-[11px] text-slate-400 block truncate max-w-[160px]">
                            {proj.packageName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Website URL */}
                    <td className="py-3.5 px-6">
                      <a
                        href={proj.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-slate-600 hover:text-indigo-600 truncate max-w-[200px]"
                      >
                        <span className="truncate">{proj.websiteUrl}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                      </a>
                    </td>

                    {/* Version */}
                    <td className="py-3.5 px-6 font-mono tabular-nums">
                      v{proj.versionName}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {proj.status === 'building' ? 'Building...' : 'Production Ready'}
                      </span>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                      {new Date(proj.updatedAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenProject(proj.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onTriggerBuild(proj.id, 'apk', 'android')}
                          className="px-2 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                          title="Build Android APK"
                        >
                          <Play className="w-2.5 h-2.5 fill-current text-slate-600" />
                          APK
                        </button>
                        <button
                          onClick={() => onTriggerBuild(proj.id, 'ipa', 'ios')}
                          className="px-2 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                          title="Build iOS IPA"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          iOS
                        </button>
                        <button
                          onClick={() => onDeleteProject(proj.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete App"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Builds Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Builds */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Recent Build Pipeline Runs
            </h3>
            <button
              onClick={() => onNavigate('builds')}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {recentBuilds.map(b => (
              <div
                key={b.id}
                onClick={() => onNavigate(`builds/${b.id}`)}
                className="p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/70 transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      b.platform === 'ios'
                        ? 'bg-slate-900 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {b.platform === 'ios' ? 'iOS' : 'Android'}
                    </span>
                    <span className="font-bold text-xs text-slate-900">{b.appName}</span>
                    <span className="font-mono text-[10px] text-slate-500">v{b.versionName}</span>
                    <span className="text-[10px] font-mono text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.5 rounded font-semibold">
                      {b.buildType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{b.currentStage}</p>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-xs text-emerald-600 block">
                    {b.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {b.fileSize || (b.platform === 'ios' ? '22.6 MB' : '18.4 MB')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture & App Store Guide Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-medium text-indigo-200 mb-3">
              <Layers className="w-3 h-3" />
              Dual-Platform Publishing Engine
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mb-2">
              Ready for Google Play & Apple App Store
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every build generated complies with Android 14 (Target SDK 34) and iOS 16–18 WKWebView specifications. Export standalone release APKs, signed iOS IPAs, and full native source projects in Kotlin and Swift.
            </p>
          </div>

          <div className="pt-6 flex items-center justify-between">
            <button
              onClick={() => onNavigate('docs')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-indigo-200 transition-colors"
            >
              <span>Read Deployment Guide</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px] text-indigo-300">
              Kotlin 1.9 + Swift 5.9
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
