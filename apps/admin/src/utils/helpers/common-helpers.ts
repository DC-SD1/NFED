import type {Country} from "react-phone-number-input/min";
import {parsePhoneNumber} from "react-phone-number-input/min";

import type {OptionProps} from "@/types/common.types";

/**
 * @name getUserInitials
 * @description Extracts the initials from a user's full name.
 * @param {string} fullName - The user's full name.
 * @returns {string} The initials (e.g., "John Doe" → "JD").
 */
export function getUserInitials(fullName: string): string {
  if (!fullName) return "";

  return fullName
    .trim()
    .split(/\s+/) // split by one or more spaces
    .map((word) => (word && word.length > 0 ? word[0]?.toUpperCase() : "")) // take first letter of each word
    .slice(0, 2) // only keep max 2 initials
    .join("");
}

export const getCountryFromPhone = (phone: string): Country => {
  if (phone) {
    try {
      const phoneNumber = parsePhoneNumber(phone);
      return phoneNumber?.country || "GH";
    } catch {
      return "GH";
    }
  }
  return "GH";
};

/**
 * @name getLeftMargin
 * @description Gets the left margin for the app nav bar.
 * @param {boolean} isToggleModal - Whether the toggle modal is open.
 * @param {string} state - The state of the sidebar.
 * @returns {string} The left margin.
 */

export const getLeftMargin = (
  isToggleModal: boolean,
  state: "expanded" | "collapsed",
): string => {
  if (isToggleModal) {
    return "0px"; // No margin on mobile
  }

  switch (state) {
    case "expanded":
      return "16rem"; // 16rem = 256px (--sidebar-width)
    case "collapsed":
      return "3rem"; // 3rem = 48px (--sidebar-width-icon)
    default:
      return "0px";
  }
};

export function splitCamel(str: string): string {
  if (!str) return "";
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // before a capital preceded by lowercase/number
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // split acronyms from normal words
    .trim()
    .toLowerCase();
}

export function humanizeLabel(input: string): string {
  // normalize kebab/underscore to spaces
  const normalized = input.replace(/[-_]+/g, " ");

  // insert spaces for camel/Pascal, handle acronym boundaries
  const spaced = normalized
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

  // title-case the result
  return spaced
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function capitalizeFirst(str: string) {
  if (!str) return str;
  const lowercase = str.toLowerCase();
  return lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
}

export function findOption<T extends OptionProps>(
  list: T[],
  searchValue: string,
): T | undefined {
  return list.find((item) => item.value === searchValue);
}
