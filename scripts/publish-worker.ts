import { runPublishWorker } from '@/lib/publish/worker';

async function main() {
  const jobId = process.argv[2];

  if (!jobId) {
    throw new Error('请传入 jobId，例如：pnpm publish:worker pub_xxx');
  }

  const result = await runPublishWorker(jobId);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'publish worker 执行失败';
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
