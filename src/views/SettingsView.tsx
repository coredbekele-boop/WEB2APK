import React, { useState } from 'react';
import {
  User as UserIcon,
  Shield,
  Key,
  Webhook,
  Save,
  Check,
  RefreshCw,
  ShieldCheck,
  Upload,
  AlertCircle,
  FileCheck,
  KeyRound,
} from 'lucide-react';
import type { User, SigningValidationResult } from '../types';

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

  // Signing Keystore State
  const [signingMode, setSigningMode] = useState<'managed' | 'custom'>('managed');
  const [keystoreFileName, setKeystoreFileName] = useState('');
  const [keystoreBase64, setKeystoreBase64] = useState('');
  const [keystorePassword, setKeystorePassword] = useState('');
  const [keyAlias, setKeyAlias] = useState('release');
  const [keyPassword, setKeyPassword] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<SigningValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleKeystoreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setKeystoreFileName(file.name);
    setValidationResult(null);
    setValidationError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const b64 = res.split(',')[1] || res;
      setKeystoreBase64(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleValidateKeystore = async () => {
    setIsValidating(true);
    setValidationError(null);
    setValidationResult(null);

    try {
      if (signingMode === 'custom') {
        if (!keystoreBase64) {
          setValidationError('Please upload a keystore file (.jks, .keystore, .p12, .pem).');
          setIsValidating(false);
          return;
        }
        if (!keystorePassword) {
          setValidationError('Please enter the keystore password.');
          setIsValidating(false);
          return;
        }
      }

      const res = await fetch('/api/keystore/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: signingMode,
          keystoreBase64: signingMode === 'custom' ? keystoreBase64 : undefined,
          keystorePassword: signingMode === 'custom' ? keystorePassword : undefined,
          keyAlias: signingMode === 'custom' ? keyAlias : undefined,
          keyPassword: signingMode === 'custom' ? keyPassword : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setValidationError(data.error || data.details || 'Keystore verification failed');
        onShowToast('Keystore Validation Failed', data.error || 'Invalid credentials or file', 'info');
      } else {
        setValidationResult(data);
        onShowToast('Keystore Verified', data.message || 'Signing configuration is valid for production builds', 'success');
      }
    } catch (err: any) {
      setValidationError(err.message || 'Validation request failed');
      onShowToast('Validation Error', err.message, 'info');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateUser({ name, email });
      setIsSaving(false);
      onShowToast('Settings Saved', 'Profile, code signing, and developer preferences updated successfully.', 'success');
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

      {/* Release Keystore & Code Signing */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Release Keystore & Code Signing</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Configure release keys for production APK/AAB and verify integrity prior to sending build jobs to workers.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            Dual v1+v2 Scheme
          </span>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setSigningMode('managed');
              setValidationError(null);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              signingMode === 'managed'
                ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Managed Cloud Keystore</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Pre-Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Default 2048-bit RSA release signing certificate managed securely by Web2APK cloud runners.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSigningMode('custom');
              setValidationError(null);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              signingMode === 'custom'
                ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Custom Organization Keystore</span>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                Custom Keys
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Upload your own production Android .jks, .keystore, .p12, or PEM certificates.
            </p>
          </button>
        </div>

        {/* Custom Keystore Inputs */}
        {signingMode === 'custom' && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Upload Keystore File (.jks, .keystore, .p12, .pem)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 rounded-xl p-4 text-center cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-700 block">
                    {keystoreFileName ? keystoreFileName : 'Click or drop keystore file here'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Supported: Java Keystore (.jks), PKCS#12 (.p12), Android Release Keystore (.keystore)
                  </span>
                  <input
                    type="file"
                    accept=".jks,.keystore,.p12,.pem,.crt"
                    onChange={handleKeystoreUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keystore Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={keystorePassword}
                  onChange={e => {
                    setKeystorePassword(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder="Password"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Alias
                </label>
                <input
                  type="text"
                  value={keyAlias}
                  onChange={e => {
                    setKeyAlias(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder="e.g. release, key0"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Password (Optional)
                </label>
                <input
                  type="password"
                  value={keyPassword}
                  onChange={e => {
                    setKeyPassword(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder="Same as keystore"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Validation Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleValidateKeystore}
            disabled={isValidating}
            className="px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            {isValidating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Validating Keystore & Certificates...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>Verify Keystore & Signing Configuration</span>
              </>
            )}
          </button>

          <span className="text-[11px] text-slate-400">
            Validated configurations ensure workers accept and sign release builds without failure.
          </span>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-900">Keystore Validation Failed</h4>
              <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">{validationError}</p>
            </div>
          </div>
        )}

        {/* Validation Success Card */}
        {validationResult && validationResult.valid && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Signing Configuration Verified Successfully</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
              <div>
                <span className="font-semibold text-slate-700">Format:</span> {validationResult.format}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Key Alias:</span> {validationResult.alias}
              </div>
              {validationResult.certificate && (
                <>
                  <div className="sm:col-span-2 truncate">
                    <span className="font-semibold text-slate-700">Subject:</span> {validationResult.certificate.subject}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Valid Until:</span> {validationResult.certificate.validTo}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Key Spec:</span> {validationResult.certificate.keySize}-bit {validationResult.certificate.keyAlgorithm}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
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
