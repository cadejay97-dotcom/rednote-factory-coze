import { NextRequest, NextResponse } from 'next/server';
import { createPublishJob, isPublishJobPayload } from '@/lib/publish/store';
import type { PublishPrepareInput } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PublishPrepareInput;

    if (!isPublishJobPayload(body)) {
      return NextResponse.json({ error: '发布包格式不完整' }, { status: 400 });
    }

    if (!body.title.trim() || !body.body.trim()) {
      return NextResponse.json({ error: '标题和正文不能为空' }, { status: 400 });
    }

    const job = await createPublishJob(body);
    return NextResponse.json({
      jobId: job.jobId,
      status: job.latestStatus,
      package: job.package,
      dryRunTarget: job.dryRunTarget,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '创建发布任务失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
