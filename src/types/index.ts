export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: PlanType;
  role: 'user' | 'admin';
  createdAt: string;
}

export type NavigationType =
  | 'bottom'
  | 'top'
  | 'hamburger'
  | 'website'
  | 'none';

export interface NavItem {
  id: string;
  label: string;
  url: string;
  icon: string;
}

export interface AppPermissions {
  javascript: boolean;
  cookies: boolean;
  localStorage: boolean;
  pullToRefresh: boolean;
  fileUpload: boolean;
  camera: boolean;
  microphone: boolean;
  geolocation: boolean;
  externalLinks: boolean;
  handleDownloads: boolean;
  telLinks: boolean;
  mailtoLinks: boolean;
  deepLinks: boolean;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  websiteUrl: string;
  packageName: string;
  description: string;
  iconUrl: string;
  splashUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  splashBgColor: string;
  navigationType: NavigationType;
  navItems: NavItem[];
  permissions: AppPermissions;
  orientation: 'portrait' | 'landscape' | 'auto';
  versionName: string;
  versionCode: number;
  minSdkVersion: number;
  targetSdkVersion: number;
  // iOS Configuration
  platforms?: ('android' | 'ios')[];
  iosBundleId?: string;
  iosTargetVersion?: string;
  iosTeamId?: string;
  iosAppName?: string;
  // GitHub Integration & CI/CD
  github?: GitHubIntegration;
  status: 'draft' | 'ready' | 'building' | 'failed';
  lastBuildId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubWebhookDelivery {
  id: string;
  event: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  branch: string;
  status: 'success' | 'failed' | 'ignored';
  buildId?: string;
  timestamp: string;
}

export interface GitHubIntegration {
  enabled: boolean;
  repository: string;
  branch: string;
  targetPlatform: 'android' | 'ios' | 'both';
  targetBuildType: 'apk' | 'aab' | 'ipa' | 'both';
  autoBuild: boolean;
  webhookSecret?: string;
  webhookUrl?: string;
  lastSyncAt?: string;
  lastCommitHash?: string;
  lastCommitMessage?: string;
  lastAuthor?: string;
  deliveries?: GitHubWebhookDelivery[];
}

export type BuildStatus =
  | 'QUEUED'
  | 'PREPARING'
  | 'GENERATING'
  | 'BUILDING'
  | 'SIGNING'
  | 'UPLOADING'
  | 'COMPLETED'
  | 'FAILED';

export interface BuildLogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

export interface Build {
  id: string;
  projectId: string;
  userId: string;
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  platform: 'android' | 'ios';
  buildType: 'apk' | 'aab' | 'bundle' | 'ipa' | 'xcarchive' | 'ios_source';
  status: BuildStatus;
  progress: number;
  currentStage: string;
  logs: BuildLogEntry[];
  apkUrl?: string;
  aabUrl?: string;
  sourceZipUrl?: string;
  ipaUrl?: string;
  xcarchiveUrl?: string;
  xcodeProjectUrl?: string;
  fileSize?: string;
  durationSeconds?: number;
  triggerSource?: 'manual' | 'github_webhook' | 'api' | 'scheduled';
  gitCommitHash?: string;
  gitCommitMessage?: string;
  gitAuthor?: string;
  gitBranch?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface WebsiteAnalysis {
  url: string;
  reachable: boolean;
  statusCode?: number;
  title: string;
  description: string;
  favicon: string;
  themeColor: string;
  viewport: string;
  https: boolean;
  xFrameOptions?: string | null;
  contentSecurityPolicy?: string | null;
  iframeEmbeddable: boolean;
  warnings: string[];
  suggestedAppName: string;
  suggestedPackageName: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalProjects: number;
  totalBuilds: number;
  successfulBuilds: number;
  failedBuilds: number;
  activeWorkers: number;
  queueDepth: number;
  workerMode: 'connected' | 'demo' | 'hybrid';
  storageUsedMb: number;
}
