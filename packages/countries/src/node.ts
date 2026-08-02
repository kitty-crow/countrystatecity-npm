export const isNode = (): boolean => typeof process !== 'undefined'
  && process.versions !== undefined
  && process.versions.node !== undefined;

const guard = (): void => {
  if (!isNode()) throw new Error('Directory scanning is only available in Node.js environment');
};

export const fs = async (): Promise<typeof import('node:fs')> => {
  guard();
  return import(/* webpackIgnore: true */ 'fs');
};

export const path = async (): Promise<typeof import('node:path')> => {
  guard();
  return import(/* webpackIgnore: true */ 'path');
};

export const url = async (): Promise<typeof import('node:url')> => {
  guard();
  return import(/* webpackIgnore: true */ 'url');
};

export const base = async (): Promise<string> => {
  if (typeof __dirname !== 'undefined') return __dirname;
  const [p, u] = await Promise.all([path(), url()]);
  return p.dirname(u.fileURLToPath(import.meta.url));
};
