"use client";

import { Skeleton } from "@cf/ui";
import * as React from "react";

function TableLoader({ columnCount = 5, rowCount = 5, showToolbar = true }) {
  return (
    <div className="flex flex-col gap-4">
      {showToolbar && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">
          <Skeleton className="h-10 w-full !rounded-full lg:w-[22rem]" />
          <Skeleton className="h-10 w-full !rounded-full lg:w-48" />
          <Skeleton className="h-10 w-full !rounded-full lg:w-48" />
        </div>
      )}
      <div className="mb-3 overflow-x-scroll rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columnCount }).map((_, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: rowCount }).map((_, colIndex) => (
                  <td key={colIndex} className="whitespace-nowrap px-6 py-5">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableLoader;
