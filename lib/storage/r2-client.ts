import { S3Client } from '@aws-sdk/client-s3';

// Cloudflare R2 — S3 兼容
// 出流量免费,存储 $0.015/GB/月
export const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT ?? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
  },
});

export const R2_BUCKET = process.env.R2_BUCKET ?? 'ai-learning-artifacts';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? '';
