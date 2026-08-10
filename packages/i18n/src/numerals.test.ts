import { describe, expect, it } from 'vitest';
import { formatNumber } from './numerals.js';
import { en } from './en.js';
import { fa } from './fa.js';
import { ps } from './ps.js';

describe('formatNumber', () => {
  it('renders latin digits unchanged', () => {
    expect(formatNumber(1403, 'latin', en.digits)).toBe('1403');
    expect(formatNumber(0, 'latin', en.digits)).toBe('0');
  });

  it('renders native Persian digits', () => {
    expect(formatNumber(1403, 'native', fa.digits)).toBe('۱۴۰۳');
    expect(formatNumber(15, 'native', fa.digits)).toBe('۱۵');
    expect(formatNumber(0, 'native', fa.digits)).toBe('۰');
  });

  it("does not change a value that has no locale-specific digits (native === latin, as with 'en')", () => {
    expect(formatNumber(1403, 'native', en.digits)).toBe('1403');
  });

  it('preserves digit order (not just a per-digit substitution table mismatch)', () => {
    expect(formatNumber(1990, 'native', fa.digits)).toBe('۱۹۹۰');
  });

  it('renders native Pashto digits (arabext, the same glyph set as fa)', () => {
    expect(formatNumber(1403, 'native', ps.digits)).toBe('۱۴۰۳');
    expect(formatNumber(0, 'native', ps.digits)).toBe('۰');
  });
});
