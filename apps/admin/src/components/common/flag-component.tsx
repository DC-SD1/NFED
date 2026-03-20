"use client";

import * as React from "react";
import type * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

export default function FlagComponent({
  countryCode,
}: {
  countryCode: string;
}) {
  const Flag = flags[countryCode as RPNInput.Country];
  return (
    <span className="bg-foreground/20 flex size-5 overflow-hidden rounded-md [&_svg:not([class*='size-'])]:size-full">
      {Flag && <Flag title={countryCode} />}
    </span>
  );
}
