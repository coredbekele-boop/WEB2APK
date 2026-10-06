import JSZip from 'jszip';
import type { Project } from '../types';

export function sanitizeIosBundleId(bundleId: string): string {
  const parts = bundleId.toLowerCase().replace(/[^a-z0-9_.]/g, '').split('.');
  return parts.filter(p => p.length > 0 && /^[a-z][a-z0-9_]*$/.test(p)).join('.');
}

export function generateInfoPlist(project: Project): string {
  const permissions = project.permissions;
  const bundleId = project.iosBundleId || project.packageName;
  const appName = project.iosAppName || project.name;
  const targetUrl = project.websiteUrl;

  let host = 'yesufapp.com';
  try {
    const urlObj = new URL(targetUrl);
    host = urlObj.hostname;
  } catch {
    // fallback
  }

  const isHttps = targetUrl.startsWith('https://');

  const orientations =
    project.orientation === 'portrait'
      ? `<string>UIInterfaceOrientationPortrait</string>`
      : project.orientation === 'landscape'
      ? `<string>UIInterfaceOrientationLandscapeLeft</string>
         <string>UIInterfaceOrientationLandscapeRight</string>`
      : `<string>UIInterfaceOrientationPortrait</string>
         <string>UIInterfaceOrientationPortraitUpsideDown</string>
         <string>UIInterfaceOrientationLandscapeLeft</string>
         <string>UIInterfaceOrientationLandscapeRight</string>`;

  const privacyEntries: string[] = [];

  if (permissions.camera) {
    privacyEntries.push(`
    <key>NSCameraUsageDescription</key>
    <string>Allow ${appName} to access your camera to capture photos, record video, and scan codes directly within the web app.</string>`);
  }

  if (permissions.fileUpload || permissions.handleDownloads) {
    privacyEntries.push(`
    <key>NSPhotoLibraryUsageDescription</key>
    <string>Allow ${appName} to access your photo library so you can select and upload documents and photos.</string>
    <key>NSPhotoLibraryAddUsageDescription</key>
    <string>Allow ${appName} to save downloaded images and documents to your photo library.</string>`);
  }

  if (permissions.microphone) {
    privacyEntries.push(`
    <key>NSMicrophoneUsageDescription</key>
    <string>Allow ${appName} to access your microphone for voice input and audio recording.</string>`);
  }

  if (permissions.geolocation) {
    privacyEntries.push(`
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Allow ${appName} to access your current location while the app is active to provide personalized local content and services.</string>`);
  }

  // ATS (App Transport Security)
  const atsConfig = !isHttps
    ? `
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
        <key>NSExceptionDomains</key>
        <dict>
            <key>${host}</key>
            <dict>
                <key>NSIncludesSubdomains</key>
                <true/>
                <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
                <true/>
                <key>NSTemporaryExceptionMinimumTLSVersion</key>
                <string>TLSv1.2</string>
            </dict>
        </dict>
    </dict>`
    : `
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <false/>
    </dict>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>${appName}</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>${bundleId}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${appName}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>${project.versionName || '1.0.0'}</string>
    <key>CFBundleVersion</key>
    <string>${project.versionCode || 1}</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>arm64</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        ${orientations}
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIStatusBarStyle</key>
    <string>UIStatusBarStyleLightContent</string>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <true/>
    <key>ITSAppUsesNonExemptEncryption</key>
    <false/>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>${atsConfig}${privacyEntries.join('')}
</dict>
</plist>
`;
}

export function generateSwiftMainApp(project: Project): string {
  const appNameClean = (project.iosAppName || project.name).replace(/[^a-zA-Z0-9]/g, '');

  return `//
//  ${appNameClean}App.swift
//  Generated by Web2App Studio
//  Target URL: ${project.websiteUrl}
//

import SwiftUI
import WebKit

@main
struct ${appNameClean}App: App {
    @StateObject private var webViewModel = WebViewModel(initialUrl: "${project.websiteUrl}")

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(webViewModel)
                .preferredColorScheme(.none)
                .onOpenURL { url in
                    // Handle Universal Links and Custom App Schemes
                    webViewModel.handleIncomingURL(url)
                }
        }
    }
}
`;
}

