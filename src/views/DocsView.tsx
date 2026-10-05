import React, { useState } from 'react';
import {
  BookOpen,
  Terminal,
  Server,
  Key,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Smartphone,
  ExternalLink,
  Code2,
} from 'lucide-react';

export const DocsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Platform Overview', icon: BookOpen },
    { id: 'analyzer', title: 'Website Analyzer Specs', icon: Code2 },
    { id: 'android-arch', title: 'Android Native Architecture', icon: Smartphone },
    { id: 'ios-arch', title: 'iOS Native Architecture (Swift)', icon: Layers },
    { id: 'build-worker', title: 'Build Worker & Docker', icon: Server },
    { id: 'signing', title: 'Keystore & Play Store Signing', icon: Key },
    { id: 'ios-signing', title: 'Apple Signing & TestFlight', icon: ShieldCheck },
    { id: 'limitations', title: 'Web Limitations & Warnings', icon: AlertTriangle },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Technical Documentation</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Architecture reference, build pipeline specifications, and deployment guides.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-1 sticky top-24">
          {sections.map(sec => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{sec.title}</span>
              </button>
            );
          })}
        </div>

        {/* Documentation Content Area */}
        <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs text-slate-700 leading-relaxed">
          {activeSection === 'overview' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">1. How Web2App Studio Works</h2>
              <p>
                Web2App Studio is a production-grade website-to-mobile-app converter. Rather than generating a static mockup, it constructs fully compliant native source projects for both <strong>Android</strong> (written in <strong>Kotlin 1.9</strong> with <strong>Gradle 8.3</strong> targeting <strong>Android 14 API 34</strong>) and <strong>Apple iOS</strong> (written in <strong>Swift 5.9</strong> with <strong>WKWebView</strong> targeting <strong>iOS 16+</strong>).
              </p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block text-xs">Pipeline Workflow:</span>
                <p>1. <strong>Website Analysis:</strong> Evaluates target URL, HTTPS status, viewport, and HTTP response headers.</p>
                <p>2. <strong>Project Synthesis:</strong> Generates Kotlin & Swift source files, AndroidManifest, Info.plist, and permission configurations.</p>
                <p>3. <strong>Cloud Compilation:</strong> Executes Gradle assembleRelease / bundleRelease and Xcode build / archive in isolated worker runners.</p>
                <p>4. <strong>Cryptographic Signing:</strong> Signs Android packages with SHA-256 v2/v3 signatures and generates signed iOS IPAs.</p>
                <p>5. <strong>Distribution:</strong> Delivers installable APK, Google Play AAB bundle, Apple iOS IPA, and complete source code ZIPs.</p>
              </div>
            </div>
          )}

          {activeSection === 'analyzer' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">2. Website Analyzer Specifications</h2>
              <p>
                The analyzer runs server-side on our Node.js runtime. It verifies website reachability, extracts metadata, and checks for potential embedding blocks:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>HTTPS Enforcement:</strong> Validates TLS encryption. Android 9+ enforces cleartext traffic restrictions by default.</li>
                <li><strong>X-Frame-Options:</strong> Detects if a website sends <code>DENY</code> or <code>SAMEORIGIN</code>. In desktop web browsers, this blocks iframes. In the native Android app, WebView loads the URL directly without iframe constraints.</li>
                <li><strong>Adaptive Metadata:</strong> Automatically parses <code>og:title</code>, <code>meta theme-color</code>, and favicon links to pre-populate mobile brand presets.</li>
                <li><strong>Anti-bot detection:</strong> Flags aggressive challenges (e.g. Cloudflare Turnstile, CAPTCHA walls) to ensure proper cookie and user-agent emulation is configured.</li>
              </ul>
            </div>
          )}

          {activeSection === 'android-arch' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">3. Android Native Architecture</h2>
              <p>
                The generated project uses maintained AndroidX standards:
              </p>
              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto space-y-1">
                <p className="text-indigo-400">// MainActivity.kt Architecture</p>
                <p>class MainActivity : AppCompatActivity() &#123;</p>
                <p className="pl-4">private lateinit var webView: WebView</p>
                <p className="pl-4">private var uploadMessage: ValueCallback&lt;Array&lt;Uri&gt;&gt;? = null</p>
                <p className="pl-4">private lateinit var swipeRefreshLayout: SwipeRefreshLayout</p>
                <p className="pl-4">// AndroidX OnBackPressedCallback navigation stack</p>
                <p>&#125;</p>
              </div>
              <p>
                Features included: Hardware acceleration, modern WebChromeClient file-chooser delegates, Geolocation permission requests, and deep linking (Android App Links).
              </p>
            </div>
          )}

          {activeSection === 'ios-arch' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">4. Apple iOS Native Architecture (Swift 5.9 & WKWebView)</h2>
              <p>
                The iOS project is synthesized as a modern native Xcode workspace utilizing <strong>SwiftUI</strong> and <strong>WebKit WKWebView</strong>, compliant with iOS 16–18:
              </p>
              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto space-y-1">
                <p className="text-indigo-400">// WebViewController.swift Architecture</p>
                <p>import UIKit</p>
                <p>import WebKit</p>
                <p>class WebViewController: UIViewController, WKNavigationDelegate, WKUIDelegate &#123;</p>
                <p className="pl-4">private var webView: WKWebView!</p>
                <p className="pl-4">private var refreshControl = UIRefreshControl()</p>
                <p className="pl-4">override func viewDidLoad() &#123;</p>
                <p className="pl-8">super.viewDidLoad()</p>
                <p className="pl-8">setupWebView() // Process pool, cookie storage & user-scripts</p>
                <p className="pl-4">&#125;</p>
                <p>&#125;</p>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>WKProcessPool & Persistent Cookies:</strong> Preserves user authentication sessions and web storage across app launches.</li>
                <li><strong>Safe Area Insets & Dynamic Island:</strong> Native top & bottom layout margins properly aligned with notch and Dynamic Island geometry.</li>
                <li><strong>Pull-to-Refresh:</strong> Native <code>UIRefreshControl</code> integrated directly with the WKWebView scroll view.</li>
                <li><strong>Info.plist Privacy Keys:</strong> Includes NSCameraUsageDescription, NSPhotoLibraryUsageDescription, and NSLocationWhenInUseUsageDescription keys.</li>
              </ul>
            </div>
          )}

          {activeSection === 'build-worker' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">5. Build Worker & Container Setup</h2>
              <p>
                To run isolated Android builds on private cloud infrastructure, deploy our official build worker container:
              </p>
              <div className="p-3 bg-slate-950 text-indigo-300 font-mono text-[11px] rounded-xl border border-slate-800 select-all">
                docker run -d -p 8080:8080 -e API_KEY=secret ghcr.io/web2apk/android-builder:latest
              </div>
              <p>
                The worker accepts JSON payload jobs, checks out Gradle 8.3 and Android SDK 34, runs headless compilation, and uploads artifacts to S3 or Google Cloud Storage buckets.
              </p>
            </div>
          )}

          {activeSection === 'signing' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">6. Keystore & Google Play Store Signing</h2>
              <p>
                To generate your production release keystore on your local machine:
              </p>
              <div className="p-3 bg-slate-950 text-emerald-300 font-mono text-[11px] rounded-xl border border-slate-800 select-all">
                keytool -genkey -v -keystore release.keystore -alias web2apk -keyalg RSA -keysize 2048 -validity 10000
              </div>
              <p>
                When uploading an Android App Bundle (AAB) to Google Play Console, Google Play App Signing securely signs the delivery APKs generated for each user's device screen density and architecture.
              </p>
            </div>
          )}

          {activeSection === 'ios-signing' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">7. Apple Code Signing & TestFlight / App Store</h2>
              <p>
                Distributing to Apple TestFlight and the App Store requires an Apple Developer Program membership:
              </p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block text-xs">Apple Distribution Checklist:</span>
                <p>1. <strong>Apple Developer Account:</strong> Retrieve your 10-character Team ID from developer.apple.com/account.</p>
                <p>2. <strong>App Identifier:</strong> Register your App ID matching your iOS Bundle ID (e.g. <code>com.company.app</code>).</p>
                <p>3. <strong>Certificate & Provisioning:</strong> Generate an Apple Distribution Certificate (.p12) and App Store Provisioning Profile (.mobileprovision).</p>
                <p>4. <strong>Direct Xcode Upload:</strong> Download the Xcode Project ZIP or .xcarchive from our studio, open in Xcode Organizer, and click <em>Distribute App &rarr; App Store Connect</em>.</p>
                <p>5. <strong>Enterprise Ad-Hoc / AltStore:</strong> Download the signed <code>.ipa</code> package for local sideloading via Apple Configurator or TestFlight internal testing.</p>
              </div>
            </div>
          )}

          {activeSection === 'limitations' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">8. Web Limitations & Warnings</h2>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
                <span className="font-bold block">Important Technical Boundaries:</span>
                <p>• <strong>This service creates a mobile wrapper around a website.</strong> It does not automatically transform an unstructured website into a completely native jetpack compose UI.</p>
                <p>• Websites with strict third-party authentication redirects (e.g. some OAuth popups) should configure external URL handlers in App Behavior.</p>
                <p>• Sites with desktop-only, non-responsive CSS will appear scaled down. We advise optimizing your web layouts for small viewports before distribution.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
