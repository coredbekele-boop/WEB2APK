import React, { useState } from 'react';
import {
  Smartphone,
  Plus,
  Search,
  LayoutGrid,
  List,
  ExternalLink,
  Play,
  Download,
  Trash2,
  Settings,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import type { Project } from '../types';

interface MyAppsViewProps {
  projects: Project[];
  onNavigate: (route: string) => void;
  onOpenProject: (projectId: string) => void;
  onTriggerBuild: (projectId: string, buildType?: any, platform?: 'android' | 'ios') => void;
  onDeleteProject: (projectId: string) => void;
  onDownloadZip: (projectId: string, platform?: 'android' | 'ios') => void;
}

export const MyAppsView: React.FC<MyAppsViewProps> = ({
  projects,
  onNavigate,
  onOpenProject,
  onTriggerBuild,
  onDeleteProject,
  onDownloadZip,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const filteredProjects = projects.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.packageName.toLowerCase().includes(search.toLowerCase()) ||
      p.websiteUrl.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Applications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, configure, and generate Android & iOS packages for your websites.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create-app')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New App
        </button>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, package ID, URL..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Projects Grid or List */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Smartphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No applications match your search</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search query or create a brand new app.
          </p>
          <button
            onClick={() => onNavigate('create-app')}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg"
          >
            Create App
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(proj => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Header: Icon & Name */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={proj.iconUrl}
                      alt={proj.name}
                      className="w-12 h-12 rounded-2xl object-cover bg-white border border-slate-200 shadow-2xs shrink-0"
                      onError={e => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <h3
                        onClick={() => onOpenProject(proj.id)}
                        className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer leading-tight"
                      >
                        {proj.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400 block truncate max-w-[170px]">
                        {proj.packageName}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    v{proj.versionName}
                  </span>
                </div>

                {/* Target URL */}
                <div className="mb-4">
                  <a
                    href={proj.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 hover:text-indigo-600 truncate max-w-full"
                  >
                    <span className="truncate">{proj.websiteUrl}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </a>
                </div>

                {/* Badges: Status, Platforms & Navigation */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[11px]">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Ready
                  </span>
                  {proj.platforms?.includes('android') !== false && (
                    <span className="font-bold text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                      Android
                    </span>
                  )}
                  {proj.platforms?.includes('ios') !== false && (
                    <span className="font-bold text-[10px] text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded">
                      iOS
                    </span>
                  )}
                  {proj.github?.enabled ? (
                    <span
                      className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300"
                      title={`Connected to ${proj.github.repository} (${proj.github.branch || 'main'})`}
                    >
                      <GitBranch className="w-3 h-3 text-emerald-600" />
                      <span>CI Active</span>
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProject(proj.id);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 px-1.5 py-0.5 rounded border border-dashed border-slate-300 transition-colors cursor-pointer"
                      title="Connect GitHub repository for automated builds on push"
                    >
                      <GitBranch className="w-2.5 h-2.5" />
                      <span>+ GitHub CI</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenProject(proj.id)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    Details
                  </button>
                  <button
                    onClick={() => onDownloadZip(proj.id, 'android')}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Download Android Studio Code (.zip)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDownloadZip(proj.id, 'ios')}
                    className="p-1.5 text-slate-500 hover:text-indigo-700 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Download Xcode Project Code (.zip)"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onTriggerBuild(proj.id, 'apk', 'android')}
                    className="px-2.5 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                    title="Compile Android APK"
                  >
                    <Play className="w-2.5 h-2.5 fill-current text-slate-600" />
                    APK
                  </button>
                  <button
                    onClick={() => onTriggerBuild(proj.id, 'ipa', 'ios')}
                    className="px-2.5 py-1.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                    title="Compile Apple iOS IPA"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    iOS
                  </button>
                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete App"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-6">App Name</th>
                <th className="py-3 px-6">Platforms</th>
                <th className="py-3 px-6">Website URL</th>
                <th className="py-3 px-6">Package / Bundle</th>
                <th className="py-3 px-6">Version</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProjects.map(proj => (
                <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-6 font-bold text-slate-900">
                    <button
                      onClick={() => onOpenProject(proj.id)}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {proj.name}
                    </button>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-1">
                      {proj.platforms?.includes('android') !== false && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Android
                        </span>
                      )}
                      {proj.platforms?.includes('ios') !== false && (
                        <span className="text-[10px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                          iOS
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-6 font-mono text-slate-500 truncate max-w-[180px]">
                    {proj.websiteUrl}
                  </td>
                  <td className="py-3 px-6 font-mono text-slate-500">{proj.packageName}</td>
                  <td className="py-3 px-6 font-mono">v{proj.versionName}</td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-emerald-600">Ready</span>
                      {proj.github?.enabled && (
                        <span
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"
                          title={`GitHub CI connected: ${proj.github.repository}`}
                        >
                          <GitBranch className="w-2.5 h-2.5 text-emerald-600" />
                          <span>CI</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenProject(proj.id)}
                        className="px-2 py-1 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onTriggerBuild(proj.id, 'apk', 'android')}
                        className="px-2 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200"
                        title="Build Android APK"
                      >
                        APK
                      </button>
                      <button
                        onClick={() => onTriggerBuild(proj.id, 'ipa', 'ios')}
                        className="px-2 py-1 text-[11px] font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        title="Build iOS IPA"
                      >
                        iOS
                      </button>
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
  );
};
