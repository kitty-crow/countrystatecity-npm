# Country State City

A TypeScript monorepo for country, state, city, timezone, currency, translation and phone-code data.

The source is strict TypeScript. Published packages retain their existing ESM, CommonJS and declaration entry points, so applications can replace the pre-refactor packages without changing imports or function calls.

## Packages

| Package | Purpose |
| --- | --- |
| `@countrystatecity/countries` | Server-side countries, states and cities with lazy data loading |
| `@countrystatecity/countries-browser` | Browser-compatible geographic data loaded from a configurable CDN |
| `@countrystatecity/timezones` | IANA timezone data and conversion utilities |
| `@countrystatecity/currencies` | ISO 4217 currency lookup and formatting |
| `@countrystatecity/translations` | Country-name translations |
| `@countrystatecity/phonecodes` | Country dial-code lookup and formatting |
| `@countrystatecity/cli` | Terminal access to the Country State City API |

## Use

Install only the package you need:

```sh
pnpm add @countrystatecity/countries
```

```ts
import {
  getCitiesOfState,
  getCountries,
  getStatesOfCountry,
} from '@countrystatecity/countries';

const countries = await getCountries();
const states = await getStatesOfCountry('GB');
const cities = await getCitiesOfState('GB', 'SCT');
```

The browser package uses the same geographic lookup names:

```ts
import { getCountries } from '@countrystatecity/countries-browser';

const countries = await getCountries();
```

Install the CLI globally:

```sh
pnpm add --global @countrystatecity/cli
csc auth login
csc search states --country GB
```

Package-specific examples and complete API references are in each package README.

## Develop

```sh
pnpm install
pnpm check
```

Update the bundled datasets:

```sh
pnpm fetch-database
pnpm generate-data
pnpm check
```

`pnpm check` rejects non-TypeScript maintained source, typechecks the tooling and packages, builds every package, verifies the preserved public API, then runs the test suites.

## Documentation

- [Architecture](docs/architecture.md)
- [Compatibility contract](docs/compatibility.md)
- [Development and data updates](docs/development.md)

## Data

Package data is generated from [`dr5hn/countries-states-cities-database`](https://github.com/dr5hn/countries-states-cities-database). Generated JSON remains split by responsibility so consumers load only the data they request.

## Licence

Code and data licences are retained in the relevant package directories.
