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

const local = async (p: typeof import('node:path')): Promise<string | undefined> => {
  const io = await fs();
  const roots = [
    process.cwd(),
    p.join(process.cwd(), 'packages', 'countries'),
  ];
  for (const root of roots) {
    try {
      const pkg = JSON.parse(io.readFileSync(p.join(root, 'package.json'), 'utf8')) as { name?: string };
      if (pkg.name === '@countrystatecity/countries') return p.join(root, 'dist');
    } catch {
      continue;
    }
  }
  return undefined;
};

export const base = async (): Promise<string> => {
  if (typeof __dirname !== 'undefined') return __dirname;
  guard();
  const [p, m] = await Promise.all([
    path(),
    import(/* webpackIgnore: true */ 'node:module'),
  ]);
  const req = m.createRequire(p.join(process.cwd(), 'package.json'));
  try {
    return p.dirname(req.resolve('@countrystatecity/countries'));
  } catch {
    const dir = await local(p);
    if (dir) return dir;
    throw new Error('Unable to resolve @countrystatecity/countries data directory');
  }
};
