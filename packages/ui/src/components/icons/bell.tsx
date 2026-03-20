import * as React from "react";

import type { Icon } from "../../icons";

export const Bell: Icon = ({ color = "currentColor", ...props }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M15 12.5C15 12.5 16.25 12.5 16.25 13.75C16.25 15 15 15 15 15H5C5 15 3.75 15 3.75 13.75C3.75 12.5 5 12.5 5 12.5C5 12.5 5 10 5 8.75C5 6.25 7.5 3.75 10 3.75C12.5 3.75 15 6.25 15 8.75C15 10 15 12.5 15 12.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.75 15C8.75 15 8.75 16.25 10 16.25C11.25 16.25 11.25 15 11.25 15"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
