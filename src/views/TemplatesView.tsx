import React from 'react';
import { ShoppingBag, Newspaper, Cpu, Calendar, ArrowRight, Check } from 'lucide-react';

interface TemplatesViewProps {
  onUseTemplate: (template: any) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onUseTemplate }) => {
  const templates = [
    {
      id: 'ecommerce',
      name: 'E-Commerce Storefront',
      desc: 'Optimized for Shopify, WooCommerce, and modern storefronts with checkout and photo uploads.',
      icon: ShoppingBag,
      primaryColor: '#4F46E5',
      secondaryColor: '#06B6D4',
      navigationType: 'bottom',
      url: 'https://nordicliving.store',
      features: ['Pull-to-refresh', 'Camera upload', 'External link handling', 'Bottom 4-tab bar'],
    },
    {
      id: 'media',
      name: 'News & Media Publication',
      desc: 'High-density reader layout with top category tabs, offline caching, and social sharing links.',
      icon: Newspaper,
      primaryColor: '#0284C7',
      secondaryColor: '#38BDF8',
      navigationType: 'top',
      url: 'https://techpulse.dev',
      features: ['Fast DOM storage', 'Clean fullscreen', 'Deep-link autoVerify', 'Swipe gestures'],
    },
    {
      id: 'saas',
      name: 'B2B SaaS Dashboard',
      desc: 'Dark/light responsive dashboard wrapper with full cookie authentication and persistent sessions.',
      icon: Cpu,
      primaryColor: '#7C3AED',
      secondaryColor: '#A78BFA',
      navigationType: 'hamburger',
      url: 'https://cloudcraft.io',
      features: ['Persistent sessions', 'Document downloads', 'Sensor orientation', 'File attachments'],
    },
    {
      id: 'booking',
      name: 'Local Services & Booking',
      desc: 'Ideal for clinics, salons, and restaurants needing tel: dialer links and GPS directions.',
      icon: Calendar,
      primaryColor: '#059669',
      secondaryColor: '#34D399',
      navigationType: 'bottom',
      url: 'https://yesufapp.com',
      features: ['GPS location access', 'Dialer (tel:) links', 'Calendar mailto', 'Camera capture'],
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">App Blueprints & Templates</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Start with battle-tested mobile wrapper configurations tailored to your industry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map(tmpl => {
          const Icon = tmpl.icon;

          return (
            <div
              key={tmpl.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: tmpl.primaryColor }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{tmpl.name}</h3>
                    <span className="text-[11px] font-mono text-slate-400 capitalize">
                      {tmpl.navigationType} Navigation
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">{tmpl.desc}</p>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  {tmpl.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onUseTemplate(tmpl)}
                  className="w-full py-2.5 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl border border-slate-200 hover:border-indigo-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Use This Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
