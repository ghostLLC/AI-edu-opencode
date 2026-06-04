import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils/cn';

describe('cn (class merger)', () => {
  it('joins truthy class names with spaces', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(cn('foo', false && 'bar', null, undefined, 'baz')).toBe('foo baz');
  });

  it('deduplicates conflicting Tailwind classes (later wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles arrays of class names', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('returns empty string when given nothing', () => {
    expect(cn()).toBe('');
  });
});
