type Paint = (value: string) => string;

const enabled = (): boolean => {
  const force = process.env['FORCE_COLOR'];
  if (force === '0') return false;
  if (force !== undefined) return true;
  if ('NO_COLOR' in process.env) return false;
  if (process.env['TERM'] === 'dumb') return false;
  return Boolean(process.stdout.isTTY || process.stderr.isTTY);
};

const paint = (open: number, close: number): Paint => value =>
  enabled() ? `\u001B[${open}m${value}\u001B[${close}m` : value;

const hex = (colour: string): Paint => {
  const raw = colour.replace(/^#/, '');
  const full = raw.length === 3 ? [...raw].map(char => char + char).join('') : raw;
  if (!/^[0-9a-f]{6}$/i.test(full)) return value => value;
  const red = Number.parseInt(full.slice(0, 2), 16);
  const green = Number.parseInt(full.slice(2, 4), 16);
  const blue = Number.parseInt(full.slice(4, 6), 16);
  return value => enabled() ? `\u001B[38;2;${red};${green};${blue}m${value}\u001B[39m` : value;
};

const chalk = {
  bold: paint(1, 22),
  cyan: paint(36, 39),
  dim: paint(2, 22),
  green: paint(32, 39),
  hex,
  red: paint(31, 39),
  yellow: paint(33, 39),
};

export default chalk;
