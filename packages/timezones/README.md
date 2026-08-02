# @countrystatecity/timezones

IANA timezone data, country mappings, offset helpers, daylight-saving checks and time conversion utilities.

## Install

```sh
npm install @countrystatecity/timezones
```

## Use

```ts
import { convertTime, getTimezonesByCountry } from '@countrystatecity/timezones';

const zones = await getTimezonesByCountry('GB');
const converted = await convertTime(
  '2026-08-02T12:00:00Z',
  'UTC',
  'Europe/London',
);
```

The package also exports timezone validation, search, abbreviation, current-time, GMT-offset and daylight-saving helpers.

## Licence

Code is available under the MIT licence.

**ODbL-1.0 © dr5hn**

Data is licensed under the Open Database License (ODbL) v1.0. You are free to share and adapt the data as long as you attribute the source, share adaptations under the same licence, and keep the data open.

Source: https://github.com/dr5hn/countries-states-cities-database
