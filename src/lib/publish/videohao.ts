import type { PlatformAdapter } from '@/lib/publish/types';

export const videohaoAdapter: PlatformAdapter = {
  async run() {
    return {
      status: 'failed',
      message: '视频号 adapter 还未接入真实发布页，只保留了接口占位。',
      checklist: [
        { label: '平台 adapter 已预留', passed: true, detail: '后续可复用同一 worker 状态机。' },
        { label: '真实发布流程', passed: false, detail: '当前版本尚未实现视频号字段定位与上传。' },
        { label: '最终发布保留人工', passed: true, detail: '不会自动点击真实发布按钮。' },
      ],
      stopReason: 'adapter not implemented',
      observedUrl: '',
      observedTitle: '',
    };
  },
};
