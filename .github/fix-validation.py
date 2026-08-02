from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]

manifest = root / 'packages/cli/package.json'
pkg = json.loads(manifest.read_text(encoding='utf-8'))
pkg['dependencies']['@inquirer/select'] = '^5.2.1'
pkg['dependencies'] = dict(sorted(pkg['dependencies'].items()))
manifest.write_text(json.dumps(pkg, indent=2) + '\n', encoding='utf-8')

config = root / 'packages/cli/src/lib/config.ts'
value = config.read_text(encoding='utf-8')
old = """    return {
      apiKey: typeof value['apiKey'] === 'string' ? value['apiKey'] : undefined,
      apiBase: typeof value['apiBase'] === 'string' ? value['apiBase'] : undefined,
    };
"""
new = """    const config: Config = {};
    if (typeof value['apiKey'] === 'string') config.apiKey = value['apiKey'];
    if (typeof value['apiBase'] === 'string') config.apiBase = value['apiBase'];
    return config;
"""
if old not in value:
    raise RuntimeError('Native config return block was not found')
config.write_text(value.replace(old, new), encoding='utf-8')

Path(__file__).unlink()
