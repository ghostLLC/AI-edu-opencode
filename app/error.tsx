'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 上报到 Sentry(配置好之后)
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="container flex min-h-screen flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">页面出错了</h2>
          <p className="text-muted-foreground">我们已经记录这个问题。</p>
          <Button onClick={() => reset()}>重试</Button>
        </div>
      </body>
    </html>
  );
}
