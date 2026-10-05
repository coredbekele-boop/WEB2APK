import React, { useState } from 'react';
import { User as UserIcon, Shield, Key, Webhook, Save, Check, RefreshCw } from 'lucide-react';
import type { User } from '../types';

interface SettingsViewProps {
  user: User;
  onUpdateUser: (updated: Partial<User>) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  onShowToast,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [apiKey, setApiKey] = useState('w2apk_live_99a8b7c6d5e4f3a2b1c0');
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourcompany.com/webhooks/builds');
  const [defaultPrefix, setDefaultPrefix] = useState('com.mycompany');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateUser({ name, email });
      setIsSaving(false);
      onShowToast('Settings Saved', 'Profile and developer preferences updated successfully.', 'success');
    }, 400);
  };

  const handleRotateKey = () => {
    const newKey = `w2apk_live_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
    setApiKey(newKey);
    onShowToast('API Key Rotated', 'New secret key generated. Ensure you update your CI/CD runner secrets.', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account & Developer Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal profile, default build parameters, and automated CI/CD webhooks.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <UserIcon className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">User Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Default Build Settings */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Default Build Settings</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Default Package Name Prefix
            </label>
            <input
              type="text"
              value={defaultPrefix}
              onChange={e => setDefaultPrefix(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Used when auto-suggesting Android Application IDs.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Default Target SDK
            </label>
            <select className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg">
              <option>Android 14 (API 34) — Play Store Standard</option>
              <option>Android 13 (API 33)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Developer API & Webhooks */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <Key className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Developer API & Webhooks</h2>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Active REST API Secret Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              readOnly
              className="flex-1 px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
            />
            <button
              onClick={handleRotateKey}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rotate Key</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Authenticate automated build triggers via <code className="font-mono">Authorization: Bearer key</code>.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Build Completion Webhook URL
          </label>
          <div className="relative">
            <Webhook className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
