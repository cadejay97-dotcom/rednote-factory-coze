import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const metadata = {
  title: 'Mock Publish Page',
};

function RiskBanner({ state }: { state: string }) {
  if (state === 'login-expired') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        登录态已失效，请先重新登录后再继续。
      </div>
    );
  }

  if (state === 'risk-modal') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        检测到风控弹窗模拟态，请停止自动化并人工处理。
      </div>
    );
  }

  return null;
}

export default async function MockPublishPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state = 'ready' } = await searchParams;
  const isReady = state === 'ready';

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mock 发布页</h1>
          <p className="mt-2 text-sm text-muted-foreground">用于验证本地 publish worker 的最后一步草稿填充能力，不触发真实发布。</p>
        </div>

        <RiskBanner state={state} />

        <Card className="border-border/60 bg-white">
          <CardContent className="space-y-4 p-6">
            <div>
              <label htmlFor="mock-title" className="mb-2 block text-xs font-medium text-foreground">Mock title</label>
              <Input id="mock-title" aria-label="Mock title" placeholder="这里模拟平台标题输入框" disabled={!isReady} />
            </div>
            <div>
              <label htmlFor="mock-body" className="mb-2 block text-xs font-medium text-foreground">Mock body</label>
              <Textarea id="mock-body" aria-label="Mock body" placeholder="这里模拟平台正文输入框" className="min-h-[180px]" disabled={!isReady} />
            </div>
            <div>
              <label htmlFor="mock-assets" className="mb-2 block text-xs font-medium text-foreground">Mock assets</label>
              <Textarea id="mock-assets" aria-label="Mock assets" placeholder="每行一个素材路径" className="min-h-[120px] text-xs" disabled={!isReady} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" disabled={!isReady}>填充草稿</Button>
              <Button type="button" className="bg-xhs text-white hover:bg-xhs-light" disabled={!isReady}>进入发布前确认</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-xhs/20 bg-xhs/5">
          <CardContent className="p-6 text-sm text-muted-foreground">
            <p className="font-medium text-xhs">验证规则</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>ready：允许填充标题、正文、素材，并停在“发布前确认”。</li>
              <li>login-expired：模拟登录失效，worker 应返回 need_login。</li>
              <li>risk-modal：模拟风控弹窗，worker 应返回 blocked_by_modal。</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
