import { fail } from './lib/args.ts';
import { run } from './lib/proc.ts';

const cwd = process.cwd();

const main = async (): Promise<void> => {
  await run({
    name: 'Configure release author',
    cmd: ['git', 'config', 'user.name', 'github-actions[bot]'],
    cwd,
  });
  await run({
    name: 'Configure release email',
    cmd: ['git', 'config', 'user.email', 'github-actions[bot]@users.noreply.github.com'],
    cwd,
  });
  await run({
    name: 'Stage package releases',
    cmd: [
      'git',
      'add',
      '--',
      ':(glob)packages/*/package.json',
      ':(glob)packages/*/CHANGELOG.md',
    ],
    cwd,
  });
  await run({
    name: 'Commit package releases',
    cmd: ['git', 'commit', '-m', 'chore: release packages'],
    cwd,
  });
  await run({
    name: 'Push package releases',
    cmd: ['git', 'push'],
    cwd,
  });
};

main().catch(fail);
