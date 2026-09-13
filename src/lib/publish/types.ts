import type { Page } from 'playwright';
import type { PublishCheckItem, PublishJobRecord, PublishRunStatus } from '@/lib/types';

export interface PublishRunResult {
  status: PublishRunStatus;
  message: string;
  screenshotPath?: string;
  checklist: PublishCheckItem[];
  stopReason?: string;
  observedUrl?: string;
  observedTitle?: string;
}

export interface PlatformAdapter {
  run(page: Page, job: PublishJobRecord, screenshotPath: string): Promise<PublishRunResult>;
}
