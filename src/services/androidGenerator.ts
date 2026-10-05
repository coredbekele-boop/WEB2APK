import JSZip from 'jszip';
import type { Project } from '../types';

export function sanitizePackageName(pkg: string): string {
  const parts = pkg.toLowerCase().replace(/[^a-z0-9_.]/g, '').split('.');
  return parts.filter(p => p.length > 0 && /^[a-z][a-z0-9_]*$/.test(p)).join('.');
}

export function generateAndroidManifest(project: Project): string {
  const permissions = project.permissions;
  const permissionTags = [
    '    <uses-permission android:name="android.permission.INTERNET" />',
    '    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />',
  ];

  if (permissions.camera) {
    permissionTags.push('    <uses-permission android:name="android.permission.CAMERA" />');
    permissionTags.push('    <uses-feature android:name="android.hardware.camera" android:required="false" />');
  }
  if (permissions.fileUpload || permissions.handleDownloads) {
    permissionTags.push('    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />');
    permissionTags.push('    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />');
  }
  if (permissions.geolocation) {
    permissionTags.push('    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />');
    permissionTags.push('    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />');
  }
  if (permissions.microphone) {
    permissionTags.push('    <uses-permission android:name="android.permission.RECORD_AUDIO" />');
  }

  const orientationAttr =
    project.orientation === 'portrait'
      ? 'android:screenOrientation="portrait"'
      : project.orientation === 'landscape'
      ? 'android:screenOrientation="landscape"'
      : 'android:screenOrientation="unspecified"';

  let host = 'yesufapp.com';
  try {
    const urlObj = new URL(project.websiteUrl);
    host = urlObj.hostname;
  } catch {
    // fallback
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${project.packageName}">

${permissionTags.join('\n')}

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Web2APK"
        android:networkSecurityConfig="@xml/network_security_config"
        android:usesCleartextTraffic="false">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            ${orientationAttr}
            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout"
            android:theme="@style/Theme.Web2APK.Splash">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            ${
              permissions.deepLinks
                ? `<intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="${host}" />
            </intent-filter>`
                : ''
            }
        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${project.packageName}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>
</manifest>`;
}

export function generateMainActivityKotlin(project: Project): string {
  const permissions = project.permissions;
  const packagePath = project.packageName;

  return `package ${packagePath}

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.webkit.*
import android.widget.FrameLayout
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private var swipeRefreshLayout: SwipeRefreshLayout? = null
    private var uploadMessage: ValueCallback<Array<Uri>>? = null

    companion object {
        const val TARGET_URL = "${project.websiteUrl}"
        const val FILE_CHOOSER_REQUEST_CODE = 1001
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.Theme_Web2APK) // Transition from Splash
        super.onCreate(savedInstanceState)

        val rootLayout = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        }

        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                12
            )
            max = 100
            visibility = View.GONE
        }

        ${
          permissions.pullToRefresh
            ? `swipeRefreshLayout = SwipeRefreshLayout(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            addView(webView)
            setOnRefreshListener {
                webView.reload()
            }
        }
        rootLayout.addView(swipeRefreshLayout)`
            : `rootLayout.addView(webView)`
        }

        rootLayout.addView(progressBar)
        setContentView(rootLayout)

        configureWebView()
        setupBackNavigation()

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState)
        } else {
            webView.loadUrl(TARGET_URL)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = ${permissions.javascript}
        settings.domStorageEnabled = ${permissions.localStorage}
        settings.databaseEnabled = ${permissions.localStorage}
        settings.allowFileAccess = ${permissions.fileUpload}
        settings.setSupportZoom(true)
        settings.builtInZoomControls = true
        settings.displayZoomControls = false
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.userAgentString = settings.userAgentString + " Web2APK/2.0"

        ${
          permissions.cookies
            ? `val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(webView, true)
        }`
            : ''
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                swipeRefreshLayout?.isRefreshing = false
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false

                ${
                  permissions.telLinks
                    ? `if (url.startsWith("tel:")) {
                    startActivity(Intent(Intent.ACTION_DIAL, Uri.parse(url)))
                    return true
                }`
                    : ''
                }
                ${
                  permissions.mailtoLinks
                    ? `if (url.startsWith("mailto:")) {
                    startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse(url)))
                    return true
                }`
                    : ''
                }
                ${
                  permissions.externalLinks
                    ? `if (!url.startsWith("${project.websiteUrl}") && !url.contains(Uri.parse("${project.websiteUrl}").host ?: "")) {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        return true
                    } catch (e: ActivityNotFoundException) {
                        Toast.makeText(this@MainActivity, "No app available to handle this link", Toast.LENGTH_SHORT).show()
                    }
                }`
                    : ''
                }

                return false
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                progressBar.progress = newProgress
                if (newProgress == 100) {
                    progressBar.visibility = View.GONE
                }
            }

            ${
              permissions.geolocation
                ? `override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                callback?.invoke(origin, true, false)
            }`
                : ''
            }

            ${
              permissions.fileUpload
                ? `override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                uploadMessage?.onReceiveValue(null)
                uploadMessage = filePathCallback

                val intent = fileChooserParams?.createIntent()
                try {
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE)
                } catch (e: ActivityNotFoundException) {
                    uploadMessage = null
                    return false
                }
                return true
            }`
                : ''
            }
        }
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            val results = WebChromeClient.FileChooserParams.parseResult(resultCode, data)
            uploadMessage?.onReceiveValue(results)
            uploadMessage = null
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }
}
`;
}

export function generateColorsXml(project: Project): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">${project.primaryColor}</color>
    <color name="colorPrimaryDark">${adjustColor(project.primaryColor, -20)}</color>
    <color name="colorAccent">${project.secondaryColor}</color>
    <color name="splashBackground">${project.splashBgColor}</color>
    <color name="statusBarColor">${project.primaryColor}</color>
    <color name="navigationBarColor">#FFFFFF</color>
</resources>`;
}

