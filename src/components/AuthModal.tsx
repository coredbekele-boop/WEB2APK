import React, { useState, useEffect } from 'react';
import { X, Smartphone, ArrowRight, CheckCircle2, Lock, Mail, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import type { User } from '../types';
import {
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
  resetPassword,
} from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  reason?: string;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  reason,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setForgotSent(false);
      setAuthError(null);
      setEmail('');
      setPassword('');
      setName('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const fbUser = await signInWithGoogle();
      const appUser: User = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'App Developer',
        email: fbUser.email || '',
        avatar: fbUser.photoURL || '',
        plan: 'pro',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      onSuccess(appUser);
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Google sign-in popup was closed before completion. Please click the button below to sign in with your Gmail account.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setAuthError('Another sign-in window was opened. Please complete authentication in the active popup.');
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError('The browser blocked the Google sign-in popup window. Please allow popups for this site and try again.');
      } else {
        setAuthError(err.message || 'Google sign-in could not be completed. Please check your connection and try again.');
      }
    } finally {
      setIsGoogleLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    if (mode === 'forgot') {
      try {
        await resetPassword(email);
        setForgotSent(true);
      } catch (err: any) {
        setForgotSent(true);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      if (mode === 'login') {
        const fbUser = await loginWithEmail(email, password);
        onSuccess({
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || name || 'Mobile Developer',
          email: fbUser.email || email,
          avatar: fbUser.photoURL || '',
          plan: 'pro',
          role: 'admin',
          createdAt: new Date().toISOString(),
        });
        onClose();
        return;
      } else if (mode === 'register') {
        const fbUser = await registerWithEmail(email, password);
        onSuccess({
          id: fbUser.uid,
          name: name || fbUser.email?.split('@')[0] || 'Mobile Developer',
          email: fbUser.email || email,
          avatar: fbUser.photoURL || '',
          plan: 'pro',
          role: 'admin',
          createdAt: new Date().toISOString(),
        });
        onClose();
        return;
      }
    } catch (firebaseErr: any) {
      setAuthError(firebaseErr.message || 'Authentication failed. Please verify your credentials or use Google Sign-In.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-2xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm block leading-none">
                Web2<span className="text-indigo-600">APK</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Real Google & Firebase Auth</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {reason && (
            <div className="mb-4 p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl flex items-start gap-2.5 text-indigo-900 text-xs">
              <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-indigo-950">Authentication Required</span>
                <span>{reason}</span>
              </div>
            </div>
          )}

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Authentication Notice</span>
                <span>{authError}</span>
              </div>
            </div>
          )}

          {/* Primary Action: Real Google / Gmail Login */}
          {mode !== 'forgot' && (
            <div className="mb-6 space-y-3">
              <div className="text-center mb-3">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Sign in with your Google Account
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Use your real Gmail or Google Workspace address to access your converted apps, automated builds, and cloud keys.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || isGoogleLoading}
                className="w-full py-3 px-4 bg-white border-2 border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-800 text-sm font-semibold rounded-xl shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer group active:scale-[0.99] disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span className="group-hover:text-indigo-600 transition-colors">
                      Continue with Google / Gmail
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 justify-center text-[11px] text-slate-500 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant sign in &middot; Real Firebase token &middot; Secure Firestore sync</span>
              </div>

              <div className="relative flex items-center justify-center pt-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] text-slate-400 uppercase font-medium tracking-wider absolute">
                  or with email & password
                </span>
              </div>
            </div>
          )}

          {mode !== 'forgot' && (
            <div className="flex border-b border-slate-200 mb-4">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                  mode === 'login'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-1.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                  mode === 'register'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {mode === 'forgot' ? (
            forgotSent ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Check Your Inbox</h3>
                <p className="text-xs text-slate-500">
                  We've sent password reset instructions to <strong>{email}</strong>.
                </p>
                <button
                  onClick={() => {
                    setMode('login');
                    setForgotSent(false);
                  }}
                  className="mt-4 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reset Your Password</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter the email address registered with your Web2APK account.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="your.email@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm cursor-pointer"
                >
                  Send Reset Link
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Authenticating...</span>
                  </span>
                ) : mode === 'register' ? (
                  'Create Account & Continue'
                ) : (
                  'Sign In with Email'
                )}
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                {mode === 'login' ? (
                  <p className="text-xs text-slate-600">
                    Don't have an email login?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="font-semibold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Sign Up Free
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-600">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-semibold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
