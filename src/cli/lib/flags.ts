import type { Command } from 'commander';
import type { GlobalFlags } from './output.ts';

interface RawFlags {
  footer?: boolean;
  json?: boolean;
  quiet?: boolean;
}

/** Resolves root output options for a subcommand. */
export function getFlags(cmd: Command): GlobalFlags {
  const opts = cmd.optsWithGlobals<RawFlags>();
  return {
    json: opts.json ?? false,
    quiet: opts.quiet ?? false,
    noFooter: opts.footer === false,
  };
}
