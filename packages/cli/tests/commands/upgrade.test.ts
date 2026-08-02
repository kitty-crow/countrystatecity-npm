import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../src/cli/lib/config.ts', () => ({ getApiKey: vi.fn() }));
vi.mock('../../../../src/cli/lib/api.ts', () => ({ validateKey: vi.fn() }));
vi.mock('../../../../src/cli/lib/browser.ts', () => ({ openUrl: vi.fn() }));

import { Command } from 'commander';
import { registerUpgradeCommand } from '../../../../src/cli/commands/upgrade.ts';
import { validateKey } from '../../../../src/cli/lib/api.ts';
import { openUrl } from '../../../../src/cli/lib/browser.ts';
import { getApiKey } from '../../../../src/cli/lib/config.ts';

describe('upgrade command', () => {
  let program: Command;

  beforeEach(() => {
    vi.clearAllMocks();
    program = new Command();
    program.exitOverride();
    registerUpgradeCommand(program);
  });

  afterEach(() => vi.restoreAllMocks());

  it('shows the current plan when authenticated', async () => {
    vi.mocked(getApiKey).mockReturnValue('test-key');
    vi.mocked(validateKey).mockResolvedValue({
      valid: true,
      usage: { dailyUsed: 10, dailyLimit: 1000, monthlyUsed: 100, monthlyLimit: 30000 },
    });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'csc', 'upgrade']);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Supporter'));
    expect(openUrl).toHaveBeenCalledWith('https://app.countrystatecity.in/pricing');
  });

  it('shows plans and opens pricing when unauthenticated', async () => {
    vi.mocked(getApiKey).mockReturnValue(undefined);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'csc', 'upgrade']);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Available plans'));
    expect(openUrl).toHaveBeenCalledWith('https://app.countrystatecity.in/pricing');
  });
});
