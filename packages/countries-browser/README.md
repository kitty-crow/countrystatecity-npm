# @countrystatecity/countries-browser

Browser-compatible country, state and city data loaded through a configurable CDN with an in-memory cache.

## Install

```sh
npm install @countrystatecity/countries-browser
```

## Use

```ts
import {
  configure,
  getCitiesOfState,
  getCountries,
  getStatesOfCountry,
} from '@countrystatecity/countries-browser';

configure({ timeout: 10_000, cacheSize: 100 });

const countries = await getCountries();
const states = await getStatesOfCountry('GB');
const cities = await getCitiesOfState('GB', 'SCT');
```

The package mirrors the geographic API of `@countrystatecity/countries` and additionally exports CDN configuration, cache controls, `NetworkError` and `TimeoutError`.

## Licence

Code is available under the MIT licence.

**ODbL-1.0 © dr5hn**

Data is licensed under the Open Database License (ODbL) v1.0. You are free to share and adapt the data as long as you attribute the source, share adaptations under the same licence, and keep the data open.

Source: https://github.com/dr5hn/countries-states-cities-database
