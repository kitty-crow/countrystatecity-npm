export const isNode = (): boolean => typeof process !== 'undefined'
  && process.versions !== undefined
  && process.versions.node !== undefined;

const guard = (): void => {
  if (!isNode()) throw new Error('Directory scanning is only available in Node.js environment');
};

export const fs = async (): Promise<typeof import('node:fs')> => {
  guard();
  return import(/* webpackIgnore: true */ 'node:fs');
};

export const path = async (): Promise<typeof import('node:path')> => {
  guard();
  return import(/* webpackIgnore: true */ 'node:path');
};

const mod = async (): Promise<typeof import('node:module')> => {
  guard();
  return import(/* webpackIgnore: true */ 'node:module');
};

export const base = async (): Promise<string> => {
  if (typeof __dirname !== 'undefined') return __dirname;
  const [p, m] = await Promise.all([path(), mod()]);
  const req = m.createRequire(p.join(process.cwd(), 'package.json'));
  return p.dirname(req.resolve('@countrystatecity/countries'));
};
