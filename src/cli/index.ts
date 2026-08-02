#!/usr/bin/env node

import { Command } from 'commander';
import { registerAuthCommands } from './commands/auth.ts';
import { registerSearchCommands } from './commands/search.ts';
import { registerGetCommands } from './commands/get.ts';
import { registerUsageCommand } from './commands/usage.ts';
import { registerUpgradeCommand } from './commands/upgrade.ts';
import { registerGenerateCommands } from './commands/generate.ts';
import { registerExploreCommand } from './commands/explore.ts';
import { registerExportCommand } from './commands/export.ts';
import { getBrandedHelp } from './lib/branding.ts';
import { isRootHelpRequested, shouldShowBrandedHelp } from './lib/root-help.ts';
import { VERSION } from './version.ts';

/**
 * Prints branded help to stdout and exits cleanly with code 0.
 *
 * @returns Never — the process exits after printing.
 */
function showBrandedHelpAndExit(): never {
  process.stdout.write(getBrandedHelp() + '\n');
  process.exit(0);
}

const program = new Command();

program.addHelpCommand(false);

program
  .name('csc')
  .description('Official CLI for the Country State City API')
  .version(VERSION)
  .helpOption('-h, --help', 'Display help for csc')
  // Global output flags available to every sub-command via optsWithGlobals().
  .option('--json', 'Output raw JSON instead of formatted tables', false)
  .option('-q, --quiet', 'Suppress all decorative output', false)
  .option('--no-footer', 'Hide the usage footer after each command');

registerAuthCommands(program);
registerSearchCommands(program);
registerGetCommands(program);
registerUsageCommand(program);
registerUpgradeCommand(program);
registerGenerateCommands(program);
registerExploreCommand(program);
registerExportCommand(program);

// Intercept only root help so sub-command help still uses Commander defaults.
if (isRootHelpRequested(process.argv) && shouldShowBrandedHelp(process.argv)) {
  showBrandedHelpAndExit();
}

program.parse();
