import React, { useState } from 'react';
import {
  Smartphone,
  Globe,
  Palette,
  Hammer,
  Eye,
  Settings,
  ArrowLeft,
  ExternalLink,
  Download,
  Play,
  Save,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  GitBranch,
  Zap,
} from 'lucide-react';
import type { Project, Build } from '../types';
import { PhonePreview } from '../components/PhonePreview';
import { RepositorySettings } from '../components/RepositorySettings';

interface AppDetailsViewProps {
  project: Project;
  builds: Build[];
  onBack: () => void;
  onUpdateProject: (updated: Project) => void;
  onTriggerBuild: (projectId: string, buildType?: 'apk' | 'aab' | 'bundle' | 'ipa' | 'xcarchive' | 'ios_source', platform?: 'android' | 'ios') => void;
  onDeleteProject: (projectId: string) => void;
  onDownloadZip: (projectId: string, platform?: 'android' | 'ios') => void;
  onNavigateToBuild: (buildId: string) => void;
}

export const AppDetailsView: React.FC<AppDetailsViewProps> = ({
  project,
  builds,
  onBack,
  onUpdateProject,
  onTriggerBuild,
  onDeleteProject,
  onDownloadZip,
  onNavigateToBuild,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'branding' | 'repository' | 'builds' | 'preview' | 'settings'>('overview');
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [name, setName] = useState(project.name);
  const [websiteUrl, setWebsiteUrl] = useState(project.websiteUrl);
  const [description, setDescription] = useState(project.description);
  const [primaryColor, setPrimaryColor] = useState(project.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(project.secondaryColor);
  const [splashBgColor, setSplashBgColor] = useState(project.splashBgColor);
  const [iconUrl, setIconUrl] = useState(project.iconUrl);
  const [orientation, setOrientation] = useState(project.orientation);
  const [versionName, setVersionName] = useState(project.versionName);
  const [versionCode, setVersionCode] = useState(project.versionCode);

  // iOS Specific Editable Fields
  const [iosBundleId, setIosBundleId] = useState(project.iosBundleId || project.packageName);
  const [iosTargetVersion, setIosTargetVersion] = useState(project.iosTargetVersion || '16.0');
  const [iosTeamId, setIosTeamId] = useState(project.iosTeamId || '');
  const [iosAppName, setIosAppName] = useState(project.iosAppName || project.name);

  const projectBuilds = builds.filter(b => b.projectId === project.id);

  const handleSave = async () => {
    setIsSaving(true);
    const updated: Project = {
      ...project,
      name,
      websiteUrl,
      description,
      primaryColor,
      secondaryColor,
      splashBgColor,
      iconUrl,
      orientation,
      versionName,
      versionCode,
      iosBundleId,
      iosTargetVersion,
      iosTeamId,
      iosAppName,
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Failed to update project');
      onUpdateProject(updated);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const previewData: Partial<Project> = {
    ...project,
    name,
    websiteUrl,
    primaryColor,
    secondaryColor,
    splashBgColor,
    iconUrl,
    orientation,
    iosBundleId,
    iosAppName,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Back to Apps"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img
            src={project.iconUrl}
            alt={project.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
            onError={e => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{project.name}</h1>
              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                v{project.versionName}
              </span>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                Android & iOS Ready
              </span>
            </div>
            <p className="font-mono text-xs text-slate-500">{project.packageName} · {project.iosBundleId || project.packageName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Source Code Dropdown / Buttons */}
          <button
            onClick={() => onDownloadZip(project.id, 'android')}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Download Android Studio Project ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Android Code (.zip)</span>
          </button>

          <button
            onClick={() => onDownloadZip(project.id, 'ios')}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Download Xcode Project ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xcode Code (.zip)</span>
          </button>

          {/* Trigger Builds */}
          <button
            onClick={() => onTriggerBuild(project.id, 'apk', 'android')}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Build Android APK"
          >
            <Play className="w-3.5 h-3.5 fill-current text-slate-700" />
            <span>Build Android APK</span>
          </button>

          <button
            onClick={() => onTriggerBuild(project.id, 'ipa', 'ios')}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Build iOS IPA"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Build iOS IPA</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-medium">
        {[
          { id: 'overview', label: 'Overview', icon: Globe },
          { id: 'config', label: 'Configuration', icon: Settings },
          { id: 'branding', label: 'Branding', icon: Palette },
          {
            id: 'repository',
            label: 'GitHub CI/CD',
            icon: GitBranch,
            badge: project.github?.enabled && project.github?.autoBuild ? 'Active' : undefined,
          },
          { id: 'builds', label: `Builds (${projectBuilds.length})`, icon: Hammer },
          { id: 'preview', label: 'Phone Preview', icon: Eye },
          { id: 'settings', label: 'Danger Zone', icon: Trash2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in">
          <div className="lg:col-span-7 space-y-6">
            {/* Overview Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Application Profile</h2>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Target Website:</span>
                  <a
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span className="truncate">{project.websiteUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <span className="text-slate-500 block">Android Package ID:</span>
                  <span className="font-mono text-slate-900 mt-0.5 block">{project.packageName}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">iOS Bundle ID:</span>
                  <span className="font-mono text-slate-900 mt-0.5 block">{project.iosBundleId || project.packageName}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Current Version:</span>
                  <span className="font-mono text-slate-900 mt-0.5 block">
                    {project.versionName} (Build Code: {project.versionCode})
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">iOS Min Target:</span>
                  <span className="text-slate-900 mt-0.5 block">iOS {project.iosTargetVersion || '16.0'}+ (SwiftUI & WKWebView)</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Display Mode:</span>
                  <span className="text-slate-900 mt-0.5 block">Full Screen Edge-to-Edge</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-slate-500 text-xs block mb-1">Description:</span>
                <p className="text-xs text-slate-700 leading-relaxed">{project.description || 'No description provided.'}</p>
              </div>
            </div>

            {/* Quick Build Action Card */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Multi-Platform Cloud Pipeline</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compile signed packages for Google Play (APK/AAB) and Apple App Store (IPA/Xcode).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTriggerBuild(project.id, 'apk', 'android')}
                  className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  Build Android
                </button>
                <button
                  onClick={() => onTriggerBuild(project.id, 'ipa', 'ios')}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  Build iOS IPA
                </button>
              </div>
            </div>

            {/* GitHub CI/CD Integration Overview Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <GitBranch className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">GitHub Continuous Integration</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        project.github?.enabled && project.github?.autoBuild
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : project.github?.enabled
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {project.github?.enabled && project.github?.autoBuild
                        ? '● Auto-Build Active'
                        : project.github?.enabled
                        ? 'Auto-Build Paused'
                        : 'Not Connected'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-lg">
                    {project.github?.enabled && project.github?.repository
                      ? `Connected to ${project.github.repository} (${project.github.branch || 'main'}). New commits trigger mobile cloud builds.`
                      : 'Connect your GitHub repository to automatically trigger new builds whenever code changes are pushed.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('repository')}
                className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                {project.github?.enabled ? 'Manage Webhook & Settings &rarr;' : 'Configure GitHub CI &rarr;'}
              </button>
            </div>
          </div>

          {/* Right Preview Column */}
          <div className="lg:col-span-5 flex justify-center">
            <PhonePreview project={previewData} url={project.websiteUrl} />
          </div>
        </div>
      )}

      {/* 2. CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-3xl space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-slate-900">App Settings & Metadata</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update application identifiers, Android Gradle, and Apple iOS configurations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">App Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Website URL</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Version Name</label>
              <input
                type="text"
                value={versionName}
                onChange={e => setVersionName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Version Code</label>
              <input
                type="number"
                value={versionCode}
                onChange={e => setVersionCode(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* iOS Specific Configuration Section */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <span>Apple iOS (Swift & Xcode) Configuration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">iOS Bundle Identifier</label>
                <input
                  type="text"
                  value={iosBundleId}
                  onChange={e => setIosBundleId(e.target.value)}
                  placeholder="com.company.app"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">iOS Display Name</label>
                <input
                  type="text"
                  value={iosAppName}
                  onChange={e => setIosAppName(e.target.value)}
                  placeholder="App Name on iPhone"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deployment Target</label>
                <select
                  value={iosTargetVersion}
                  onChange={e => setIosTargetVersion(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="16.0">iOS 16.0+ (Universal)</option>
                  <option value="17.0">iOS 17.0+ (Interactive Widgets)</option>
                  <option value="18.0">iOS 18.0+ (Latest Apple SDK)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Apple Team ID (Optional)</label>
                <input
                  type="text"
                  value={iosTeamId}
                  onChange={e => setIosTeamId(e.target.value)}
                  placeholder="e.g. 8X9Q2L3K5P"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">App Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. BRANDING */}
      {activeTab === 'branding' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-3xl space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-slate-900">Branding & Colors</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize status bar theme, launch splash background, and application icons.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary / Status Bar</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={e => setSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Splash Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={splashBgColor}
                  onChange={e => setSplashBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Icon Asset URL</label>
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={iconUrl}
                onChange={e => setIconUrl(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
              {iconUrl && (
                <img
                  src={iconUrl}
                  alt="Icon"
                  className="w-10 h-10 rounded-xl object-contain border border-slate-200 bg-white"
                />
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Branding'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. GITHUB CI/CD & REPOSITORY SETTINGS */}
      {activeTab === 'repository' && (
        <div className="animate-in fade-in">
          <RepositorySettings
            project={project}
            onUpdateProject={onUpdateProject}
            onTriggerBuild={onTriggerBuild}
            onNavigateToBuild={onNavigateToBuild}
          />
        </div>
      )}

      {/* 5. BUILDS */}
      {activeTab === 'builds' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Build History for {project.name}</h2>
              <p className="text-xs text-slate-500">View execution logs, download APK / IPA packages, or trigger new builds.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onTriggerBuild(project.id, 'apk', 'android')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current text-slate-600" />
                Build Android
              </button>
              <button
                onClick={() => onTriggerBuild(project.id, 'ipa', 'ios')}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                Build iOS IPA
              </button>
            </div>
          </div>

          {projectBuilds.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No builds recorded for this app yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {projectBuilds.map(b => (
                <div
                  key={b.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 rounded-lg px-2 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        b.platform === 'ios'
                          ? 'bg-slate-900 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {b.platform === 'ios' ? 'iOS' : 'Android'}
                      </span>
                      <span className="font-bold text-xs text-slate-900 font-mono">{b.id}</span>
                      <span className="font-mono text-[10px] text-slate-500">v{b.versionName}</span>
                      <span className="text-[10px] uppercase font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">
                        {b.buildType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{b.currentStage}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-xs text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {b.status}
                    </span>

                    {b.status === 'COMPLETED' && (
                      <a
                        href={b.platform === 'ios' ? `/api/builds/${b.id}/download-ipa` : `/api/builds/${b.id}/download-apk`}
                        download
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>{b.platform === 'ios' ? 'IPA' : 'APK'}</span>
                      </a>
                    )}

                    <button
                      onClick={() => onNavigateToBuild(b.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      View Logs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. PREVIEW */}
      {activeTab === 'preview' && (
        <div className="flex justify-center p-6 animate-in fade-in">
          <PhonePreview project={previewData} url={project.websiteUrl} />
        </div>
      )}

      {/* 6. SETTINGS / DANGER ZONE */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-xs max-w-2xl space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-red-900">Danger Zone</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently delete this project and all associated build artifacts from storage.
            </p>
          </div>

          <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-red-900 block">Delete {project.name}</span>
              <span className="text-[11px] text-red-700">
                This action is irreversible. All generated APKs will be purged.
              </span>
            </div>
            <button
              onClick={() => onDeleteProject(project.id)}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-2xs"
            >
              Delete Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
