/**
 * Extracts selected rows from a table and formats them for external use
 *
 * @template T - The type of data contained in each table row
 * @param tableRows - Array of table row objects containing id and original data
 * @returns Array of formatted row objects with id and original data
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * const selectedRows = getRowsFromCheckTable<User>(tableRows);
 * // Returns: Array<{ id: string | number; data: User }>
 * ```
 */
export const getRowsFromCheckTable = <T = unknown>(
  tableRows: {
    id: string | number;
    original: T;
  }[],
): {
  id: string | number;
  data: T;
}[] => {
  return tableRows.map((row) => ({
    id: row.id,
    data: row.original,
  }));
};
