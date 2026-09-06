import { describe, expect, it } from 'vitest';
import { stringifyForInlineScript } from './safe-json';

describe('stringifyForInlineScript', () => {
  it('round-trips ordinary JSON data', () => {
    const value = { id: 'universal', price: 6800, enabled: false };
    expect(JSON.parse(stringifyForInlineScript(value))).toEqual(value);
  });

  it('cannot terminate an inline script element', () => {
    const value = { name: '</script><script>alert(1)</script>' };
    const serialized = stringifyForInlineScript(value);

    expect(serialized).not.toContain('<');
    expect(serialized.toLowerCase()).not.toContain('</script');
    expect(JSON.parse(serialized)).toEqual(value);
  });

  it('escapes JavaScript line separator characters', () => {
    const serialized = stringifyForInlineScript({ value: `a\u2028b\u2029c` });
    expect(serialized).toContain('\\u2028');
    expect(serialized).toContain('\\u2029');
    expect(JSON.parse(serialized)).toEqual({ value: `a\u2028b\u2029c` });
  });
});
