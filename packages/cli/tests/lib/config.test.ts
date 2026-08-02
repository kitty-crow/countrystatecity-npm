import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { clearApiKey, getApiBase, getApiKey, isAuthenticated, setApiKey } from '../../src/lib/config.ts';

let dir = '';

describe('config', () => {
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'csc-config-'));
    process.env['CSC_CONFIG_DIR'] = dir;
  });

  afterEach(() => {
    delete process.env['CSC_CONFIG_DIR'];
    rmSync(dir, { force: true, recursive: true });
  });

  it('returns undefined when no API key is set', () => {
    expect(getApiKey()).toBeUndefined();
  });

  it('stores and retrieves an API key', () => {
    setApiKey('test-key-123');
    expect(getApiKey()).toBe('test-key-123');
  });

  it('clears the API key', () => {
    setApiKey('test-key-123');
    clearApiKey();
    expect(getApiKey()).toBeUndefined();
  });

  it('returns the default API base URL', () => {
    expect(getApiBase()).toBe('https://api.countrystatecity.in/v1');
  });

  it('reports authentication state', () => {
    expect(isAuthenticated()).toBe(false);
    setApiKey('test-key-123');
    expect(isAuthenticated()).toBe(true);
  });
});
