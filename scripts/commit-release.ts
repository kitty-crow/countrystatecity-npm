import { fail } from './lib/args.ts';
import { run } from './lib/proc.ts';

const main = async (): Promise<void> => {
  await run({
    name: 'Configure release author',
    cmd: ['git', 'config', 'user.name', 'github-actions[bot]'],
  });
  await run({
    name: 'Configure release email',
    cmd: ['git', 'config', 'user.email', 'github-actions[bot]@users.noreply.github.com'],
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
  });
  await run({
    name: 'Commit package releases',
    cmd: ['git', 'commit', '-m', 'chore: release packages'],
  });
  await run({
    name: 'Push package releases',
    cmd: ['git', 'push'],
  });
};

main().catch(fail);
