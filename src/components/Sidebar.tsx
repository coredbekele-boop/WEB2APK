import React from 'react';
import {
  LayoutDashboard,
  Smartphone,
  PlusCircle,
  Hammer,
  Layers,
  Settings,
  CreditCard,
  BookOpen,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Globe,
  Home,
} from 'lucide-react';
import type { User } from '../types';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  user: User;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  appsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  user,
  isMobileOpen,
  onCloseMobile,
  appsCount,
}) => {
  const navItems = [
    { id: 'landing', label: 'Home Page', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'apps', label: 'My Apps', icon: Smartphone, badge: appsCount > 0 ? `${appsCount}` : undefined },
    { id: 'create-app', label: 'Create App', icon: PlusCircle, highlight: true },
    { id: 'builds', label: 'Builds & Releases', icon: Hammer },
    { id: 'templates', label: 'Templates', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'docs', label: 'Documentation', icon: BookOpen },
    ...(user.role === 'admin' ? [{ id: 'admin', label: 'Admin Console', icon: ShieldCheck }] : []),
  ];

  const content = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-slate-200 w-64">
      <div>
        {/* Workspace Brand Lockup */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
            title="Web2APK — Go to Home Page"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block leading-none group-hover:text-indigo-600 transition-colors">
                Web2<span className="text-indigo-600">APK</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-tight">Home Page &rarr;</span>
            </div>
          </button>
        </div>

        {/* Navigation list */}
        <div className="px-3 py-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : item.highlight
                    ? 'text-indigo-600 hover:bg-indigo-50/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs font-mono tabular-nums text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plan quota & quick links */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="bg-white rounded-lg p-3 border border-slate-200 mb-3 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
            <span>Monthly Build Quota</span>
            <span className="font-mono tabular-nums text-indigo-600 font-semibold">12 / 50</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '24%' }} />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Pro Tier Active</span>
            <button
              onClick={() => onNavigate('billing')}
              className="text-indigo-600 hover:underline font-medium"
            >
              Upgrade
            </button>
          </p>
        </div>

        {/* Public home switcher */}
        <button
          onClick={() => onNavigate('landing')}
          className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 py-1.5 px-2 rounded hover:bg-slate-100 transition-colors"
        >
          <span>View Marketing Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-30">
        {content}
      </aside>

      {/* Mobile drawer backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex"
          onClick={onCloseMobile}
        >
          <div
            className="relative w-64 max-w-[85vw] h-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
};