export function generateSwiftContentView(project: Project): string {
  const primaryColor = project.primaryColor || '#4F46E5';
  const navType = project.navigationType;
  const hasBottomNav = false;

  return `//
//  ContentView.swift
//  Generated by Web2App Studio
//

import SwiftUI
import WebKit

struct ContentView: View {
    @EnvironmentObject var webViewModel: WebViewModel
    @State private var showingErrorAlert = false

    var body: some View {
        ZStack(alignment: .top) {
            Color(hex: "${project.splashBgColor || '#0F172A'}")
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Top Progress Bar
                if webViewModel.isLoading && webViewModel.estimatedProgress < 1.0 {
                    ProgressView(value: webViewModel.estimatedProgress, total: 1.0)
                        .progressViewStyle(LinearProgressViewStyle(tint: Color(hex: "${primaryColor}")))
                        .frame(height: 2)
                        .transition(.opacity)
                }

                // Native WKWebView Container
                NativeWebView(viewModel: webViewModel)
                    .edgesIgnoringSafeArea(edgesForDisplay)

                // Optional Native Bottom Bar
                ${
                  hasBottomNav
                    ? `
                NativeBottomNavigationBar(viewModel: webViewModel)
                    .background(Color(UIColor.systemBackground))
                    .overlay(
                        Rectangle()
                            .frame(height: 0.5)
                            .foregroundColor(Color(UIColor.separator)),
                        alignment: .top
                    )
                `
                    : ''
                }
            }

            // Offline / Error Notification Banner
            if webViewModel.hasConnectionError {
                VStack {
                    HStack {
                        Image(systemName: "wifi.slash")
                            .foregroundColor(.white)
                        Text("Unable to connect to server")
                            .font(.caption)
                            .foregroundColor(.white)
                        Spacer()
                        Button(action: {
                            webViewModel.reload()
                        }) {
                            Text("Retry")
                                .font(.caption.bold())
                                .foregroundColor(.white)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 4)
                                .background(Color.white.opacity(0.2))
                                .cornerRadius(6)
                        }
                    }
                    .padding(12)
                    .background(Color.red.opacity(0.92))
                    .cornerRadius(12)
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                    Spacer()
                }
                .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
        .animation(.easeInOut(duration: 0.25), value: webViewModel.isLoading)
        .animation(.easeInOut(duration: 0.25), value: webViewModel.hasConnectionError)
    }

    private var edgesForDisplay: Edge.Set {
        // If bottom bar is enabled, don't ignore bottom safe area
        ${hasBottomNav ? 'return .top' : 'return [.top, .bottom]'}
    }
}

${
  hasBottomNav
    ? `
struct NativeBottomNavigationBar: View {
    @ObservedObject var viewModel: WebViewModel

    var body: some View {
        HStack {
            ${project.navItems
              .map(
                (item, idx) => `
            Button(action: {
                viewModel.load(urlString: "${item.url.startsWith('http') ? item.url : project.websiteUrl + item.url}")
            }) {
                VStack(spacing: 3) {
                    Image(systemName: "${mapIosIcon(item.icon)}")
                        .font(.system(size: 18))
                    Text("${item.label}")
                        .font(.system(size: 10, weight: .medium))
                }
                .frame(maxWidth: .infinity)
                .foregroundColor(viewModel.currentUrl.contains("${item.url}") ? Color(hex: "${primaryColor}") : Color.secondary)
            }
            `
              )
              .join('\n')}
        }
        .padding(.vertical, 8)
        .padding(.bottom, 2)
    }
}
`
    : ''
}

// Color Hex Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 79, 70, 229)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
`;
}

