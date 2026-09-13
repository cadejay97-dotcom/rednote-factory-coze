import type { Page } from 'playwright';
import type { PlatformAdapter } from '@/lib/publish/types';
import type { PublishJobRecord } from '@/lib/types';

const DEFAULT_PUBLISH_URL = 'https://creator.xiaohongshu.com/publish/publish';

function splitSelectors(value: string | undefined) {
  return (value || '')
    .split('||')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function hasAnyVisible(page: Page, selectors: string[]) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.isVisible().catch(() => false)) {
      return selector;
    }
  }
  return null;
}

export const xiaohongshuAdapter: PlatformAdapter = {
  async run(page: Page, job: PublishJobRecord, screenshotPath: string) {
    const target = process.env.XHS_PUBLISH_URL || DEFAULT_PUBLISH_URL;
    await page.goto(target, { waitUntil: 'domcontentloaded' });

    const title = await page.title();
    const currentUrl = page.url();
    const lowerContent = `${title} ${currentUrl}`.toLowerCase();
    const looksLoggedOut = lowerContent.includes('login') || lowerContent.includes('signin') || lowerContent.includes('passport');
    const riskSelector = await hasAnyVisible(page, splitSelectors(process.env.XHS_RISK_MODAL_SELECTORS));
    const editorSelector = await hasAnyVisible(page, splitSelectors(process.env.XHS_EDITOR_READY_SELECTORS));

    await page.screenshot({ path: screenshotPath, fullPage: true });

    if (looksLoggedOut) {
      return {
        status: 'need_login',
        message: '小红书发布页需要重新登录，已停止。',
        screenshotPath,
        stopReason: 'login required',
        checklist: [
          { label: '登录状态有效', passed: false, detail: '检测到登录页或登录相关地址。' },
          { label: '浏览器填充执行', passed: false, detail: '未进入编辑器。' },
          { label: '最终发布保留人工', passed: true, detail: '未自动点击任何真实发布按钮。' },
        ],
        observedUrl: currentUrl,
        observedTitle: title,
      };
    }

    if (riskSelector) {
      return {
        status: 'blocked_by_modal',
        message: '检测到小红书风险弹窗，已停止。',
        screenshotPath,
        stopReason: `risk modal: ${riskSelector}`,
        checklist: [
          { label: '已识别风险弹窗', passed: true, detail: riskSelector },
          { label: '浏览器填充执行', passed: false, detail: '风险状态下不继续自动化。' },
          { label: '最终发布保留人工', passed: true, detail: '未自动点击任何真实发布按钮。' },
        ],
        observedUrl: currentUrl,
        observedTitle: title,
      };
    }

    return {
      status: editorSelector ? 'ready_to_confirm' : 'editor_loading',
      message: editorSelector
        ? '已匹配到小红书编辑器就绪选择器，当前版本停在发布前人工确认。'
        : '已打开小红书发布页骨架；可通过环境变量补充字段选择器继续增强。',
      screenshotPath,
      checklist: [
        { label: '页面已打开', passed: true, detail: currentUrl },
        { label: '编辑器状态识别', passed: Boolean(editorSelector), detail: editorSelector || '未配置或未匹配 XHS_EDITOR_READY_SELECTORS。' },
        { label: '最终发布保留人工', passed: true, detail: '当前实现不会点击真实发布按钮。' },
      ],
      observedUrl: currentUrl,
      observedTitle: title,
    };
  },
};
