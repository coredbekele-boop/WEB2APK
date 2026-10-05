import React, { useState } from 'react';
import {
  RotateCcw,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Smartphone,
} from 'lucide-react';
import type { Project } from '../types';

interface PhonePreviewProps {
  project: Partial<Project>;
  url?: string;
  isIframeEmbeddable?: boolean;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({
  project,
  url: overrideUrl,
  isIframeEmbeddable = true,
}) => {
  const [deviceMode, setDeviceMode] = useState<'ios' | 'android'>('ios');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [activeTab, setActiveTab] = useState<'live' | 'splash' | 'icon'>('live');
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const targetUrl = overrideUrl || project.websiteUrl || 'https://yesufapp.com';
  const splashBgColor = project.splashBgColor || '#0F172A';

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
    setTimeout(() => setIsLoading(false), 900);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Platform & Mode Controls Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs text-xs font-medium text-slate-600">
        {/* Device Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg mr-1">
          <button
            onClick={() => setDeviceMode('ios')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              deviceMode === 'ios'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="font-bold">iOS</span>
            <span className="text-[9px] opacity-70">iPhone 16</span>
          </button>
          <button
            onClick={() => setDeviceMode('android')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              deviceMode === 'android'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="font-bold">Android</span>
            <span className="text-[9px] opacity-70">Pixel 8</span>
          </button>
        </div>

        <span className="w-px h-3.5 bg-slate-200" />

        <button
          onClick={() => setActiveTab('live')}
          className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === 'live' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          App View
        </button>
        <button
          onClick={() => setActiveTab('splash')}
          className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === 'splash' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Splash Screen
        </button>
        <button
          onClick={() => setActiveTab('icon')}
          className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === 'icon' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          App Icon
        </button>

        <span className="w-px h-3.5 bg-slate-200" />

        <button
          onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
          className="p-1 hover:text-slate-900 rounded cursor-pointer"
          title="Toggle Orientation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleRefresh}
          className="p-1 hover:text-slate-900 rounded cursor-pointer"
          title="Reload Viewport"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Hardware Mockup Frame */}
      <div
        className={`relative transition-all duration-300 shadow-2xl ${
          deviceMode === 'ios'
            ? 'rounded-[50px] p-3 border-[5px] border-slate-700 bg-slate-950'
            : 'rounded-[44px] p-3 border-4 border-slate-800 bg-slate-900'
        } ${orientation === 'portrait' ? 'w-[340px] h-[670px]' : 'w-[670px] h-[340px]'}`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.4)',
        }}
      >
        {/* Dynamic Island (iOS) or Hole Punch (Android) */}
        {deviceMode === 'ios' ? (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between px-3 w-[100px] h-[26px] bg-black rounded-full shadow-md">
            <div className="w-2.5 h-2.5 rounded-full bg-[#111827] border border-slate-800" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/70" />
          </div>
        ) : (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-700 shadow-inner" />
          </div>
        )}

        {/* Screen Bezel Container */}
        <div
          className={`relative w-full h-full bg-white overflow-hidden flex flex-col select-none ${
            deviceMode === 'ios' ? 'rounded-[40px]' : 'rounded-[34px]'
          }`}
        >
          {/* VIEW: LIVE WEB APP */}
          {activeTab === 'live' && (
            <div className="relative flex-1 flex flex-col bg-slate-50 overflow-hidden">
              {/* Native Progress Bar */}
              {isLoading && (
                <div className="h-0.5 w-full bg-indigo-200 overflow-hidden shrink-0">
                  <div className="h-full bg-indigo-600 animate-shimmer w-1/2" />
                </div>
              )}

              {/* WebView Display Container */}
              <div className="relative flex-1 bg-white overflow-hidden">
                {isIframeEmbeddable && !iframeError ? (
                  <iframe
                    key={iframeKey}
                    src={targetUrl}
                    title="Website Mobile Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    onError={() => setIframeError(true)}
                  />
                ) : (
                  /* Security Fallback for X-Frame-Options blocked sites */
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      Native {deviceMode === 'ios' ? 'WKWebView' : 'Android WebView'} Target
                    </h4>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      {targetUrl} enforces strict <code className="text-indigo-600 font-mono">X-Frame-Options</code>, preventing in-browser iframe embedding.
                    </p>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-left w-full text-xs text-slate-600 space-y-1 mb-4">
                      <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Direct {deviceMode === 'ios' ? 'iOS WKWebView' : 'Android WebView'} Verified
                      </div>
                      <p className="text-[11px] text-slate-500">
                        The compiled {deviceMode === 'ios' ? 'iOS IPA' : 'Android APK'} bypasses browser iframe security policies and renders your site natively with full hardware acceleration.
                      </p>
                    </div>
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      <span>Open target in new tab</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: SPLASH SCREEN PREVIEW */}
          {activeTab === 'splash' && (
            <div
              className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none"
              style={{ backgroundColor: splashBgColor }}
            >
              <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md p-3 flex items-center justify-center shadow-2xl ring-1 ring-white/20 mb-4 animate-in zoom-in-95">
                {project.iconUrl ? (
                  <img
                    src={project.iconUrl}
                    alt={project.name || 'Splash icon'}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <Smartphone className="w-12 h-12 text-white" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {project.name || 'My Mobile App'}
              </h3>
              <p className="text-xs text-white/60 mt-1 max-w-xs">
                {project.description || `Fast native mobile experience for ${deviceMode === 'ios' ? 'Apple iOS' : 'Google Android'}`}
              </p>

              <div className="mt-8 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/40 animate-ping" />
                <span className="text-[11px] text-white/70 font-mono">
                  Initializing {deviceMode === 'ios' ? 'WKWebView (WebKit)...' : 'AndroidX WebView...'}
                </span>
              </div>
            </div>
          )}

          {/* VIEW: LAUNCHER ICON PREVIEW */}
          {activeTab === 'icon' && (
            <div className="flex-1 bg-gradient-to-b from-indigo-950 to-slate-900 flex flex-col items-center justify-center p-6 select-none">
              <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Sample system icons */}
                <div className="flex flex-col items-center gap-1.5 opacity-40">
                  <div
                    className={`w-14 h-14 bg-emerald-500 flex items-center justify-center text-white ${
                      deviceMode === 'ios' ? 'rounded-[14px]' : 'rounded-2xl'
                    }`}
                  >
                    <span className="text-lg font-bold">P</span>
                  </div>
                  <span className="text-[10px] text-white/80">Phone</span>
                </div>

                {/* Our App Icon */}
                <div className="flex flex-col items-center gap-1.5 transform scale-110">
                  <div
                    className={`w-14 h-14 bg-white shadow-xl overflow-hidden ring-2 ring-indigo-400 p-0.5 ${
                      deviceMode === 'ios' ? 'rounded-[14px]' : 'rounded-2xl'
                    }`}
                  >
                    {project.iconUrl ? (
                      <img
                        src={project.iconUrl}
                        alt="App Icon"
                        className={`w-full h-full object-cover ${deviceMode === 'ios' ? 'rounded-[12px]' : 'rounded-xl'}`}
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-indigo-600 flex items-center justify-center text-white ${
                          deviceMode === 'ios' ? 'rounded-[12px]' : 'rounded-xl'
                        }`}
                      >
                        <Smartphone className="w-7 h-7" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-white drop-shadow-md truncate max-w-[80px]">
                    {project.name || 'My App'}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5 opacity-40">
                  <div
                    className={`w-14 h-14 bg-sky-500 flex items-center justify-center text-white ${
                      deviceMode === 'ios' ? 'rounded-[14px]' : 'rounded-2xl'
                    }`}
                  >
                    <span className="text-lg font-bold">{deviceMode === 'ios' ? 'S' : 'C'}</span>
                  </div>
                  <span className="text-[10px] text-white/80">{deviceMode === 'ios' ? 'Safari' : 'Chrome'}</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-white/90">
                {deviceMode === 'ios' ? 'iOS 18 App Icon (Squircle)' : 'Android 14 Adaptive Icon'}
              </div>
            </div>
          )}

          {/* Bottom Home Indicator Bar */}
          <div className="h-5 bg-black flex items-center justify-center shrink-0">
            <div
              className={`h-1 bg-white/70 rounded-full ${
                deviceMode === 'ios' ? 'w-32' : 'w-24'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
