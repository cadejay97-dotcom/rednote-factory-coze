export interface Tool {
  id: number;
  name: string;
  github: string;
  coreFeature: string;
  techStack: string;
  star?: string;
  rating: number;
  category: string;
  scenario: string;
  highlight: string;
}

export interface Combo {
  id: number;
  name: string;
  description: string;
  steps: { title: string; tools: string[]; desc: string }[];
  level: '入门' | '进阶' | '高阶';
}

export interface ToolsResponse {
  tools: Tool[];
  combos: Combo[];
}

export type PublishPlatform = 'xiaohongshu' | 'videohao';
export type PublishMode = 'mock' | 'real-draft';
export type PublishStage = 'draft_fill_only';
export type PublishHumanGate = 'content_review' | 'browser_fill_review' | 'final_publish_click';
export type PublishRunStatus =
  | 'queued'
  | 'need_login'
  | 'editor_loading'
  | 'uploading_assets'
  | 'filling_fields'
  | 'blocked_by_modal'
  | 'ready_to_confirm'
  | 'failed';

export interface PublishPackage {
  platform: PublishPlatform;
  accountAlias: string;
  title: string;
  body: string;
  assetPaths: string[];
  mode: PublishStage;
  requiredHumanGates: PublishHumanGate[];
  workerRecommendation: string;
}

export interface PublishPrepareInput extends PublishPackage {
  dryRunTarget: PublishMode;
}

export interface PublishCheckItem {
  label: string;
  passed: boolean;
  detail: string;
}

export interface PublishExecutionStatus {
  status: PublishRunStatus;
  message: string;
  screenshotPath?: string;
  checklist: PublishCheckItem[];
  stopReason?: string;
  observedUrl?: string;
  observedTitle?: string;
  updatedAt: string;
}

export interface PublishJobRecord {
  jobId: string;
  createdAt: string;
  package: PublishPackage;
  dryRunTarget: PublishMode;
  latestStatus: PublishExecutionStatus;
}
