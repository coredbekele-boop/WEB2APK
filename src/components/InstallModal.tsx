import React, { useState } from 'react';
import {
  Smartphone,
  X,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Share2,
  Mail,
  QrCode,
  Terminal,
} from 'lucide-react';
import type { Build, Project } from '../types';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: Build;
  project?: Project;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  build,
  project,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAdb, setCopiedAdb] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'guide' | 'cloud'>('qr');

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const downloadUrl = `${origin}/api/builds/${build.id}/download-apk`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(downloadUrl)}`;
  const adbCommand = `adb install -r ${project?.packageName || 'app'}-v${build.versionName}.apk`;

  const copyLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyAdb = () => {
    navigator.clipboard.writeText(adbCommand);
    setCopiedAdb(true);
    setTimeout(() => setCopiedAdb(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Install APK on Smartphone</h3>
              <p className="text-xs text-slate-300">
                {build.appName} v{build.versionName} · {build.fileSize || '17.8 MB'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'qr'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Phone Install Steps</span>
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'cloud'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Cloud & ADB</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block mx-auto shadow-inner">
                <img
                  src={qrCodeUrl}
                  alt="Scan to download APK"
                  className="w-52 h-52 mx-auto rounded-xl object-contain bg-white p-2 shadow-xs"
                />
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900">Scan with Android Camera</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Point your phone camera at this QR code to download the verified APK directly to your smartphone.
                </p>
              </div>

              {/* Download URL Copy Field */}
              <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-xl text-xs font-mono text-slate-700">
                <span className="truncate flex-1 text-left px-2 select-all">{downloadUrl}</span>
                <button
                  onClick={copyLink}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-sans font-semibold rounded-lg shrink-0 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3 text-indigo-950">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Binary AXML & V2 Signed</h4>
                  <p className="text-[11px] text-indigo-800 mt-0.5">
                    This APK has compiled binary AXML and cryptographic signatures, compatible with Android 7.0 through Android 15.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">Download the APK File</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Download the APK using the button below or by scanning the QR code on your Android device.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">Allow "Install Unknown Apps"</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      If your phone displays <em>"For security, your phone is not allowed to install unknown apps"</em>, tap <strong>Settings</strong> and toggle on <strong>"Allow from this source"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">Tap "Install" & Launch</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tap <strong>Install</strong> on the package confirmation screen. Once installed, tap <strong>Open</strong> to launch your standalone web app!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Deploying on Google Cloud Console</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  You can deploy this Web2APK service on Google Cloud Run directly from Cloud Shell or Cloud Console:
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-800 text-[11px]">1. Deploy to Google Cloud Run:</span>
                <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto">
{`gcloud run deploy web2apk \\
  --source . \\
  --platform managed \\
  --allow-unauthenticated \\
  --port 3000`}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-800 text-[11px]">2. Install via ADB (USB Debugging / Emulator):</span>
                <div className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-xl font-mono text-[11px] text-emerald-400">
                  <span className="flex-1 truncate select-all">{adbCommand}</span>
                  <button
                    onClick={copyAdb}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-sans text-xs cursor-pointer"
                  >
                    {copiedAdb ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={copyLink}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Download Link'}</span>
          </button>

          <a
            href={downloadUrl}
            download
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download APK ({build.fileSize || '17.8 MB'})</span>
          </a>
        </div>
      </div>
    </div>
  );
};
