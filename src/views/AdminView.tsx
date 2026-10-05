import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Smartphone,
  Hammer,
  HardDrive,
  Cpu,
  AlertTriangle,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Server,
} from 'lucide-react';
import type { AdminMetrics, Build, Project, User } from '../types';

interface AdminViewProps {
  currentUser: User;
  onNavigateToBuild: (buildId: string) => void;
  onNavigateToProject: (projectId: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  onNavigateToBuild,
  onNavigateToProject,
}) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [workerInfo, setWorkerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Demo user management
  const [usersList, setUsersList] = useState([
    { id: 'usr_1', name: 'Dev Account', email: 'dev@web2apk.local', plan: 'pro', status: 'active', builds: 12 },
    { id: 'usr_2', name: 'Elena Rostov', email: 'elena@nordicstyle.se', plan: 'starter', status: 'active', builds: 4 },
    { id: 'usr_3', name: 'Marcus Chen', email: 'marcus@techpulse.dev', plan: 'enterprise', status: 'active', builds: 38 },
    { id: 'usr_4', name: 'Samantha Vance', email: 'sam@agencyweb.co', plan: 'free', status: 'suspended', builds: 1 },
  ]);

  useEffect(() => {
    fetch('/api/system/worker-status')
      .then(res => res.json())
      .then(data => {
        setMetrics(data.metrics);
        setWorkerInfo(data.workerInfo);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleUserStatus = (userId: string) => {
    setUsersList(
      usersList.map(u =>
        u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
      )
    );
  };

  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          Administrator privileges are required to access this console.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Admin Console</h1>
        </div>
        <p className="text-xs text-slate-500">
          Real-time cluster infrastructure, worker queues, and tenant administration.
        </p>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Registered Users</span>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
              {metrics.totalUsers}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Active across all plans</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Total Built Apps</span>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
              {metrics.totalProjects}
            </p>
            <span className="text-[11px] text-indigo-600 font-medium mt-1 block">Production wraps</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Total Builds Run</span>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
              {metrics.totalBuilds}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
              {metrics.successfulBuilds} successful · {metrics.failedBuilds} failed
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Storage Allocated</span>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
              {metrics.storageUsedMb} MB
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Artifacts & APK bundles</span>
          </div>
        </div>
      )}

      {/* Worker Pool Status */}
      {workerInfo && (
        <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="font-bold text-sm text-white block">{workerInfo.mode}</span>
                <span className="text-xs text-slate-400 font-mono">{workerInfo.runnerVersion}</span>
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
              Queue Latency: {workerInfo.queueLatencyMs}ms
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300">
            {workerInfo.dockerCommand}
          </div>
        </div>
      )}

      {/* Users Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Tenant & Account Administration</h2>
          <p className="text-xs text-slate-500">Audit user quotas, subscription plans, and account flags.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-6">User Name</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Plan</th>
                <th className="py-3 px-6">Builds Run</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3.5 px-6 font-mono text-slate-500">{u.email}</td>
                  <td className="py-3.5 px-6 capitalize font-semibold text-indigo-600">{u.plan}</td>
                  <td className="py-3.5 px-6 font-mono tabular-nums">{u.builds}</td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                        u.status === 'active'
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
