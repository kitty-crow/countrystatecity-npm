import { spawn } from 'node:child_process';

export interface Job {
  readonly name: string;
  readonly cmd: readonly string[];
  readonly cwd: string;
}

export const run = async ({ name, cmd, cwd }: Job): Promise<void> => {
  const [bin, ...args] = cmd;
  if (!bin) throw new Error(`${name} has no executable`);
  console.log(`  ▶ ${name}`);
  const code = await new Promise<number>((resolve, reject) => {
    const child = spawn(bin, args, { cwd, stdio: 'inherit' });
    child.once('error', reject);
    child.once('close', value => resolve(value ?? 1));
  });
  if (code !== 0) throw new Error(`${name} failed with exit code ${code}`);
  console.log(`  ✓ ${name}`);
};

export const runAll = async (jobs: readonly Job[]): Promise<void> => {
  await Promise.all(jobs.map(run));
};