export function generateStringsXml(project: Project): string {
  const safeName = project.name.replace(/&/g, '&amp;').replace(/"/g, '\\"');
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${safeName}</string>
    <string name="app_description">${project.description.replace(/"/g, '\\"')}</string>
    <string name="app_version">${project.versionName}</string>
</resources>`;
}

export function generateThemesXml(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.Web2APK" parent="Theme.MaterialComponents.Light.NoActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
        <item name="android:statusBarColor">@color/statusBarColor</item>
        <item name="android:navigationBarColor">@color/navigationBarColor</item>
        <item name="android:windowLightStatusBar">false</item>
    </style>

    <style name="Theme.Web2APK.Splash" parent="Theme.Web2APK">
        <item name="android:windowBackground">@color/splashBackground</item>
    </style>
</resources>`;
}

export function generateNetworkSecurityConfig(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
</network-security-config>`;
}

export function generateFilePathsXml(project: Project): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="external_files" path="." />
    <cache-path name="cache_files" path="." />
</paths>`;
}

export function generateAppBuildGradle(project: Project): string {
  return `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "${project.packageName}"
    compileSdk = 34

    defaultConfig {
        applicationId = "${project.packageName}"
        minSdk = ${project.minSdkVersion || 24}
        targetSdk = ${project.targetSdkVersion || 34}
        versionCode = ${project.versionCode || 1}
        versionName = "${project.versionName || '1.0.0'}"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
    implementation("androidx.activity:activity-ktx:1.9.0")
}
`;
}

export function generateRootBuildGradle(): string {
  return `plugins {
    id("com.android.application") version "8.3.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
}
`;
}

export function generateSettingsGradle(project: Project): string {
  return `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${project.name.replace(/[^a-zA-Z0-9]/g, '')}"
include(":app")
`;
}

export function generateReadme(project: Project): string {
  return `# ${project.name} — Android Native App

Generated with **Web2APK** (Production SaaS Wrapper).

## Project Overview
- **App Name:** ${project.name}
- **Website Target:** ${project.websiteUrl}
- **Package Name:** ${project.packageName}
- **Version:** ${project.versionName} (Code: ${project.versionCode})
- **Min SDK:** ${project.minSdkVersion} (Android 7.0+)
- **Target SDK:** ${project.targetSdkVersion} (Android 14)

## How to Build in Android Studio
1. Open Android Studio (Iguana / Koala or newer).
2. Choose **Open an Existing Project** and select this directory.
3. Allow Gradle to sync dependencies.
4. To run on emulator: Click the green **Run** button.
5. To generate Release APK: Go to **Build > Generate Signed Bundle / APK...** or run:
   \`\`\`bash
   ./gradlew assembleRelease
   \`\`\`
   Artifact location: \`app/build/outputs/apk/release/app-release.apk\`
6. To generate Android App Bundle (AAB) for Google Play Store:
   \`\`\`bash
   ./gradlew bundleRelease
   \`\`\`
   Artifact location: \`app/build/outputs/bundle/release/app-release.aab\`

## Security & Architecture
- AndroidX WebView with hardened WebChromeClient
- Automatic FileProvider configuration for secure photo uploads
- Cleartext traffic disabled by default via Network Security Config
- Full Back-button history queue integration
`;
}

function adjustColor(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return '#4F46E5';
  let r = (num >> 16) + Math.round((255 * percent) / 100);
  let g = ((num >> 8) & 0x00ff) + Math.round((255 * percent) / 100);
  let b = (num & 0x0000ff) + Math.round((255 * percent) / 100);
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export async function generateProjectZip(project: Project): Promise<Blob> {
  const zip = new JSZip();
  const pkgPath = project.packageName.replace(/\./g, '/');

  // Root files
  zip.file('build.gradle.kts', generateRootBuildGradle());
  zip.file('settings.gradle.kts', generateSettingsGradle(project));
  zip.file('gradle.properties', 'org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\n');
  zip.file('README.md', generateReadme(project));

  // App module
  zip.file('app/build.gradle.kts', generateAppBuildGradle(project));
  zip.file('app/proguard-rules.pro', '# Web2APK Proguard Rules\n-keepclassmembers class * {\n    @android.webkit.JavascriptInterface <methods>;\n}\n-keepattributes JavascriptInterface\n');

  // Manifest
  zip.file('app/src/main/AndroidManifest.xml', generateAndroidManifest(project));

  // Kotlin source
  zip.file(`app/src/main/java/${pkgPath}/MainActivity.kt`, generateMainActivityKotlin(project));

  // Resources
  zip.file('app/src/main/res/values/colors.xml', generateColorsXml(project));
  zip.file('app/src/main/res/values/strings.xml', generateStringsXml(project));
  zip.file('app/src/main/res/values/themes.xml', generateThemesXml());
  zip.file('app/src/main/res/xml/network_security_config.xml', generateNetworkSecurityConfig());
  zip.file('app/src/main/res/xml/file_paths.xml', generateFilePathsXml(project));

  return await zip.generateAsync({ type: 'blob' });
}