function mapIosIcon(icon: string): string {
  switch (icon) {
    case 'ShoppingBag':
      return 'bag.fill';
    case 'Heart':
      return 'heart.fill';
    case 'User':
      return 'person.fill';
    case 'Radio':
      return 'dot.radiowaves.left.and.right';
    case 'Bookmark':
      return 'bookmark.fill';
    case 'Book':
      return 'book.fill';
    case 'Cpu':
      return 'cpu';
    case 'Layers':
      return 'square.3.layers.3d';
    default:
      return 'house.fill';
  }
}

export function generateSwiftWebViewModel(project: Project): string {
  const permissions = project.permissions;

  return `//
//  WebViewModel.swift
//  Generated by Web2App Studio
//

import SwiftUI
import WebKit

class WebViewModel: NSObject, ObservableObject {
    @Published var isLoading = true
    @Published var estimatedProgress: Double = 0.0
    @Published var pageTitle: String = "${project.name}"
    @Published var canGoBack = false
    @Published var canGoForward = false
    @Published var hasConnectionError = false
    @Published var currentUrl: String = ""

    var webView: WKWebView!
    private var observation: NSKeyValueObservation?
    private var titleObservation: NSKeyValueObservation?

    init(initialUrl: String) {
        super.init()
        self.currentUrl = initialUrl
        setupWebView()
    }

    private func setupWebView() {
        let configuration = WKWebViewConfiguration()

        // Enable HTML5 Media Playback & Inline Video
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []

        // Configure Cookie & Storage Persistence
        let dataStore = WKWebsiteDataStore.default()
        configuration.websiteDataStore = dataStore

        // Preferences
        let preferences = WKWebpagePreferences()
        preferences.allowsContentJavaScript = ${permissions.javascript}
        configuration.defaultWebpagePreferences = preferences

        // Custom User Agent string identifying the native iOS wrapper
        let userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Web2App-iOS/2.4.0"
        configuration.applicationNameForUserAgent = "Web2App-iOS/2.4.0"

        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.customUserAgent = userAgent

        ${
          permissions.pullToRefresh
            ? `
        // Pull to refresh support
        let refreshControl = UIRefreshControl()
        refreshControl.addTarget(self, action: #selector(handleRefresh(_:)), for: .valueChanged)
        webView.scrollView.refreshControl = refreshControl
        `
            : ''
        }

        // Progress Observation
        observation = webView.observe(\\.estimatedProgress, options: [.new]) { [weak self] _, change in
            DispatchQueue.main.async {
                self?.estimatedProgress = change.newValue ?? 0.0
            }
        }

        titleObservation = webView.observe(\\.title, options: [.new]) { [weak self] _, change in
            DispatchQueue.main.async {
                if let newTitle = change.newValue, !newTitle.isEmpty {
                    self?.pageTitle = newTitle
                }
            }
        }

        load(urlString: currentUrl)
    }

    func load(urlString: String) {
        guard let url = URL(string: urlString) else { return }
        self.currentUrl = urlString
        self.hasConnectionError = false
        var request = URLRequest(url: url)
        request.cachePolicy = .useProtocolCachePolicy
        request.timeoutInterval = 30
        webView.load(request)
    }

    func reload() {
        hasConnectionError = false
        webView.reload()
    }

    func goBack() {
        if webView.canGoBack {
            webView.goBack()
        }
    }

    func goForward() {
        if webView.canGoForward {
            webView.goForward()
        }
    }

    @objc private func handleRefresh(_ sender: UIRefreshControl) {
        webView.reload()
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            sender.endRefreshing()
        }
    }

    func handleIncomingURL(_ url: URL) {
        // Handle deep links and universal links
        self.load(urlString: url.absoluteString)
    }

    deinit {
        observation?.invalidate()
        titleObservation?.invalidate()
    }
}

// MARK: - WKNavigationDelegate
extension WebViewModel: WKNavigationDelegate {
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        DispatchQueue.main.async {
            self.isLoading = true
            self.hasConnectionError = false
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.async {
            self.isLoading = false
            self.canGoBack = webView.canGoBack
            self.canGoForward = webView.canGoForward
            if let url = webView.url?.absoluteString {
                self.currentUrl = url
            }
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        DispatchQueue.main.async {
            self.isLoading = false
            let nsError = error as NSError
            if nsError.code != NSURLErrorCancelled {
                self.hasConnectionError = true
            }
        }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }

        // Handle external protocols (tel, mailto, maps, sms)
        let scheme = url.scheme?.lowercased() ?? ""
        if ["tel", "mailto", "sms", "facetime"].contains(scheme) {
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url)
            }
            decisionHandler(.cancel)
            return
        }

        decisionHandler(.allow)
    }
}

// MARK: - WKUIDelegate
extension WebViewModel: WKUIDelegate {
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: pageTitle, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootVC = windowScene.windows.first?.rootViewController {
            rootVC.present(alert, animated: true)
        } else {
            completionHandler()
        }
    }
}

// MARK: - UIViewRepresentable Wrapper
struct NativeWebView: UIViewRepresentable {
    @ObservedObject var viewModel: WebViewModel

    func makeUIView(context: Context) -> WKWebView {
        return viewModel.webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
`;
}

export function generateExportOptionsPlist(project: Project): string {
  const teamId = project.iosTeamId || 'XXXXXXXXXX';
  const bundleId = project.iosBundleId || project.packageName;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>${teamId}</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>provisioningProfiles</key>
    <dict>
        <key>${bundleId}</key>
        <string>match AppStore ${bundleId}</string>
    </dict>
</dict>
</plist>
`;
}

export function generateXcodeProjectPbxproj(project: Project): string {
  const appName = (project.iosAppName || project.name).replace(/[^a-zA-Z0-9]/g, '');
  const bundleId = project.iosBundleId || project.packageName;
  const targetVersion = project.iosTargetVersion || '16.0';

  return `// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {

/* Begin PBXBuildFile section */
		AA0100012900000100000001 /* ${appName}App.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA0100022900000100000001 /* ${appName}App.swift */; };
		AA0100032900000100000001 /* ContentView.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA0100042900000100000001 /* ContentView.swift */; };
		AA0100052900000100000001 /* WebViewModel.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA0100062900000100000001 /* WebViewModel.swift */; };
		AA0100072900000100000001 /* Assets.xcassets in Resources */ = {isa = PBXBuildFile; fileRef = AA0100082900000100000001 /* Assets.xcassets */; };
		AA0100092900000100000001 /* LaunchScreen.storyboard in Resources */ = {isa = PBXBuildFile; fileRef = AA01000A2900000100000001 /* LaunchScreen.storyboard */; };
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
		AA01000B2900000100000001 /* ${appName}.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = "${appName}.app"; sourceTree = BUILT_PRODUCTS_DIR; };
		AA0100022900000100000001 /* ${appName}App.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = "${appName}App.swift"; sourceTree = "<group>"; };
		AA0100042900000100000001 /* ContentView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = "ContentView.swift"; sourceTree = "<group>"; };
		AA0100062900000100000001 /* WebViewModel.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = "WebViewModel.swift"; sourceTree = "<group>"; };
		AA0100082900000100000001 /* Assets.xcassets */ = {isa = PBXFileReference; lastKnownFileType = folder.assetcatalog; path = "Assets.xcassets"; sourceTree = "<group>"; };
		AA01000A2900000100000001 /* LaunchScreen.storyboard */ = {isa = PBXFileReference; lastKnownFileType = file.storyboard; path = "LaunchScreen.storyboard"; sourceTree = "<group>"; };
		AA01000C2900000100000001 /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = "Info.plist"; sourceTree = "<group>"; };
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		AA01000D2900000100000001 /* Frameworks */ = {
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		AA01000E2900000100000001 = {
			isa = PBXGroup;
			children = (
				AA01000F2900000100000001 /* ${appName} */,
				AA0100102900000100000001 /* Products */,
			);
			sourceTree = "<group>";
		};
		AA01000F2900000100000001 /* ${appName} */ = {
			isa = PBXGroup;
			children = (
				AA0100022900000100000001 /* ${appName}App.swift */,
				AA0100042900000100000001 /* ContentView.swift */,
				AA0100062900000100000001 /* WebViewModel.swift */,
				AA0100082900000100000001 /* Assets.xcassets */,
				AA01000A2900000100000001 /* LaunchScreen.storyboard */,
				AA01000C2900000100000001 /* Info.plist */,
			);
			path = "${appName}";
			sourceTree = "<group>";
		};
		AA0100102900000100000001 /* Products */ = {
			isa = PBXGroup;
			children = (
				AA01000B2900000100000001 /* ${appName}.app */,
			);
			name = Products;
			sourceTree = "<group>";
		};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		AA0100112900000100000001 /* ${appName} */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = AA0100122900000100000001 /* Build configuration list for PBXNativeTarget "${appName}" */;
			buildPhases = (
				AA0100132900000100000001 /* Sources */,
				AA01000D2900000100000001 /* Frameworks */,
				AA0100142900000100000001 /* Resources */,
			);
			buildRules = (
			);
			dependencies = (
			);
			name = "${appName}";
			productName = "${appName}";
			productReference = AA01000B2900000100000001 /* ${appName}.app */;
			productType = "com.apple.product-type.application";
		};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		AA0100152900000100000001 /* Project object */ = {
			isa = PBXProject;
			attributes = {
				BuildIndependentTargetsInParallel = 1;
				LastSwiftUpdateCheck = 1500;
				LastUpgradeCheck = 1500;
				TargetAttributes = {
					AA0100112900000100000001 = {
						CreatedOnToolsVersion = 15.0;
					};
				};
			};
			buildConfigurationList = AA0100162900000100000001 /* Build configuration list for PBXProject "${appName}" */;
			compatibilityVersion = "Xcode 14.0";
			developmentRegion = en;
			hasScannedForEncodings = 0;
			knownRegions = (
				en,
				Base,
			);
			mainGroup = AA01000E2900000100000001;
			productRefGroup = AA0100102900000100000001 /* Products */;
			projectDirPath = "";
			projectRoot = "";
			targets = (
				AA0100112900000100000001 /* ${appName} */,
			);
		};
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
		AA0100142900000100000001 /* Resources */ = {
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				AA0100072900000100000001 /* Assets.xcassets in Resources */,
				AA0100092900000100000001 /* LaunchScreen.storyboard in Resources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
		AA0100132900000100000001 /* Sources */ = {
			isa = PBXSourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				AA0100012900000100000001 /* ${appName}App.swift in Sources */,
				AA0100032900000100000001 /* ContentView.swift in Sources */,
				AA0100052900000100000001 /* WebViewModel.swift in Sources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXSourcesBuildPhase section */

/* Begin XCBuildConfiguration section */
		AA0100172900000100000001 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = dwarf;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				ENABLE_TESTABILITY = YES;
				GCC_DYNAMIC_NO_PIC = NO;
				GCC_OPTIMIZATION_LEVEL = 0;
				GCC_PREPROCESSOR_DEFINITIONS = (
					"DEBUG=1",
					"$(inherited)",
				);
				IPHONEOS_DEPLOYMENT_TARGET = ${targetVersion};
				MTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE;
				ONLY_ACTIVE_ARCH = YES;
				SDKROOT = iphoneos;
				SWIFT_ACTIVE_COMPILATION_CONDITIONS = DEBUG;
				SWIFT_OPTIMIZATION_LEVEL = "-Onone";
			};
			name = Debug;
		};
		AA0100182900000100000001 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";
				ENABLE_NS_ASSERTIONS = NO;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				GCC_OPTIMIZATION_LEVEL = s;
				IPHONEOS_DEPLOYMENT_TARGET = ${targetVersion};
				MTL_ENABLE_DEBUG_INFO = NO;
				SDKROOT = iphoneos;
				SWIFT_COMPILATION_MODE = wholemodule;
				SWIFT_OPTIMIZATION_LEVEL = "-O";
				VALIDATE_PRODUCT = YES;
			};
			name = Release;
		};
		AA0100192900000100000001 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = ${project.versionCode || 1};
				DEVELOPMENT_ASSET_PATHS = "";
				ENABLE_PREVIEWS = YES;
				GENERATE_INFOPLIST_FILE = NO;
				INFOPLIST_FILE = "${appName}/Info.plist";
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
				);
				MARKETING_VERSION = ${project.versionName || '1.0.0'};
				PRODUCT_BUNDLE_IDENTIFIER = "${bundleId}";
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Debug;
		};
		AA01001A2900000100000001 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = ${project.versionCode || 1};
				DEVELOPMENT_ASSET_PATHS = "";
				ENABLE_PREVIEWS = YES;
				GENERATE_INFOPLIST_FILE = NO;
				INFOPLIST_FILE = "${appName}/Info.plist";
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
				);
				MARKETING_VERSION = ${project.versionName || '1.0.0'};
				PRODUCT_BUNDLE_IDENTIFIER = "${bundleId}";
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Release;
		};
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
		AA0100162900000100000001 /* Build configuration list for PBXProject "${appName}" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				AA0100172900000100000001 /* Debug */,
				AA0100182900000100000001 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
		AA0100122900000100000001 /* Build configuration list for PBXNativeTarget "${appName}" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				AA0100192900000100000001 /* Debug */,
				AA01001A2900000100000001 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
