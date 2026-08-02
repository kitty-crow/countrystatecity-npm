# CountryStateCity

Strict TypeScript packages for country, state, city, timezone, currency, translation and phone-code data.

Published ESM, CommonJS, declaration and deep-import entry points remain compatible with the pre-refactor packages.

## Packages

| Package | Purpose |
| --- | --- |
| `@countrystatecity/countries` | Server-side countries, states and cities with lazy data loading |
| `@countrystatecity/countries-browser` | Browser-compatible geographic data from a configurable CDN |
| `@countrystatecity/timezones` | IANA timezone data and conversion utilities |
| `@countrystatecity/currencies` | ISO 4217 currency lookup and formatting |
| `@countrystatecity/translations` | Country-name translations |
| `@countrystatecity/phonecodes` | Country dial-code lookup and formatting |
| `@countrystatecity/cli` | Terminal access to the CountryStateCity API |

## Use

```sh
npm install @countrystatecity/countries
```

```ts
import { getCitiesOfState, getCountries, getStatesOfCountry } from '@countrystatecity/countries';

const countries = await getCountries();
const states = await getStatesOfCountry('GB');
const cities = await getCitiesOfState('GB', 'SCT');
```

```sh
npm install --global @countrystatecity/cli
csc auth login
csc search states --country GB
```

## Develop

npm workspaces are the canonical development environment:

```sh
npm ci
npm run check
npm run audit
```

Repository TypeScript also runs through `ts-node` and Bun. These are compatibility targets, while other workspace-aware package managers may work incidentally.

```sh
npm run check:runtime:ts-node
bun install
bun run check
```

## Documentation

- [Architecture](docs/architecture.md)
- [Compatibility](docs/compatibility.md)
- [Development](docs/development.md)
- [Security and dependencies](docs/security.md)

## Data

Data is generated from [`dr5hn/countries-states-cities-database`](https://github.com/dr5hn/countries-states-cities-database).

## Licence

Code and data licences are retained in the relevant package directories.
