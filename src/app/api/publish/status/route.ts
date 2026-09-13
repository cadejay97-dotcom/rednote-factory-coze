import { NextRequest, NextResponse } from 'next/server';
import { readPublishJob } from '@/lib/publish/store';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId')?.trim();

    if (!jobId) {
      return NextResponse.json({ error: '请提供 jobId' }, { status: 400 });
    }

    const job = await readPublishJob(jobId);
    return NextResponse.json(job);
  } catch (error) {
    const message = error instanceof Error ? error.message : '读取发布状态失败';
    const status = message.includes('ENOENT') ? 404 : 500;
    return NextResponse.json({ error: status === 404 ? '未找到对应发布任务' : message }, { status });
  }
}