/* End XCConfigurationList section */

	};
	rootObject = AA0100152900000100000001 /* Project object */;
}
`;
}

export function generateLaunchScreenStoryboard(project: Project): string {
  const primaryColor = project.primaryColor || '#4F46E5';
  const splashBgColor = project.splashBgColor || '#0F172A';

  return `<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="22505" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="01J-lp-oVM">
    <device id="retina6_12" orientation="portrait" appearance="light"/>
    <dependencies>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="22504"/>
        <capability name="Safe area layout guides" minToolsVersion="9.0"/>
        <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
    </dependencies>
    <scenes>
        <!--View Controller-->
        <scene sceneID="EHf-IW-A2E">
            <objects>
                <viewController id="01J-lp-oVM" sceneMemberID="viewController">
                    <view key="view" contentMode="scaleToFill" id="Ze5-6b-2t3">
                        <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>
                        <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
                        <subviews>
                            <label opaque="NO" userInteractionEnabled="NO" contentMode="left" horizontalHuggingPriority="251" verticalHuggingPriority="251" text="${project.name}" textAlignment="center" lineBreakMode="tailTruncation" baselineAdjustment="alignBaselines" adjustsFontSizeToFit="NO" translatesAutoresizingMaskIntoConstraints="NO" id="GJd-Yh-RWb">
                                <rect key="frame" x="24" y="408.66666666666669" width="345" height="35"/>
                                <fontDescription key="fontDescription" type="boldSystem" pointSize="29"/>
                                <color key="textColor" red="1" green="1" blue="1" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>
                                <nil key="highlightedColor"/>
                            </label>
                        </subviews>
                        <viewLayoutGuide key="safeArea" id="6Tk-OE-BBY"/>
                        <color key="backgroundColor" red="0.05882352941" green="0.09019607843" blue="0.1647058824" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>
                        <constraints>
                            <constraint firstItem="GJd-Yh-RWb" firstAttribute="centerY" secondItem="Ze5-6b-2t3" secondAttribute="centerY" id="X310-j4-poc"/>
                            <constraint firstItem="GJd-Yh-RWb" firstAttribute="leading" secondItem="6Tk-OE-BBY" secondAttribute="leading" constant="24" id="m10-a2-v1b"/>
                            <constraint firstItem="6Tk-OE-BBY" firstAttribute="trailing" secondItem="GJd-Yh-RWb" secondAttribute="trailing" constant="24" id="w99-p1-y8n"/>
                        </constraints>
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="iYj-Kq-Ea1" userLabel="First Responder" sceneMemberID="firstResponder"/>
            </objects>
            <point key="canvasLocation" x="53" y="375"/>
        </scene>
    </scenes>
