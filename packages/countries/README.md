# @countrystatecity/countries

Server-side country, state and city data with lazy loading, strict TypeScript declarations, ESM and CommonJS entry points.

## Install

```sh
npm install @countrystatecity/countries
```

## Use

```ts
import { getCitiesOfState, getCountries, getStatesOfCountry } from '@countrystatecity/countries';

const countries = await getCountries();
const states = await getStatesOfCountry('GB');
const cities = await getCitiesOfState('GB', 'SCT');
```

The package also exports country, state and city lookup, validation, search and timezone helpers. Existing public exports, deep imports and declaration shapes remain compatible with the pre-refactor package.

This package requires a server-side runtime with filesystem access. Browser applications should use `@countrystatecity/countries-browser`.

## Licence

Code is available under the MIT licence.

**ODbL-1.0 © dr5hn**

Data is licensed under the Open Database License (ODbL) v1.0. You are free to share and adapt the data as long as you attribute the source, share adaptations under the same licence, and keep the data open.

Source: https://github.com/dr5hn/countries-states-cities-database
