import chalk from './ansi.ts';

const ansi = /\u001B\[[0-?]*[ -/]*[@-~]/g;
const strip = (value: string): string => value.replace(ansi, '');

const width = (value: string): number => [...strip(value)].reduce((total, char) => {
  const code = char.codePointAt(0) ?? 0;
  return total + (code >= 0x1100 ? 2 : 1);
}, 0);

const pad = (value: string, size: number): string => value + ' '.repeat(Math.max(0, size - width(value)));

/** Renders a formatted table to stdout. */
export const printTable = (headers: string[], rows: string[][]): void => {
  const count = headers.length;
  const normal = rows.map(row => Array.from({ length: count }, (_, index) => row[index] ?? ''));
  const sizes = headers.map((header, index) => Math.max(
    width(header),
    ...normal.map(row => width(row[index] ?? '')),
  ));
  const border = (left: string, middle: string, right: string): string =>
    left + sizes.map(size => '─'.repeat(size + 2)).join(middle) + right;
  const line = (cells: string[]): string =>
    '│' + cells.map((cell, index) => ` ${pad(cell, sizes[index] ?? 0)} `).join('│') + '│';

  const output = [
    border('┌', '┬', '┐'),
    line(headers.map(header => chalk.cyan(header))),
    border('├', '┼', '┤'),
    ...normal.map(line),
    border('└', '┴', '┘'),
  ];
  console.log(output.join('\n'));
};

/** Pretty-prints a JSON value with syntax highlighting. */
export const printJson = (data: unknown): void => {
  const json = JSON.stringify(data, null, 2);
  const highlighted = json.replace(
    /"([^"]+)"\s*:|:\s*"((?:[^"\\]|\\.)*)"|:\s*(-?\d+(?:\.\d+)?)/g,
    (match, key: string | undefined, strVal: string | undefined, numVal: string | undefined) => {
      if (key !== undefined) return `${chalk.cyan(`"${key}"`)}:`;
      if (strVal !== undefined) return `: ${chalk.green(`"${strVal}"`)}`;
      if (numVal !== undefined) return `: ${chalk.yellow(numVal)}`;
      return match;
    },
  );
  console.log(highlighted);
};

/** Prints a key-value pair with label formatting. */
export const printDetail = (label: string, value: string): void => {
  console.log(`${chalk.bold(label.padEnd(14))}${value}`);
};