</document>
`;
}

export function generateAssetsContentsJson(): string {
  return JSON.stringify(
    {
      info: {
        author: 'xcode',
        version: 1,
      },
    },
    null,
    2
  );
}

export function generateAppIconContentsJson(): string {
  return JSON.stringify(
    {
      images: [
        {
          filename: 'icon_1024.png',
          idiom: 'universal',
          platform: 'ios',
          size: '1024x1024',
        },
      ],
      info: {
        author: 'xcode',
        version: 1,
      },
    },
    null,
    2
  );
}

export function generateReadmeIOS(project: Project): string {
  const appName = project.iosAppName || project.name;
  const bundleId = project.iosBundleId || project.packageName;

  return `# ${appName} — Native iOS Application (Swift & WKWebView)

Generated with **Web2App Studio**.

This package contains a production-ready Xcode project built in **Swift 5.9** and **SwiftUI** wrapping your target web application inside an accelerated **WKWebView**.

Target URL: \`${project.websiteUrl}\`  
Bundle Identifier: \`${bundleId}\`  
Version: \`${project.versionName} (${project.versionCode})\`  
Minimum Deployment Target: \`iOS ${project.iosTargetVersion || '16.0'}+\`

---

## 🚀 Quick Start (Running in Xcode)

1. Unzip this directory.
2. Double-click **\`${appName}.xcodeproj\`** to open in Xcode.
3. Select an iOS Simulator device (e.g. **iPhone 16 Pro**) from the top bar.
4. Press **⌘ + R** (Command + R) to compile and launch.

---

## 📱 Code Signing & Physical Device Testing

1. In Xcode, click on the **\`${appName}\`** top project in the Navigator.
2. Under **TARGETS**, select **\`${appName}\`**.
3. Select the **Signing & Capabilities** tab.
4. Under **Team**, select your Apple Developer account / Team.
5. If necessary, change the **Bundle Identifier** to match your registered App ID on Apple Developer portal.
6. Connect your physical iPhone, unlock it, and hit **Run (⌘ + R)**.

---

## 📦 Exporting Release IPA & Uploading to TestFlight

### Option A: Using Xcode GUI (Recommended)
1. In Xcode top menu, select **Product > Destination > Any iOS Device (arm64)**.
2. Select **Product > Archive**.
3. When Xcode Organizer opens, select your archive and click **Distribute App**.
4. Choose **TestFlight & App Store** and click **Upload**.

### Option B: Using Command Line (CI/CD & Fastlane)
\`\`\`bash
# 1. Build Archive
xcodebuild -project ${appName}.xcodeproj \\
           -scheme ${appName} \\
           -configuration Release \\
           -archivePath build/${appName}.xcarchive \\
           clean archive

# 2. Export IPA
xcodebuild -exportArchive \\
           -archivePath build/${appName}.xcarchive \\
           -exportPath build/IPA \\
           -exportOptionsPlist ExportOptions.plist

# 3. Upload to App Store Connect via xcrun altool
xcrun altool --upload-app -f build/IPA/${appName}.ipa -t ios -u "YOUR_APPLE_ID" -p "APP_SPECIFIC_PASSWORD"
\`\`\`

---

## 🛡️ App Store Review Guideline 4.2 Compliance Checklist
To comply with Apple's Minimum Functionality Guidelines:
- ✅ Ensure your website provides interactive mobile functionality (not a static brochure).
- ✅ Privacy usage descriptions for Camera, Photo Library, and Location are already populated in \`Info.plist\`.
- ✅ Native UI components (smooth pull-to-refresh, progress bar, offline reconnect banner) are integrated natively in Swift.
`;
}
