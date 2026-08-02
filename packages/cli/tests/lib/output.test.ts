import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSpinner, isTTY, stderr } from '../../src/lib/output.ts';
import type { GlobalFlags } from '../../src/lib/output.ts';

const quietFlags: GlobalFlags = { json: false, quiet: true, noFooter: false };
const jsonFlags: GlobalFlags = { json: true, quiet: false, noFooter: false };
const normalFlags: GlobalFlags = { json: false, quiet: false, noFooter: false };

describe('stderr', () => {
  afterEach(() => vi.restoreAllMocks());

  it('writes the message followed by a newline', () => {
    const spy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    stderr('hello world');
    expect(spy).toHaveBeenCalledWith('hello world\n');
  });
});

describe('createSpinner', () => {
  afterEach(() => vi.restoreAllMocks());

  for (const flags of [quietFlags, jsonFlags]) {
    it('returns a silent chainable spinner for structured output', async () => {
      const spinner = await createSpinner('loading…', flags);
      expect(spinner.start()).toBe(spinner);
      spinner.text = 'updated';
      expect(spinner.text).toBe('updated');
      expect(() => spinner.stop()).not.toThrow();
      expect(() => spinner.succeed()).not.toThrow();
      expect(() => spinner.fail()).not.toThrow();
    });
  }

  it('uses a native stderr spinner in normal mode', async () => {
    Object.defineProperty(process.stderr, 'isTTY', { value: false, configurable: true });
    const spy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const spinner = await createSpinner('loading…', normalFlags);
    expect(spinner).toBeDefined();
    expect(spy).toHaveBeenCalledWith('- loading…\n');
  });
});

describe('isTTY', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reflects stdin TTY state', () => {
    Object.defineProperty(process.stdin, 'isTTY', { value: true, configurable: true });
    expect(isTTY()).toBe(true);
    Object.defineProperty(process.stdin, 'isTTY', { value: undefined, configurable: true });
    expect(isTTY()).toBe(false);
  });
});
