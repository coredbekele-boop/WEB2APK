import React, { useState, useEffect } from 'react';
import {
  Globe,
  Smartphone,
  Palette,
  Sliders,
  Settings2,
  Eye,
  Hammer,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Upload,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Lock,
} from 'lucide-react';
import type { Project, NavigationType, NavItem, WebsiteAnalysis } from '../types';
import { PhonePreview } from '../components/PhonePreview';

interface CreateAppWizardProps {
  initialUrl?: string;
  onCancel: () => void;
  onProjectCreated: (project: Project, buildId?: string) => void;
  isAuthenticated?: boolean;
  onRequireLogin?: (reason?: string) => void;
}

export const CreateAppWizard: React.FC<CreateAppWizardProps> = ({
  initialUrl = '',
  onCancel,
  onProjectCreated,
  isAuthenticated = false,
  onRequireLogin,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [websiteUrl, setWebsiteUrl] = useState(initialUrl || 'https://nordicliving.store');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Step 2: Details
  const [appName, setAppName] = useState('');
  const [description, setDescription] = useState('');
  const [packageName, setPackageName] = useState('');
  const [packageError, setPackageError] = useState<string | null>(null);

  // Step 3: Branding
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [secondaryColor, setSecondaryColor] = useState('#06B6D4');
  const [splashBgColor, setSplashBgColor] = useState('#0F172A');
  const [iconUrl, setIconUrl] = useState('');
  const [splashUrl, setSplashUrl] = useState('');

  // Navigation & Items
  const [navigationType, setNavigationType] = useState<NavigationType>('website');
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  // Step 5: App Behavior
  const [permissions, setPermissions] = useState({
    javascript: true,
    cookies: true,
    localStorage: true,
    pullToRefresh: true,
    fileUpload: true,
    camera: true,
    microphone: false,
    geolocation: true,
    externalLinks: true,
    handleDownloads: true,
    telLinks: true,
    mailtoLinks: true,
    deepLinks: true,
  });

  // Step 5: Platform Settings (Android & iOS)
  const [targetPlatforms, setTargetPlatforms] = useState<('android' | 'ios')[]>(['android']);
  const [platformTab, setPlatformTab] = useState<'android' | 'ios'>('android');
  const [versionName, setVersionName] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState(1);
  const [minSdkVersion, setMinSdkVersion] = useState(24);
  const [targetSdkVersion, setTargetSdkVersion] = useState(34);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('portrait');

  // iOS Specific Settings
  const [iosBundleId, setIosBundleId] = useState('');
  const [iosTargetVersion, setIosTargetVersion] = useState('16.0');
  const [iosTeamId, setIosTeamId] = useState('');
  const [iosAppName, setIosAppName] = useState('');

  const [buildType, setBuildType] = useState<'apk' | 'bundle' | 'ipa'>('apk');

  // Run analysis if initialUrl provided
  useEffect(() => {
    if (initialUrl) {
      handleAnalyze(initialUrl);
    }
  }, [initialUrl]);

  const validatePackageName = (name: string) => {
    const regex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
    if (!regex.test(name)) {
      setPackageError('Package name must follow reverse domain convention (e.g. com.company.app) using lowercase letters and dots.');
      return false;
    }
    setPackageError(null);
    return true;
  };

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const url = (urlToAnalyze || websiteUrl).trim();
    if (!url) return;

    let finalUrl = url;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
      setWebsiteUrl(finalUrl);
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze website');
      }

      const data: WebsiteAnalysis = await res.json();
      setAnalysis(data);

      // Auto-populate
      if (!appName || appName === 'My Web App') setAppName(data.suggestedAppName);
      if (!description) setDescription(data.description);
      if (!packageName) setPackageName(data.suggestedPackageName);
      if (!iosBundleId) setIosBundleId(data.suggestedPackageName);
      if (!iosAppName) setIosAppName(data.suggestedAppName);
      if (data.favicon && !iconUrl) setIconUrl(data.favicon);
      if (data.themeColor && data.themeColor !== '#4F46E5') setPrimaryColor(data.themeColor);
    } catch (err: any) {
      setAnalysisError(err.message || 'Error communicating with analyzer service');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddNavItem = () => {
    const newId = `${Date.now()}`;
    setNavItems([...navItems, { id: newId, label: 'Page', url: '/', icon: 'Home' }]);
  };

  const handleRemoveNavItem = (id: string) => {
    setNavItems(navItems.filter(item => item.id !== id));
  };

  const handleUpdateNavItem = (id: string, field: keyof NavItem, value: string) => {
    setNavItems(navItems.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleFinalSubmit = async () => {
    if (!isAuthenticated) {
      if (onRequireLogin) {
        onRequireLogin('You must log in to create and build your mobile application.');
      }
      return;
    }

    if (!validatePackageName(packageName)) {
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      const projectData = {
        name: appName || 'My Mobile App',
        websiteUrl,
        packageName,
        description,
        iconUrl: iconUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
        splashUrl,
        primaryColor,
        secondaryColor,
        splashBgColor,
        navigationType,
        navItems,
        permissions,
        orientation,
        versionName,
        versionCode,
        minSdkVersion,
        targetSdkVersion,
        platforms: targetPlatforms,
        iosBundleId: iosBundleId || packageName,
        iosTargetVersion,
        iosTeamId,
        iosAppName: iosAppName || appName,
      };

      // 1. Create project
      const createRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (!createRes.ok) throw new Error('Failed to create project');
      const { project } = await createRes.json();

      let buildId;

      // 2. Trigger initial build
      const isIos = buildType === 'ipa';
      const buildRes = await fetch(`/api/projects/${project.id}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: isIos ? 'ios' : 'android',
          buildType,
        }),
      });

      if (buildRes.ok) {
        const buildData = await buildRes.json();
        buildId = buildData.build?.id;
      }

      onProjectCreated(project, buildId);
    } catch (err: any) {
      alert(`Error creating app: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview project object
  const previewProject: Partial<Project> = {
    name: appName || 'My Mobile App',
    websiteUrl,
    packageName,
    description,
    primaryColor,
    secondaryColor,
    splashBgColor,
    iconUrl,
    navigationType,
    navItems,
    orientation,
  };

  const steps = [
    { num: 1, title: 'Website', icon: Globe },
    { num: 2, title: 'Details', icon: Smartphone },
    { num: 3, title: 'Branding', icon: Palette },
    { num: 4, title: 'Behavior', icon: Sliders },
    { num: 5, title: 'Platforms', icon: Settings2 },
    { num: 6, title: 'Preview', icon: Eye },
    { num: 7, title: 'Build', icon: Hammer },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Wizard Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Create App Wizard
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Configure Your Mobile Application</h1>
          <p className="text-xs text-slate-500 mt-0.5">Step {currentStep} of 7: {steps[currentStep - 1].title}</p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
        >
          Cancel & Exit
        </button>
      </div>

      {/* Login Required Notice if unauthenticated */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-950">Login Required to Create Apps</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-800 uppercase tracking-wider">
                  Authentication Needed
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                You must log in to create and save your mobile application and compile Android APK / Apple iOS packages.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onRequireLogin && onRequireLogin('Please log in or register to create and compile this mobile app.')}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Sign In to Create App
            </button>
          </div>
        </div>
      )}

      {/* Step Indicator Bar */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-[640px]">
          {steps.map(step => {
            const Icon = step.icon;
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <button
                key={step.num}
                onClick={() => {
                  if (step.num < currentStep) setCurrentStep(step.num);
                }}
                className={`flex flex-col items-center gap-1.5 text-xs font-medium cursor-pointer transition-all ${
                  isCurrent
                    ? 'text-indigo-600 font-bold'
                    : isDone
                    ? 'text-slate-900 hover:text-indigo-600'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[11px] whitespace-nowrap">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Controls Column */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          {/* STEP 1: WEBSITE */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Enter Your Website URL</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Public Website URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={e => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourstore.com"
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAnalyze()}
                    disabled={isAnalyzing}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors shrink-0 shadow-xs"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Website'}
                  </button>
                </div>
              </div>

              {/* Analysis Result Display */}
              {analysis && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">Analysis Summary</span>
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Connected ({analysis.statusCode || 200})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={analysis.favicon}
                      alt={analysis.title}
                      className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{analysis.title}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-sm">{analysis.description}</p>
                    </div>
                  </div>

                  {analysis.warnings.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-[11px] text-amber-800 space-y-1">
                      <span className="font-semibold block">Detected Notices:</span>
                      {analysis.warnings.map((w, i) => (
                        <p key={i}>• {w}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {analysisError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: APP DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-slate-900">App Identity & Package Details</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Define the public mobile name and reverse-domain identifier for the Google Play Store.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Application Name
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={e => setAppName(e.target.value)}
                  placeholder="e.g. Nordic Living"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Official Android mobile app for Nordic Living decor & store."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Package Name (Application ID)
                </label>
                <input
                  type="text"
                  value={packageName}
                  onChange={e => {
                    setPackageName(e.target.value);
                    validatePackageName(e.target.value);
                  }}
                  placeholder="com.yourcompany.app"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {packageError ? (
                  <p className="text-[11px] text-red-600 mt-1">{packageError}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Standard Android format: at least two dot-separated segments in lowercase.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: BRANDING */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Branding & Color Palette</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure status bar, brand tints, app icons, and launch splash screens.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Primary / Status Bar
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={e => setSecondaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={e => setSecondaryColor(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Splash Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={splashBgColor}
                      onChange={e => setSplashBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={splashBgColor}
                      onChange={e => setSplashBgColor(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  App Launcher Icon URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={iconUrl}
                    onChange={e => setIconUrl(e.target.value)}
                    placeholder="https://yesufapp.com/icon.png"
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                  />
                  {iconUrl && (
                    <img
                      src={iconUrl}
                      alt="Icon preview"
                      className="w-9 h-9 rounded-lg object-contain bg-white border border-slate-200"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: APP BEHAVIOR */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-slate-900">App Behavior & Permissions</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Control native device access, storage flags, and URL handling policies.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'javascript', label: 'JavaScript Engine', desc: 'Mandatory for modern web apps' },
                  { key: 'cookies', label: 'Cookie & Session Storage', desc: 'Allows persistent logins' },
                  { key: 'localStorage', label: 'DOM LocalStorage & IndexedDB', desc: 'Enables client caching' },
                  { key: 'pullToRefresh', label: 'Pull to Refresh', desc: 'Native swipe refresh control' },
                  { key: 'fileUpload', label: 'File Upload Support', desc: 'Camera & photo chooser dialog' },
                  { key: 'camera', label: 'Camera Hardware Access', desc: 'Android camera permission' },
                  { key: 'microphone', label: 'Microphone Audio Input', desc: 'Voice recording features' },
                  { key: 'geolocation', label: 'GPS Geolocation Access', desc: 'Location coordinates' },
                  { key: 'externalLinks', label: 'Open External Links in Browser', desc: 'Protects app sandbox' },
                  { key: 'handleDownloads', label: 'Native Download Manager', desc: 'Handles PDF/ZIP downloads' },
                  { key: 'telLinks', label: 'Telephone (tel:) Links', desc: 'Opens Android phone dialer' },
                  { key: 'mailtoLinks', label: 'Email (mailto:) Links', desc: 'Opens default mail app' },
                  { key: 'deepLinks', label: 'Android App Links / Deep Links', desc: 'Auto-verify domain intents' },
                ].map(toggle => {
                  const isChecked = (permissions as any)[toggle.key];
                  return (
                    <label
                      key={toggle.key}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-indigo-200 bg-indigo-50/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e =>
                          setPermissions({ ...permissions, [toggle.key]: e.target.checked })
                        }
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-slate-900 block leading-tight">
                          {toggle.label}
                        </span>
                        <span className="text-[11px] text-slate-500 leading-tight">
                          {toggle.desc}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: PLATFORM SETTINGS */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Mobile Platform & SDK Settings</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure Android Gradle build properties and Apple iOS Xcode settings.
                </p>
              </div>

              {/* Platform Target Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Mobile Platforms
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetPlatforms(['android']);
                      setPlatformTab('android');
                    }}
                    className={`py-2 px-3 text-left text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      targetPlatforms.length === 1 && targetPlatforms[0] === 'android'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-bold">Android</span>
                    <span className="text-[11px] font-normal text-slate-500">APK & AAB</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetPlatforms(['ios']);
                      setPlatformTab('ios');
                    }}
                    className={`py-2 px-3 text-left text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      targetPlatforms.length === 1 && targetPlatforms[0] === 'ios'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-bold">iOS</span>
                    <span className="text-[11px] font-normal text-slate-500">IPA & Xcode</span>
                  </button>
                </div>
              </div>

              {/* Platform Switcher Tabs */}
              <div className="flex border-b border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPlatformTab('android')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                    platformTab === 'android'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Android Settings (Gradle)
                </button>
                <button
                  type="button"
                  onClick={() => setPlatformTab('ios')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                    platformTab === 'ios'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  iOS Settings (Xcode & Swift)
                </button>
              </div>

              {/* ANDROID TAB */}
              {platformTab === 'android' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Version Name
                      </label>
                      <input
                        type="text"
                        value={versionName}
                        onChange={e => setVersionName(e.target.value)}
                        placeholder="1.0.0"
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Version Code
                      </label>
                      <input
                        type="number"
                        value={versionCode}
                        onChange={e => setVersionCode(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Min SDK Version
                      </label>
                      <select
                        value={minSdkVersion}
                        onChange={e => setMinSdkVersion(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <option value={24}>Android 7.0 (API 24) — 96% of devices</option>
                        <option value={26}>Android 8.0 (API 26) — 92% of devices</option>
                        <option value={29}>Android 10 (API 29) — 84% of devices</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Target SDK
                      </label>
                      <select
                        value={targetSdkVersion}
                        onChange={e => setTargetSdkVersion(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <option value={34}>Android 14 (API 34) — Google Play 2026 Mandate</option>
                        <option value={33}>Android 13 (API 33)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* IOS TAB */}
              {platformTab === 'ios' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        iOS Bundle Identifier
                      </label>
                      <input
                        type="text"
                        value={iosBundleId}
                        onChange={e => setIosBundleId(e.target.value)}
                        placeholder={packageName || 'com.company.app'}
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Matches your App ID registered in Apple Developer Account.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        iOS App Display Name
                      </label>
                      <input
                        type="text"
                        value={iosAppName}
                        onChange={e => setIosAppName(e.target.value)}
                        placeholder={appName || 'My App'}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Visible under app icon on iPhone Home Screen.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Minimum Deployment Target
                      </label>
                      <select
                        value={iosTargetVersion}
                        onChange={e => setIosTargetVersion(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <option value="16.0">iOS 16.0+ (98% of active iPhones)</option>
                        <option value="17.0">iOS 17.0+ (Interactive widgets & StandBy)</option>
                        <option value="18.0">iOS 18.0+ (Latest Apple Silicon standard)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Apple Team ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={iosTeamId}
                        onChange={e => setIosTeamId(e.target.value)}
                        placeholder="e.g. 8X9Q2L3K5P"
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        10-character Team ID from developer.apple.com for automatic code signing.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Shared Screen Orientation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Device Screen Orientation
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'portrait', label: 'Portrait' },
                    { id: 'landscape', label: 'Landscape' },
                    { id: 'auto', label: 'Sensor / Auto' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setOrientation(opt.id as any)}
                      className={`py-2 text-center text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        orientation === opt.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: PREVIEW */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Live Device Simulation</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Toggle between iOS (iPhone 16) and Android (Pixel 8) in the live preview on the right.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">App Name:</span>
                  <span className="font-bold text-slate-900">{appName || 'My Mobile App'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Target URL:</span>
                  <span className="font-mono text-indigo-600 truncate max-w-xs">{websiteUrl}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Android Package ID:</span>
                  <span className="font-mono text-slate-900">{packageName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">iOS Bundle ID:</span>
                  <span className="font-mono text-slate-900">{iosBundleId || packageName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Platforms Enabled:</span>
                  <span className="font-semibold text-indigo-600">
                    {targetPlatforms.map(p => p.toUpperCase()).join(' & ')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Use the device switcher bar above the simulated phone screen to inspect the native iOS WKWebView viewport, Dynamic Island header, and Android 14 adaptive launcher icon.
              </p>
            </div>
          )}

          {/* STEP 7: BUILD */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Compile & Build Mobile App</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your target platform packages to trigger the automated build pipeline.
                </p>
              </div>

              {/* Package Format Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Build Output
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setBuildType('apk')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      buildType === 'apk'
                        ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900">Android Release APK</span>
                      <span className="text-[10px] font-mono text-indigo-600 font-semibold bg-indigo-100 px-1.5 py-0.5 rounded">
                        Fast Install
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Standalone signed APK for immediate installation on physical Android phones and tablets.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBuildType('bundle')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      buildType === 'bundle'
                        ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900">Google Play Bundle (AAB)</span>
                      <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">
                        Google Play
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Google Play Store App Bundle format with App Signing scheme verification.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBuildType('ipa')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      buildType === 'ipa'
                        ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900">iOS Standalone IPA</span>
                      <span className="text-[10px] font-mono text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                        Apple iOS
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Signed IPA release package and full Xcode Swift project for TestFlight and Apple App Store.
                    </p>
                  </button>
                </div>
              </div>

              {/* Final Summary Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">App Name:</span>
                  <span className="font-semibold text-slate-900">{appName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Package / Bundle IDs:</span>
                  <span className="font-mono text-slate-900">{packageName} · {iosBundleId || packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Release Version:</span>
                  <span className="font-mono text-slate-900">
                    v{versionName} (Build {versionCode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source Projects:</span>
                  <span className="text-emerald-700 font-medium">Both Android Studio Kotlin & Xcode Swift projects generated</span>
                </div>
              </div>

              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => onRequireLogin && onRequireLogin('You must log in to create and compile this mobile app.')}
                  className="w-full py-3.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Log In to Create & Compile App</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Native Source & Queueing Build...</span>
                    </>
                  ) : (
                    <>
                      <Hammer className="w-4 h-4" />
                      <span>
                        {buildType === 'ipa'
                          ? 'Build iOS IPA & Xcode Project'
                          : buildType === 'bundle'
                          ? 'Build Google Play AAB Bundle'
                          : 'Build Android APK'}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>
            ) : (
              <div />
            )}

            {currentStep < 7 && (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !websiteUrl) return;
                  if (currentStep === 2 && !validatePackageName(packageName)) return;
                  setCurrentStep(currentStep + 1);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Phone Preview Column */}
        <div className="lg:col-span-5 flex flex-col items-center sticky top-24">
          <PhonePreview
            project={previewProject}
            url={websiteUrl}
            isIframeEmbeddable={analysis ? analysis.iframeEmbeddable : true}
          />
        </div>
      </div>
    </div>
  );
};
