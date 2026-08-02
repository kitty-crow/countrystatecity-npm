# @countrystatecity/phonecodes

Country dial-code data with ISO2 lookup, reverse lookup, validation, search and formatting helpers.

## Install

```sh
npm install @countrystatecity/phonecodes
```

## Use

```ts
import {
  formatWithDialCode,
  getCountriesByDialCode,
  getDialCode,
} from '@countrystatecity/phonecodes';

const uk = await getDialCode('GB');
const shared = await getCountriesByDialCode('+1');
const number = await formatWithDialCode('01234567890', 'GB');
```

The package also exports raw phone-code lookup, validation and search.

## Licence

Code is available under the MIT licence.

**ODbL-1.0 © dr5hn**

Data is licensed under the Open Database License (ODbL) v1.0. You are free to share and adapt the data as long as you attribute the source, share adaptations under the same licence, and keep the data open.

Source: https://github.com/dr5hn/countries-states-cities-database
