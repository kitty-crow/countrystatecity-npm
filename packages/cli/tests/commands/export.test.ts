import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../src/cli/lib/browser.ts', () => ({ openUrl: vi.fn() }));

import { Command } from 'commander';
import { registerExportCommand } from '../../../../src/cli/commands/export.ts';
import { openUrl } from '../../../../src/cli/lib/browser.ts';

describe('export command', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('opens the export tool in the browser', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = new Command();
    program.exitOverride();
    registerExportCommand(program);
    await program.parseAsync(['node', 'csc', 'export']);
    expect(openUrl).toHaveBeenCalledWith('https://export.countrystatecity.in');
  });

  it('outputs JSON without opening a browser', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = new Command();
    program.option('--json');
    program.exitOverride();
    registerExportCommand(program);
    await program.parseAsync(['node', 'csc', '--json', 'export']);
    expect(openUrl).not.toHaveBeenCalled();
  });
});
