import { spawn } from 'node:child_process';

interface Launch {
  readonly command: string;
  readonly args: readonly string[];
}

const launcher = (url: string): Launch => {
  if (process.platform === 'darwin') return { command: 'open', args: [url] };
  if (process.platform === 'win32') {
    return { command: 'rundll32.exe', args: ['url.dll,FileProtocolHandler', url] };
  }
  return { command: 'xdg-open', args: [url] };
};

/** Opens an HTTP(S) URL with the operating system's default browser. */
export const openUrl = async (url: string): Promise<void> => {
  const parsed = new URL(url);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsupported URL protocol: ${parsed.protocol}`);
  }

  const { command, args } = launcher(parsed.toString());
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, [...args], { detached: true, stdio: 'ignore' });
    child.once('error', reject);
    child.once('spawn', () => {
      child.unref();
      resolve();
    });
  });
};
