/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { User, Project, Build, NotificationItem, AdminMetrics, PlanType } from './types';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ToastContainer, type ToastMessage } from './components/Toast';
import { WorkerStatusModal } from './components/WorkerStatusModal';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';

import { LandingPage } from './views/LandingPage';
import { DashboardView } from './views/DashboardView';
import { MyAppsView } from './views/MyAppsView';
import { CreateAppWizard } from './views/CreateAppWizard';
import { AppDetailsView } from './views/AppDetailsView';
import { BuildDetailsView } from './views/BuildDetailsView';
import { BuildsListView } from './views/BuildsListView';
import { PricingView } from './views/PricingView';
import { DocsView } from './views/DocsView';
import { SettingsView } from './views/SettingsView';
import { AdminView } from './views/AdminView';
import { TemplatesView } from './views/TemplatesView';
import { auth, onAuthStateChanged, logOutFirebase, testFirestoreConnection } from './firebase';

export default function App() {
  // Navigation & View state - Default to Home page (Web2APK Landing)
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const [wizardInitialUrl, setWizardInitialUrl] = useState<string>('');

  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [pendingWizardUrl, setPendingWizardUrl] = useState<string>('');
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register';
    reason?: string;
  }>({
    isOpen: false,
    mode: 'login',
    reason: undefined,
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // User state - load from localStorage if real authenticated user, otherwise unauthenticated guest
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('web2apk_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email && !parsed.email.includes('example.com')) {
          return parsed;
        }
      }
    } catch {}
    return {
      id: 'usr_guest',
      name: 'Guest Developer',
      email: '',
      avatar: '',
      plan: 'pro',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('web2apk_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed && parsed.email && !parsed.email.includes('example.com'));
      }
      return false;
    } catch {
      return false;
    }
  });

  // Data collections
  const [projects, setProjects] = useState<Project[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);

  const showToast = (title: string, message?: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      // 1. Projects
      const projRes = await fetch('/api/projects');
      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data.projects || []);
      }

      // 2. Builds
      const buildsRes = await fetch('/api/builds');
      if (buildsRes.ok) {
        const data = await buildsRes.json();
        setBuilds(data.builds || []);
      }

      // 3. Notifications
      const notifsRes = await fetch('/api/notifications');
      if (notifsRes.ok) {
        const data = await notifsRes.json();
        setNotifications(data.notifications || []);
      }

      // 4. System status
      const statusRes = await fetch('/api/system/worker-status');
      if (statusRes.ok) {
        const data = await statusRes.json();
        setMetrics(data.metrics || null);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    testFirestoreConnection();
    fetchData();
    const interval = setInterval(fetchData, 4000);

    const unsubscribe = onAuthStateChanged(auth, fbUser => {
      if (fbUser) {
        const authedUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'App Developer',
          email: fbUser.email || '',
          avatar: fbUser.photoURL || '',
          plan: 'pro',
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        setUser(authedUser);
        setIsAuthenticated(true);
        try {
          localStorage.setItem('web2apk_user', JSON.stringify(authedUser));
        } catch {}
      } else {
        const saved = localStorage.getItem('web2apk_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (!parsed.email || parsed.email.includes('example.com')) {
              localStorage.removeItem('web2apk_user');
              setIsAuthenticated(false);
            }
          } catch {}
        }
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // Handlers
  const handleNavigate = (route: string) => {
    if (route === 'create-app' && !isAuthenticated) {
      setPendingDestination('create-app');
      setAuthModalState({
        isOpen: true,
        mode: 'login',
        reason: 'You must log in to create and build mobile applications.',
      });
      showToast('Login Required', 'Please sign in or register to create an app.', 'info');
      return;
    }

    if (route.startsWith('builds/')) {
      const bId = route.split('/')[1];
      setSelectedBuildId(bId);
      setCurrentRoute('build-details');
      return;
    }
    if (route.startsWith('apps/')) {
      const pId = route.split('/')[1];
      setSelectedProjectId(pId);
      setCurrentRoute('app-details');
      return;
    }
    setCurrentRoute(route);
  };

  const handleStartWizard = (url?: string) => {
    const targetUrl = url || '';
    if (!isAuthenticated) {
      setPendingWizardUrl(targetUrl);
      setPendingDestination('create-app');
      setAuthModalState({
        isOpen: true,
        mode: 'login',
        reason: 'You must log in to create your mobile app. Your project configuration and APK / iOS builds will be saved to your account.',
      });
      showToast('Login Required', 'You must log in to create an app.', 'info');
      return;
    }
    setWizardInitialUrl(targetUrl);
    setCurrentRoute('create-app');
  };

  const handleSignOut = async () => {
    try {
      await logOutFirebase();
    } catch {}
    setIsAuthenticated(false);
    setUser({
      id: 'usr_guest',
      name: 'Guest Developer',
      email: '',
      avatar: '',
      plan: 'starter',
      role: 'user',
      createdAt: new Date().toISOString(),
    });
    try {
      localStorage.removeItem('web2apk_user');
    } catch {}
    showToast('Signed Out', 'You have been signed out successfully.', 'info');
    setCurrentRoute('landing');
  };

  const handleOpenProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentRoute('app-details');
  };

  const handleTriggerBuild = async (
    projectId: string,
    buildType: 'apk' | 'aab' | 'bundle' | 'ipa' | 'xcarchive' | 'ios_source' = 'apk',
    platform?: 'android' | 'ios'
  ) => {
    const targetPlatform = platform || (['ipa', 'xcarchive', 'ios_source'].includes(buildType) ? 'ios' : 'android');
    try {
      const res = await fetch(`/api/projects/${projectId}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildType, platform: targetPlatform }),
      });
      if (!res.ok) throw new Error('Build trigger failed');
      const data = await res.json();
      showToast(
        `${targetPlatform === 'ios' ? 'iOS' : 'Android'} Build Queued`,
        `Job ${data.build.id} assigned to ${targetPlatform === 'ios' ? 'Apple Silicon' : 'Android'} runner.`,
        'info'
      );
      fetchData();
      if (data.build?.id) {
        setSelectedBuildId(data.build.id);
        setCurrentRoute('build-details');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this application? All generated packages will be removed.')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
      showToast('Project Deleted', 'Application removed from workspace.', 'info');
      fetchData();
      setCurrentRoute('apps');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleDownloadZip = (projectId: string, platform: 'android' | 'ios' = 'android') => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;
    const endpoint = platform === 'ios' ? 'download-ios-zip' : 'download-zip';
    window.location.href = `/api/builds/${proj.lastBuildId || 'build_nordic_103'}/${endpoint}`;
    showToast(
      'Preparing ZIP',
      platform === 'ios'
        ? 'Xcode Swift project archive packaging...'
        : 'Android Studio source code archive packaging...',
      'info'
    );
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  // Breadcrumbs calculation
  const getBreadcrumbs = () => {
    switch (currentRoute) {
      case 'dashboard':
        return [{ label: 'Web2APK', route: 'landing' }, { label: 'Dashboard' }];
      case 'apps':
        return [{ label: 'Web2APK', route: 'landing' }, { label: 'My Applications' }];
      case 'create-app':
        return [{ label: 'Web2APK', route: 'landing' }, { label: 'Create App Wizard' }];
      case 'app-details': {
        const proj = projects.find(p => p.id === selectedProjectId);
        return [
          { label: 'Web2APK', route: 'landing' },
          { label: 'My Apps', route: 'apps' },
          { label: proj ? proj.name : 'App Details' },
        ];
      }
      case 'builds':
        return [{ label: 'Web2APK', route: 'landing' }, { label: 'Builds & Artifacts' }];
      case 'build-details':
        return [
          { label: 'Web2APK', route: 'landing' },
          { label: 'Builds', route: 'builds' },
          { label: selectedBuildId || 'Build Details' },
        ];
      case 'templates':
        return [{ label: 'Web2APK', route: 'landing' }, { label: 'Blueprints' }];
      case 'settings':
        return [{ label: 'Web2APK', route: 'landing' }, { label: 'Settings' }];
      case 'billing':
        return [{ label: 'Web2APK', route: 'landing' }, { label: 'Billing & Plans' }];
      case 'admin':
        return [{ label: 'Web2APK', route: 'landing' }, { label: 'Admin Console' }];
      case 'docs':
        return [{ label: 'Web2APK', route: 'landing' }, { label: 'Technical Docs' }];
      default:
        return [{ label: 'Web2APK', route: 'landing' }];
    }
  };

  const isMarketingRoute = currentRoute === 'landing' || (currentRoute === 'pricing' && !isAuthenticated);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#111827]">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Global Modals */}
      <WorkerStatusModal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        metrics={metrics}
      />

      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        reason={authModalState.reason}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onSuccess={authedUser => {
          setUser(authedUser);
          setIsAuthenticated(true);
          try {
            localStorage.setItem('web2apk_user', JSON.stringify(authedUser));
          } catch {}
          showToast('Welcome', `Signed in as ${authedUser.name}`, 'success');
          if (pendingDestination === 'create-app' || pendingWizardUrl) {
            if (pendingWizardUrl) {
              setWizardInitialUrl(pendingWizardUrl);
              setPendingWizardUrl('');
            }
            setPendingDestination(null);
            setCurrentRoute('create-app');
          } else {
            setCurrentRoute('dashboard');
          }
        }}
      />

      {/* ROUTE RENDERING: MARKETING OR WORKSPACE */}
      {isMarketingRoute ? (
        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            isAuthenticated={isAuthenticated}
            onOpenAuth={mode => setAuthModalState({ isOpen: true, mode, reason: undefined })}
            onSignOut={handleSignOut}
            onStartWizard={handleStartWizard}
          />
          <main className="flex-1">
            <LandingPage
              onStartWizard={handleStartWizard}
              onOpenAuth={mode => setAuthModalState({ isOpen: true, mode, reason: undefined })}
              onNavigate={handleNavigate}
              isAuthenticated={isAuthenticated}
              onSignOut={handleSignOut}
            />
          </main>
        </div>
      ) : (
        /* SAAS DASHBOARD WORKSPACE */
        <div className="flex-1 flex min-h-screen">
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            user={user}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            appsCount={projects.length}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <TopBar
              breadcrumbs={getBreadcrumbs()}
              onNavigate={handleNavigate}
              user={user}
              onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
              notifications={notifications}
              onMarkNotificationsRead={handleMarkNotificationsRead}
              onOpenWorkerStatusModal={() => setIsWorkerModalOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSignOut={handleSignOut}
              isAuthenticated={isAuthenticated}
            />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              {currentRoute === 'dashboard' && (
                <DashboardView
                  user={user}
                  projects={projects}
                  builds={builds}
                  onNavigate={handleNavigate}
                  onOpenProject={handleOpenProject}
                  onTriggerBuild={handleTriggerBuild}
                  onDeleteProject={handleDeleteProject}
                  onStartWizard={handleStartWizard}
                />
              )}

              {currentRoute === 'apps' && (
                <MyAppsView
                  projects={projects}
                  onNavigate={handleNavigate}
                  onOpenProject={handleOpenProject}
                  onTriggerBuild={handleTriggerBuild}
                  onDeleteProject={handleDeleteProject}
                  onDownloadZip={handleDownloadZip}
                />
              )}

              {currentRoute === 'create-app' && (
                <CreateAppWizard
                  initialUrl={wizardInitialUrl}
                  isAuthenticated={isAuthenticated}
                  onRequireLogin={reason => {
                    setPendingDestination('create-app');
                    setAuthModalState({
                      isOpen: true,
                      mode: 'login',
                      reason: reason || 'You must log in to create and build mobile applications.',
                    });
                  }}
                  onCancel={() => setCurrentRoute('dashboard')}
                  onProjectCreated={(newProj, bId) => {
                    setProjects(prev => [newProj, ...prev]);
                    showToast('App Created', `${newProj.name} created and build initialized.`, 'success');
                    if (bId) {
                      setSelectedBuildId(bId);
                      setCurrentRoute('build-details');
                    } else {
                      setSelectedProjectId(newProj.id);
                      setCurrentRoute('app-details');
                    }
                  }}
                />
              )}

              {currentRoute === 'app-details' && (
                selectedProjectId ? (
                  (() => {
                    const targetProj = projects.find(p => p.id === selectedProjectId);
                    if (!targetProj) {
                      return (
                        <div className="text-center py-12">
                          <p className="text-xs text-slate-500">Project not found.</p>
                          <button onClick={() => setCurrentRoute('apps')} className="mt-2 text-xs font-bold text-indigo-600">
                            Back to Apps
                          </button>
                        </div>
                      );
                    }
                    return (
                      <AppDetailsView
                        project={targetProj}
                        builds={builds}
                        onBack={() => setCurrentRoute('apps')}
                        onUpdateProject={updated => {
                          setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
                          showToast('Updated', 'Application configuration saved.', 'success');
                        }}
                        onTriggerBuild={handleTriggerBuild}
                        onDeleteProject={handleDeleteProject}
                        onDownloadZip={handleDownloadZip}
                        onNavigateToBuild={bId => {
                          setSelectedBuildId(bId);
                          setCurrentRoute('build-details');
                        }}
                      />
                    );
                  })()
                ) : (
                  <div className="text-center py-12">
                    <button onClick={() => setCurrentRoute('apps')} className="text-xs font-bold text-indigo-600">
                      Go to Apps
                    </button>
                  </div>
                )
              )}

              {currentRoute === 'builds' && (
                <BuildsListView
                  builds={builds}
                  onOpenBuild={bId => {
                    setSelectedBuildId(bId);
                    setCurrentRoute('build-details');
                  }}
                  onRetryBuild={handleTriggerBuild}
                />
              )}

              {currentRoute === 'build-details' && (
                <BuildDetailsView
                  buildId={selectedBuildId || (builds[0] ? builds[0].id : 'build_nordic_103')}
                  onBack={() => setCurrentRoute('builds')}
                  onRetryBuild={bId => handleTriggerBuild(bId)}
                />
              )}

              {currentRoute === 'templates' && (
                <TemplatesView
                  onUseTemplate={tmpl => {
                    handleStartWizard(tmpl.url);
                  }}
                />
              )}

              {currentRoute === 'billing' && (
                <PricingView
                  currentPlan={user.plan}
                  onSelectPlan={newPlan => {
                    setUser({ ...user, plan: newPlan });
                    showToast('Plan Updated', `Successfully updated subscription to ${newPlan}.`, 'success');
                  }}
                />
              )}

              {currentRoute === 'pricing' && (
                <PricingView
                  currentPlan={user.plan}
                  onSelectPlan={newPlan => {
                    setUser({ ...user, plan: newPlan });
                    showToast('Plan Updated', `Successfully updated subscription to ${newPlan}.`, 'success');
                  }}
                />
              )}

              {currentRoute === 'docs' && <DocsView />}

              {currentRoute === 'settings' && (
                <SettingsView
                  user={user}
                  onUpdateUser={updated => setUser({ ...user, ...updated })}
                  onShowToast={showToast}
                />
              )}

              {currentRoute === 'admin' && (
                <AdminView
                  currentUser={user}
                  onNavigateToBuild={bId => {
                    setSelectedBuildId(bId);
                    setCurrentRoute('build-details');
                  }}
                  onNavigateToProject={handleOpenProject}
                />
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
