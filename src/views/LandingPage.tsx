import React, { useState } from 'react';
import {
  Smartphone,
  Globe,
  Zap,
  ShieldCheck,
  Download,
  ArrowRight,
  Layers,
  Sparkles,
  Palette,
  Bell,
  Camera,
  MapPin,
  UploadCloud,
  WifiOff,
  FolderGit2,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import type { WebsiteAnalysis } from '../types';
import heroPhoneImage from '../assets/images/hero_phone_converter_1791222367369.jpg';

interface LandingPageProps {
  onStartWizard: (initialUrl?: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigate: (route: string) => void;
  isAuthenticated?: boolean;
  onSignOut?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartWizard,
  onOpenAuth,
  onNavigate,
  isAuthenticated = false,
  onSignOut,
}) => {
  const [testUrl, setTestUrl] = useState('https://yesufapp.com');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WebsiteAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleTestUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      let formattedUrl = testUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
        setTestUrl(formattedUrl);
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze website');
      }

      const data: WebsiteAnalysis = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      setAnalysisError(err.message || 'Website unreachable or invalid format');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const featureCards = [
    {
      title: 'Universal Dual-Platform Build',
      desc: 'Seamlessly convert any responsive website into native Android (APK/AAB) and Apple iOS (IPA/Xcode) apps.',
      icon: Globe,
    },
    {
      title: 'Apple iOS IPA & Xcode',
      desc: 'Compile signed iOS IPAs and export full Swift 5.9 + WKWebView projects ready for TestFlight and App Store.',
      icon: Layers,
    },
    {
      title: 'Android APK & Play Store AAB',
      desc: 'Generate standalone release APKs and Google Play Console App Bundles (AAB) with Android 14 API 34 compliance.',
      icon: Smartphone,
    },
    {
      title: 'Custom Branding & Theming',
      desc: 'Configure primary and accent colors, splash backgrounds, Dynamic Island styling, and status bar themes.',
      icon: Palette,
    },
    {
      title: 'Adaptive Icons & Launch Screens',
      desc: 'Generate Android adaptive launcher icons and Apple iOS AppIcon assets directly from your favicon.',
      icon: Zap,
    },
    {
      title: 'Push Notifications Ready',
      desc: 'Integrate Firebase Cloud Messaging (FCM) and Apple APNs tokens to engage mobile users anytime.',
      icon: Bell,
    },
    {
      title: 'Universal Deep Linking',
      desc: 'Support Android App Links and Apple Universal Links to open web URLs directly inside your native application.',
      icon: ExternalLink,
    },
    {
      title: 'Camera & Gallery Uploads',
      desc: 'Built-in WebChromeClient and WKUIDelegate file-chooser handling with native camera capture permissions.',
      icon: Camera,
    },
    {
      title: 'Geolocation Support',
      desc: 'Grant GPS location access smoothly with Android and iOS runtime permission prompts.',
      icon: MapPin,
    },
    {
      title: 'File Downloads & Caching',
      desc: 'Native download management with background download notifications and offline caching.',
      icon: UploadCloud,
    },
    {
      title: 'Offline & Error Recovery',
      desc: 'Graceful fallback screen with retry button when users experience intermittent network connectivity.',
      icon: WifiOff,
    },
    {
      title: 'Full-Screen Immersive WebView',
      desc: 'Edge-to-edge hardware-accelerated viewport with pull-to-refresh, zoom controls, and smooth back-swipe gestures.',
      icon: Smartphone,
    },
    {
      title: 'Full Source Code ZIP Export',
      desc: 'Download clean, un-obfuscated Kotlin and Swift projects to edit locally in Android Studio or Xcode.',
      icon: Download,
    },
    {
      title: 'Cloud Build History & Logs',
      desc: 'Inspect real-time terminal compilation logs with Gradle R8 and Xcode archive outputs.',
      icon: FolderGit2,
    },
    {
      title: 'Enterprise Management',
      desc: 'Manage multiple web applications, version updates, and rollouts across both platforms from one dashboard.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                Enterprise Website-to-Mobile Platform (Android & iOS)
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] text-balance">
                Turn Any Website Into <span className="text-indigo-600">Android & iOS Apps</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Create, customize, preview, and build production-ready Android APK/AAB and Apple iOS IPA/Xcode projects directly from your existing website — without writing mobile code.
              </p>

              {/* Trust signals */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No coding required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Android APK & AAB</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Apple iOS IPA & Xcode</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full source code ZIP</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dynamic Island & Notch</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cloud build runners</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                <img
                  src={heroPhoneImage}
                  alt="Turn any website into an Android App preview"
                  className="w-full h-auto object-cover block"
                  loading="eager"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = 'true';
                      target.src = '/assets/images/hero_phone_converter_1791222367369.jpg';
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 block mb-1">
                      Native Android Architecture
                    </span>
                    <p className="text-sm font-semibold">
                      Direct WebView integration with hardware acceleration and deep links.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE COMPATIBILITY CHECKER */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Live Website Analyzer
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Check Your Website Compatibility in Real Time
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Enter any publicly accessible URL to verify reachability, security headers, metadata, and Android compatibility.
            </p>
          </div>

          <form onSubmit={handleTestUrl} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={testUrl}
                onChange={e => setTestUrl(e.target.value)}
                placeholder="https://yourstore.com"
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl transition-all shrink-0 cursor-pointer shadow-sm"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Website'}
            </button>
          </form>

          {/* Analysis Results Box */}
          {analysisResult && (
            <div className="mt-6 p-5 rounded-2xl border border-slate-200 bg-slate-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <img
                    src={analysisResult.favicon}
                    alt={analysisResult.title}
                    className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-slate-200"
                    onError={e => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{analysisResult.title}</h3>
                    <p className="text-xs text-slate-500 font-mono">{analysisResult.url}</p>
                  </div>
                </div>

                <button
                  onClick={() => onStartWizard(analysisResult.url)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Configure This App
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Status</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Reachable ({analysisResult.statusCode || 200})
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Protocol</span>
                  <span className="font-semibold text-slate-900">
                    {analysisResult.https ? 'Secure HTTPS' : 'Insecure HTTP'}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Theme Color</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: analysisResult.themeColor }}
                    />
                    <span className="font-mono text-xs">{analysisResult.themeColor}</span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Suggested Package</span>
                  <span className="font-mono text-indigo-600 truncate block">
                    {analysisResult.suggestedPackageName}
                  </span>
                </div>
              </div>

              {analysisResult.warnings.length > 0 && (
                <div className="mt-2 space-y-1.5 bg-amber-50/70 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
                  <span className="font-semibold flex items-center gap-1.5 text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Important Compatibility Guidance:
                  </span>
                  {analysisResult.warnings.map((warn, i) => (
                    <p key={i} className="text-[11px] text-amber-800/90 pl-5">
                      • {warn}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {analysisError && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS (4 STEPS) */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            How Web2APK Works
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            From entering your live website URL to running the generated APK on your Android device in under two minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Enter Your Website</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Input any publicly reachable domain. Our automated analyzer extracts title, metadata, icons, and validates security headers.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Customize Your App</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Brand your app with custom icons, splash screens, status bar colors, and native device permissions (camera, location, storage).
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Preview Your App</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Test your configuration inside our realistic interactive Android phone frame in both portrait and landscape orientations.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Build & Download</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trigger our automated Gradle pipeline. Download signed standalone APK, Google Play AAB, or full Android Studio Kotlin source code.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Enterprise Feature Suite
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Everything Needed for Production Android Apps
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Engineered with modern AndroidX WebView standards, robust permission delegates, and strict security configurations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FOOTER CALLOUT */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Ready to Launch Your Android App Today?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-8">
            Join thousands of e-commerce brands, publishers, and developers delivering fast, responsive Android apps from their existing websites.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onStartWizard()}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg cursor-pointer"
            >
              Start Building Free
            </button>
            <button
              onClick={() => onNavigate('docs')}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
            >
              Explore Documentation
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => {
              onNavigate('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-left cursor-pointer group"
            title="Web2APK — Go to Home Page"
          >
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white group-hover:bg-indigo-700 transition-colors shadow-2xs">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Web2<span className="text-indigo-600">APK</span>
            </span>
            <span className="text-slate-400">© 2026. All rights reserved.</span>
          </button>

          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('landing')} className="hover:text-slate-800">
              Home
            </button>
            <button onClick={() => onNavigate('pricing')} className="hover:text-slate-800">
              Pricing
            </button>
            <button onClick={() => onNavigate('docs')} className="hover:text-slate-800">
              Documentation
            </button>
            <button onClick={() => onNavigate('admin')} className="hover:text-slate-800">
              Admin Status
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
