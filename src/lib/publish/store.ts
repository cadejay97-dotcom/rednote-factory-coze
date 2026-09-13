import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { PublishExecutionStatus, PublishJobRecord, PublishPrepareInput } from '@/lib/types';

const JOB_DIR = path.join(process.cwd(), '.publish-jobs');

function createJobId() {
  return `pub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function getJobPath(jobId: string) {
  return path.join(JOB_DIR, `${jobId}.json`);
}

async function ensureJobDir() {
  await mkdir(JOB_DIR, { recursive: true });
}

function createQueuedStatus(): PublishExecutionStatus {
  return {
    status: 'queued',
    message: '发布任务已创建，等待本地 worker 执行。',
    checklist: [
      { label: '内容已人工复核', passed: false, detail: '等待执行前确认。' },
      { label: '浏览器填充已完成', passed: false, detail: '等待本地 worker 回填。' },
      { label: '最终发布点击保留人工处理', passed: true, detail: '系统不会自动点击真实发布按钮。' },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export async function createPublishJob(input: PublishPrepareInput) {
  const jobId = createJobId();
  const record: PublishJobRecord = {
    jobId,
    createdAt: new Date().toISOString(),
    package: {
      platform: input.platform,
      accountAlias: input.accountAlias,
      title: input.title,
      body: input.body,
      assetPaths: input.assetPaths,
      mode: input.mode,
      requiredHumanGates: input.requiredHumanGates,
      workerRecommendation: input.workerRecommendation,
    },
    dryRunTarget: input.dryRunTarget,
    latestStatus: createQueuedStatus(),
  };

  await ensureJobDir();
  await writeFile(getJobPath(jobId), JSON.stringify(record, null, 2), 'utf8');
  return record;
}

export async function readPublishJob(jobId: string) {
  const raw = await readFile(getJobPath(jobId), 'utf8');
  return JSON.parse(raw) as PublishJobRecord;
}

export async function updatePublishJobStatus(jobId: string, status: PublishExecutionStatus) {
  const record = await readPublishJob(jobId);
  const nextRecord: PublishJobRecord = {
    ...record,
    latestStatus: {
      ...status,
      updatedAt: status.updatedAt || new Date().toISOString(),
    },
  };
  await writeFile(getJobPath(jobId), JSON.stringify(nextRecord, null, 2), 'utf8');
  return nextRecord;
}

export function isPublishJobPayload(value: unknown): value is PublishPrepareInput {
  if (!value || typeof value !== 'object') return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.platform === 'string' &&
    typeof body.accountAlias === 'string' &&
    typeof body.title === 'string' &&
    typeof body.body === 'string' &&
    Array.isArray(body.assetPaths) &&
    typeof body.mode === 'string' &&
    Array.isArray(body.requiredHumanGates) &&
    typeof body.workerRecommendation === 'string' &&
    typeof body.dryRunTarget === 'string'
  );
}
