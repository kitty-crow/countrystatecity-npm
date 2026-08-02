import { Command } from 'commander';
import chalk from '../lib/ansi.ts';
import { openUrl } from '../lib/browser.ts';
import { getFlags } from '../lib/flags.ts';

/** URL for the CountryStateCity online export tool. */
const EXPORT_URL = 'https://export.countrystatecity.in';

/** Registers the export command. */
export function registerExportCommand(program: Command): void {
  program
    .command('export')
    .description('Open the export tool in your browser')
    .action(async (_opts: Record<string, unknown>, cmd: Command) => {
      const flags = getFlags(cmd);
      if (flags.json) {
        console.log(JSON.stringify({ url: EXPORT_URL }));
        return;
      }

      console.log(chalk.dim('Opening the CountryStateCity export tool...'));
      console.log(chalk.dim(`URL: ${EXPORT_URL}`));
      await openUrl(EXPORT_URL);
    });
}
