import React from 'react';
import { Check, ArrowRight, ShieldCheck, Zap, Smartphone, Sparkles } from 'lucide-react';
import type { PlanType } from '../types';

interface PricingViewProps {
  currentPlan?: PlanType;
  onSelectPlan: (plan: PlanType) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  currentPlan = 'pro',
  onSelectPlan,
}) => {
  const plans: {
    id: PlanType;
    name: string;
    target: string;
    price: string;
    period: string;
    features: string[];
    isPopular?: boolean;
    cta: string;
  }[] = [
    {
      id: 'free',
      name: 'Free Trial',
      target: 'For testing and proof-of-concept wrappers',
      price: '$0',
      period: 'forever',
      features: [
        '1 Mobile Application',
        '3 Cloud Builds per month',
        'Standard Android APK output',
        'Basic branding & colors',
        'Community documentation',
      ],
      cta: 'Current Plan',
    },
    {
      id: 'starter',
      name: 'Starter',
      target: 'For growing e-commerce stores & niche sites',
      price: '$29',
      period: 'per month',
      features: [
        'Up to 5 Mobile Applications',
        '25 Cloud Builds per month',
        'Signed Release APK & iOS IPA files',
        'Custom splash screen & adaptive icons',
        'Pull-to-refresh & file chooser support',
        'Email customer support',
      ],
      cta: 'Upgrade to Starter',
    },
    {
      id: 'pro',
      name: 'Professional',
      target: 'For active SaaS platforms & scaling brands',
      price: '$79',
      period: 'per month',
      isPopular: true,
      features: [
        'Unlimited Mobile Applications',
        '100 Priority Builds per month',
        'APK, Google Play AAB, iOS IPA & .xcarchive',
        'Full Kotlin (Android) & Swift (Xcode) source code ZIPs',
        'Universal Deep Linking (App Links & Universal Links)',
        'Camera, GPS geolocation & upload permissions',
        'Custom native navigation bars',
        'Priority dual-platform build runner queue',
      ],
      cta: 'Current Active Plan',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      target: 'For large agencies & dedicated publishing pipelines',
      price: '$249',
      period: 'per month',
      features: [
        'Dedicated Android & Apple macOS build worker cluster',
        'White-label distribution & custom package IDs',
        'Automated Play Store & App Store Connect publishing',
        'Custom native Kotlin & Swift plugin bridges',
        '99.9% Build uptime SLA & dedicated manager',
        'Custom signing keystore KMS & Apple certificate vault',
      ],
      cta: 'Contact Enterprise Sales',
    },
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Transparent SaaS Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
          Simple Plans for High-Performance Android & iOS Apps
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          From simple site packaging to automated multi-app enterprise release pipelines.
        </p>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map(plan => {
          const isCurrent = currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 bg-white border transition-all flex flex-col justify-between ${
                plan.isPopular
                  ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-lg'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              <div>
                {/* Popular Pill */}
                {plan.isPopular && (
                  <span className="inline-block text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full mb-3">
                    Most Popular
                  </span>
                )}

                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.target}</p>

                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-400 ml-1.5">{plan.period}</span>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-500 cursor-default'
                      : plan.isPopular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : plan.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 block">
              100% Android Source Code Ownership
            </span>
            <span>
              All generated projects can be exported as complete Android Studio Kotlin projects with no vendor lock-in.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
