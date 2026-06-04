import { describe, expect, it } from 'vitest';
import { routing, type Locale } from '@/lib/i18n/config';

describe('i18n routing config', () => {
  it('exposes English and Chinese locales', () => {
    expect(routing.locales).toContain('en');
    expect(routing.locales).toContain('zh');
  });

  it('defaults to English (English-first for overseas market)', () => {
    expect(routing.defaultLocale).toBe('en');
  });

  it('always prefixes the locale in URLs', () => {
    expect(routing.localePrefix).toBe('always');
  });

  it('has exactly 2 locales for v1', () => {
    expect(routing.locales).toHaveLength(2);
  });

  it('exports a Locale type for the two configured locales', () => {
    const sample: Locale = 'zh';
    expect(sample).toBe('zh');
  });
});
