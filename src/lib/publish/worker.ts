import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { readPublishJob, updatePublishJobStatus } from '@/lib/publish/store';
import { mockAdapter } from '@/lib/publish/mock';
import { xiaohongshuAdapter } from '@/lib/publish/xiaohongshu';
import { videohaoAdapter } from '@/lib/publish/videohao';
import type { PlatformAdapter } from '@/lib/publish/types';

function getAdapter(jobId: string, platform: string, dryRunTarget: string): PlatformAdapter {
  if (dryRunTarget === 'mock') return mockAdapter;
  if (platform === 'xiaohongshu') return xiaohongshuAdapter;
  if (platform === 'videohao') return videohaoAdapter;
  throw new Error(`不支持的平台: ${platform} (${jobId})`);
}

async function ensureArtifactDir(jobId: string) {
  const baseDir = path.join(process.cwd(), '.publish-jobs');
  const artifactDir = path.join(baseDir, 'artifacts');
  const profileDir = path.join(baseDir, 'profiles');
  await mkdir(artifactDir, { recursive: true });
  await mkdir(profileDir, { recursive: true });
  return {
    screenshotPath: path.join(artifactDir, `${jobId}.png`),
    profileDir,
  };
}

function getProfilePath(profileDir: string, dryRunTarget: string) {
  if (dryRunTarget === 'mock') {
    return path.join(profileDir, 'mock');
  }

  return process.env.PUBLISH_PROFILE_DIR || path.join(profileDir, 'real-draft');
}

export async function runPublishWorker(jobId: string) {
  const job = await readPublishJob(jobId);
  const { screenshotPath, profileDir } = await ensureArtifactDir(jobId);
  const adapter = getAdapter(jobId, job.package.platform, job.dryRunTarget);
  const userDataDir = getProfilePath(profileDir, job.dryRunTarget);
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: process.env.PUBLISH_HEADLESS !== 'false',
    channel: process.env.PUBLISH_BROWSER_CHANNEL || undefined,
  });
  const page = context.pages()[0] || (await context.newPage());

  try {
    const result = await adapter.run(page, job, screenshotPath);
    const updated = await updatePublishJobStatus(jobId, {
      ...result,
      updatedAt: new Date().toISOString(),
    });
    return updated;
  } finally {
    await context.close();
  }
}
