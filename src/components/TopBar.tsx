import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  Cpu,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings,
  HelpCircle,
  CreditCard,
  X,
  ExternalLink,
  Smartphone,
  Home,
} from 'lucide-react';
import type { User, NotificationItem } from '../types';

interface TopBarProps {
  breadcrumbs: { label: string; route?: string }[];
  onNavigate: (route: string) => void;
  user: User;
  onOpenMobileSidebar: () => void;
  notifications: NotificationItem[];
  onMarkNotificationsRead: () => void;
  onOpenWorkerStatusModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSignOut?: () => void;
  isAuthenticated?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  breadcrumbs,
  onNavigate,
  user,
  onOpenMobileSidebar,
  notifications,
  onMarkNotificationsRead,
  onOpenWorkerStatusModal,
  searchQuery,
  onSearchChange,
  onSignOut,
  isAuthenticated = true,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile hamburger, Web2APK Home link & breadcrumbs */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg focus:outline-none cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Web2APK Home Brand Button */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-1.5 px-2 py-1 text-slate-700 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
          title="Web2APK — Go to Home Page"
        >
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white group-hover:bg-indigo-700 transition-colors shadow-2xs">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors hidden sm:inline">
            Web2<span className="text-indigo-600">APK</span>
          </span>
        </button>
        <span className="text-slate-300 hidden sm:inline">/</span>

        {/* Breadcrumb Trail */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300">/</span>}
                {crumb.route && !isLast ? (
                  <button
                    onClick={() => onNavigate(crumb.route!)}
                    className="hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={isLast ? 'font-semibold text-slate-900' : ''}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex items-center max-w-xs w-full mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search apps, builds, URLs..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Worker status pill, notifications & user profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Build Engine Status Pill */}
        <button
          onClick={onOpenWorkerStatusModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          title="Inspect Build Runner Architecture"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden xl:inline">Build Engine:</span>
          <span className="font-mono text-emerald-700">Online</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifs(!showNotifs);
              if (!showNotifs && unreadCount > 0) {
                onMarkNotificationsRead();
              }
            }}
            className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 text-slate-900 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Notifications
                </span>
                <span className="text-xs text-indigo-600 font-medium">Real-time alerts</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No notifications yet.</p>
                ) : (
                  notifications.map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.link) onNavigate(item.link.replace('/', ''));
                        setShowNotifs(false);
                      }}
                      className={`p-3 text-left hover:bg-slate-50 transition-colors rounded-lg cursor-pointer ${
                        !item.read ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900 leading-tight">
                          {item.title}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-2 text-left rounded-lg hover:bg-slate-50 transition-colors focus:outline-none"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-1 ring-indigo-200">
                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <span className="text-xs font-semibold text-slate-900 block leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium capitalize">
                {user.plan} Plan
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1 text-slate-800 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    onNavigate('billing');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                >
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  Subscription & Invoices
                </button>
                <button
                  onClick={() => {
                    onNavigate('docs');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  Developer Docs
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onSignOut) {
                      onSignOut();
                    } else {
                      onNavigate('landing');
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
