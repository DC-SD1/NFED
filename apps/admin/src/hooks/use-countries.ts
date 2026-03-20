import * as React from "react";
import {getCountries, getCountryCallingCode} from "react-phone-number-input";

/**
 * @name useCountries
 * @description Provides a list of countries with code, name, value, and calling code.
 *              Optionally filters by a provided list of country codes.
 *              Also exposes a helper to get a country code by its name.
 * @param {string[]} [filterList] - Optional list of country codes to include (e.g. ['GH', 'NG', 'KE']).
 * @returns {{
 *   countries: {
 *     code: string;
 *     value: string;
 *     label: string;
 *     callingCode: string;
 *   }[];
 *   getCountryCode: (countryName: string) => string | undefined;
 * }}
 */
export function useCountries(filterList?: string[]): {
  countries: {
    code: string;
    value: string;
    label: string;
    callingCode: string;
  }[];
  getCountryCode: (countryName: string) => string | undefined;
} {
  const countries = React.useMemo(() => {
    const allCountries = getCountries();

    const filteredCountries = filterList?.length
      ? allCountries.filter((code) => filterList.includes(code))
      : allCountries;

    return filteredCountries
      .map((countryCode) => {
        const countryName = new Intl.DisplayNames(["en"], {
          type: "region",
        }).of(countryCode);

        return {
          code: countryCode,
          label: countryName ?? countryCode,
          value: countryName ?? countryCode,
          callingCode: getCountryCallingCode(countryCode),
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [filterList]);

  const getCountryCode = React.useCallback(
    (countryName: string): string | undefined => {
      const country = countries.find((c) => c.label === countryName);
      return country?.code;
    },
    [countries],
  );

  return { countries, getCountryCode };
}
