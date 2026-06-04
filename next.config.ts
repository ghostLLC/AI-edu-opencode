import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // AI SDK 需要 Node.js runtime(Edge 不支持所有 LLM provider)
  serverExternalPackages: ['@neondatabase/serverless', 'postgres'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

const sentryWrapped = withSentryConfig(withNextIntl(nextConfig), {
  // Sentry build-time options. Source-map upload is a no-op when SENTRY_AUTH_TOKEN
  // is not set, so dev/CI without Sentry won't fail.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
});

export default sentryWrapped;
