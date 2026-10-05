import React, { useState } from 'react';
import { Hammer, Download, RotateCcw, Clock, CheckCircle2, ChevronRight, Layers, FileCode2, Smartphone } from 'lucide-react';
import type { Build } from '../types';

interface BuildsListViewProps {
  builds: Build[];
  onOpenBuild: (buildId: string) => void;
  onRetryBuild: (buildId: string) => void;
}

export const BuildsListView: React.FC<BuildsListViewProps> = ({
  builds,
  onOpenBuild,
  onRetryBuild,
}) => {
  const [platformFilter, setPlatformFilter] = useState<'all' | 'android' | 'ios'>('all');

  const filteredBuilds = builds.filter(b => {
    if (platformFilter === 'all') return true;
    return b.platform === platformFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Builds & Artifacts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            History of all Android APK/AAB and iOS IPA compilation jobs.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              platformFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Platforms ({builds.length})
          </button>
          <button
            onClick={() => setPlatformFilter('android')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              platformFilter === 'android'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Android ({builds.filter(b => b.platform !== 'ios').length})
          </button>
          <button
            onClick={() => setPlatformFilter('ios')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              platformFilter === 'ios'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            iOS ({builds.filter(b => b.platform === 'ios').length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredBuilds.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <Hammer className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-900">No builds found</p>
            <p className="mt-1">
              {platformFilter === 'ios'
                ? 'No iOS builds generated yet. Trigger an iOS build from your app details.'
                : 'Trigger your first build from your app details or create a new app.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-6">Build ID</th>
                  <th className="py-3 px-6">Platform</th>
                  <th className="py-3 px-6">Application</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Created</th>
                  <th className="py-3 px-6">Size</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBuilds.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-indigo-600">
                      <button
                        onClick={() => onOpenBuild(b.id)}
                        className="hover:underline cursor-pointer"
                      >
                        {b.id}
                      </button>
                    </td>

                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        b.platform === 'ios'
                          ? 'bg-slate-900 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {b.platform === 'ios' ? 'iOS' : 'Android'}
                      </span>
                    </td>

                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-900 block">{b.appName}</span>
                      <span className="font-mono text-[11px] text-slate-400">{b.packageName}</span>
                    </td>

                    <td className="py-3.5 px-6">
                      <span className="uppercase font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">
                        {b.buildType}
                      </span>
                    </td>

                    <td className="py-3.5 px-6">
                      <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {b.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-6 font-mono tabular-nums text-slate-600">
                      {b.fileSize || (b.platform === 'ios' ? '22.6 MB' : '18.4 MB')}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenBuild(b.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          View Logs
                        </button>

                        {b.status === 'COMPLETED' && (
                          <a
                            href={b.platform === 'ios' ? `/api/builds/${b.id}/download-ipa` : `/api/builds/${b.id}/download-apk`}
                            download
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-indigo-50 transition-colors"
                            title={b.platform === 'ios' ? 'Download iOS IPA' : 'Download Android APK'}
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => onRetryBuild(b.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Rebuild"
                        >
                          <RotateCcw className="w-4 h-4" />
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
    </div>
  );
};
