import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../src/cli/lib/config.ts', () => ({
  getApiKey: vi.fn(() => 'test-api-key'),
  getApiBase: vi.fn(() => 'https://api.countrystatecity.in/v1'),
}));

import { get, validateKey } from '../../../../src/cli/lib/api.ts';
import { getApiKey } from '../../../../src/cli/lib/config.ts';

const fetchMock = vi.fn();
const response = (data: unknown, status = 200, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(data), { status, headers });

describe('api client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('makes authenticated GET requests with correct headers', async () => {
    fetchMock.mockResolvedValue(response({ name: 'India' }));
    const result = await get<{ name: string }>('/countries/IN');
    expect(result.data).toEqual({ name: 'India' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.countrystatecity.in/v1/countries/IN',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-CSCAPI-KEY': 'test-api-key' }),
      }),
    );
  });

  it('extracts usage info from response headers', async () => {
    fetchMock.mockResolvedValue(response({}, 200, {
      'x-csc-daily-used': '47',
      'x-csc-daily-limit': '1000',
      'x-csc-monthly-used': '1230',
      'x-csc-monthly-limit': '30000',
    }));
    await expect(get('/countries/IN')).resolves.toMatchObject({
      usage: { dailyUsed: 47, dailyLimit: 1000, monthlyUsed: 1230, monthlyLimit: 30000 },
    });
  });

  it('returns null usage when quota headers are incomplete', async () => {
    fetchMock.mockResolvedValue(response({}, 200, { 'x-csc-daily-used': '47' }));
    await expect(get('/countries/IN')).resolves.toMatchObject({ usage: null });
  });

  for (const status of [401, 429, 404]) {
    it(`exits on ${status} response`, async () => {
      vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
      fetchMock.mockResolvedValue(response({}, status));
      await expect(get('/countries/IN')).rejects.toThrow('exit');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  }

  it('exits on network error', async () => {
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(get('/countries/IN')).rejects.toThrow('exit');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('exits when no API key is configured', async () => {
    vi.mocked(getApiKey).mockReturnValueOnce(undefined);
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(get('/countries/IN')).rejects.toThrow('exit');
  });

  it('validates a working API key', async () => {
    fetchMock.mockResolvedValue(response({}, 200, {
      'x-csc-daily-used': '10',
      'x-csc-daily-limit': '1000',
      'x-csc-monthly-used': '100',
      'x-csc-monthly-limit': '30000',
    }));
    await expect(validateKey('valid-key')).resolves.toMatchObject({ valid: true });
  });

  it('rejects an invalid API key', async () => {
    fetchMock.mockResolvedValue(response({}, 401));
    await expect(validateKey('invalid-key')).resolves.toEqual({ valid: false, usage: null });
  });
});
