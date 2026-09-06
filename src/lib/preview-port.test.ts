import { describe, expect, it } from 'vitest';
import { parsePreviewPort } from './preview-port';

describe('parsePreviewPort', () => {
  it.each([
    ['1', 1],
    ['4321', 4321],
    ['65535', 65535],
  ])('accepts %s', (raw, expected) => {
    expect(parsePreviewPort(raw)).toBe(expected);
  });

  it.each(['0', '65536', '-1', '4321;touch /tmp/injected', '3.14', '', 'abc'])(
    'rejects %j',
    (raw) => {
      expect(() => parsePreviewPort(raw)).toThrow(/PW_PORT must be an integer/);
    },
  );
});
