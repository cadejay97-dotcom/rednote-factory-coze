import type { Page } from 'playwright';
import type { PlatformAdapter, PublishRunResult } from '@/lib/publish/types';
import type { PublishJobRecord } from '@/lib/types';

function buildChecklist(job: PublishJobRecord, detail: string) {
  return [
    {
      label: '内容已写入标题与正文',
      passed: true,
      detail: `标题 ${job.package.title.length} 字，正文 ${job.package.body.length} 字。`,
    },
    {
      label: '素材数量校验',
      passed: job.package.assetPaths.length > 0,
      detail: job.package.assetPaths.length > 0 ? `共 ${job.package.assetPaths.length} 个素材占位。` : '未提供素材路径。',
    },
    {
      label: '最终发布仍需人工点击',
      passed: true,
      detail,
    },
  ];
}

async function fail(page: Page, screenshotPath: string, status: PublishRunResult['status'], message: string, stopReason: string, job: PublishJobRecord) {
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return {
    status,
    message,
    stopReason,
    screenshotPath,
    checklist: buildChecklist(job, '当前为失败分支，未进入确认页。'),
    observedUrl: page.url(),
    observedTitle: await page.title(),
  } satisfies PublishRunResult;
}

export const mockAdapter: PlatformAdapter = {
  async run(page, job, screenshotPath) {
    const target = process.env.PUBLISH_MOCK_URL || 'http://127.0.0.1:5000/mock/publish';
    await page.goto(target, { waitUntil: 'networkidle' });

    const state = process.env.PUBLISH_MOCK_STATE || 'ready';
    if (state === 'login-expired') {
      await page.goto(`${target}?state=login-expired`, { waitUntil: 'networkidle' });
      return fail(page, screenshotPath, 'need_login', '检测到登录已失效，停止执行。', 'login expired', job);
    }

    if (state === 'risk-modal') {
      await page.goto(`${target}?state=risk-modal`, { waitUntil: 'networkidle' });
      return fail(page, screenshotPath, 'blocked_by_modal', '检测到风控弹窗，停止执行。', 'risk modal', job);
    }

    if (!job.package.assetPaths.length) {
      return fail(page, screenshotPath, 'failed', '缺少素材路径，无法继续 mock 上传。', 'missing assets', job);
    }

    await page.getByLabel('Mock title').fill(job.package.title);
    await page.getByLabel('Mock body').fill(job.package.body);
    await page.getByLabel('Mock assets').fill(job.package.assetPaths.join('\n'));
    await page.getByRole('button', { name: '填充草稿' }).click();
    await page.getByRole('button', { name: '进入发布前确认' }).click();
    await page.screenshot({ path: screenshotPath, fullPage: true });

    return {
      status: 'ready_to_confirm',
      message: 'Mock 发布页已填充完成，停在最终确认前。',
      screenshotPath,
      checklist: buildChecklist(job, '系统已停在发布前确认页，未自动点击发布。'),
      observedUrl: page.url(),
      observedTitle: await page.title(),
    };
  },
};
