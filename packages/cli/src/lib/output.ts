import search from '@inquirer/search';

export interface GlobalFlags {
  json: boolean;
  quiet: boolean;
  noFooter: boolean;
}

export interface Spinner {
  start(text?: string): Spinner;
  stop(): void;
  succeed(text?: string): void;
  fail(text?: string): void;
  text: string;
}

export const stderr = (message: string): void => {
  process.stderr.write(message + '\n');
};

class NativeSpinner implements Spinner {
  private readonly frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private timer: ReturnType<typeof setInterval> | undefined;
  private index = 0;
  private active = false;

  constructor(public text: string) {}

  start(text?: string): Spinner {
    if (text !== undefined) this.text = text;
    if (this.active) return this;
    this.active = true;
    if (!process.stderr.isTTY) {
      stderr(`- ${this.text}`);
      return this;
    }
    this.render();
    this.timer = setInterval(() => {
      this.index = (this.index + 1) % this.frames.length;
      this.render();
    }, 80);
    this.timer.unref();
    return this;
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    if (process.stderr.isTTY) process.stderr.write('\r\u001B[2K');
  }

  succeed(text?: string): void {
    this.stop();
    stderr(`✔ ${text ?? this.text}`);
  }

  fail(text?: string): void {
    this.stop();
    stderr(`✖ ${text ?? this.text}`);
  }

  private render(): void {
    process.stderr.write(`\r\u001B[2K${this.frames[this.index] ?? '⠋'} ${this.text}`);
  }
}

const noopSpinner = (text: string): Spinner => ({
  text,
  start(next?: string): Spinner {
    if (next !== undefined) this.text = next;
    return this;
  },
  stop(): void {},
  succeed(): void {},
  fail(): void {},
});

export const createSpinner = async (text: string, flags: GlobalFlags): Promise<Spinner> => {
  if (flags.quiet || flags.json) return noopSpinner(text);
  return new NativeSpinner(text).start();
};

export const isTTY = (): boolean => Boolean(process.stdin.isTTY);

export const promptCountry = async (
  countries: Array<{ name: string; iso2: string; emoji?: string }>,
): Promise<string> => search<string>({
  message: 'Select a country',
  source: input => {
    const query = (input ?? '').toLowerCase();
    return Promise.resolve(countries
      .filter(country => country.name.toLowerCase().includes(query) || country.iso2.toLowerCase().includes(query))
      .map(country => ({
        name: country.emoji ? `${country.emoji}  ${country.name}` : country.name,
        value: country.iso2,
      })));
  },
});

export const promptState = async (
  states: Array<{ name: string; iso2: string }>,
): Promise<string> => search<string>({
  message: 'Select a state',
  source: input => {
    const query = (input ?? '').toLowerCase();
    return Promise.resolve(states
      .filter(state => state.name.toLowerCase().includes(query) || state.iso2.toLowerCase().includes(query))
      .map(state => ({ name: state.name, value: state.iso2 })));
  },
});
