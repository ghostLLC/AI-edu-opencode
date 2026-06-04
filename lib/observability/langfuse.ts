import { Langfuse } from 'langfuse';

let _langfuse: Langfuse | null = null;

export function getLangfuse(): Langfuse | null {
  if (_langfuse) return _langfuse;

  if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) {
    return null;
  }

  _langfuse = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_HOST ?? 'https://cloud.langfuse.com',
  });

  return _langfuse;
}

// 异步 flush(在 Server Action 结束时调用)
export async function flushLangfuse() {
  if (_langfuse) {
    await _langfuse.flushAsync();
  }
}
