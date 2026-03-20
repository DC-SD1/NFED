import { TableHead, TableHeader, TableRow } from "@cf/ui";
import type { Table } from "@tanstack/react-table";

import type { FarmManagerTableRow } from "@/types/farm-manager-item";

interface Props {
  table: Table<FarmManagerTableRow & { status: string }>;
  loading?: boolean;
  showDraftColumns?: boolean;
}

export function DataTableHeader({ table, loading, showDraftColumns }: Props) {
  const isVisible = (id: string) => {
    if (loading) return true;
    const column = table.getAllLeafColumns().find((col) => col.id === id);
    return column ? column.getIsVisible() : false;
  };

  return (
    <TableHeader>
      <TableRow className="h-[45px]   border-none hover:bg-transparent">
        <TableHead className="hidden px-3 py-2 md:table-cell md:px-4"></TableHead>

        {showDraftColumns ? (
          <>
            {isVisible("name") && (
              <TableHead className="px-3 py-2">
                <span className="font-semibold text-black">Name</span>
              </TableHead>
            )}
            {isVisible("surname") && (
              <TableHead className="px-3 py-2">
                <span className="font-semibold text-black">Surname</span>
              </TableHead>
            )}
            {isVisible("contact") && (
              <TableHead className="px-3 py-2">
                <span className="font-semibold text-black">Contact</span>
              </TableHead>
            )}
            {isVisible("yearsOfExperience") && (
              <TableHead className="px-3 py-2">
                <span className="font-semibold text-black">
                  Years of Experience
                </span>
              </TableHead>
            )}
            {isVisible("workType") && (
              <TableHead className="px-3 py-2">
                <span className="font-semibold text-black">Work Type</span>
              </TableHead>
            )}
            {isVisible("payType") && (
              <TableHead className="px-3 py-2">
                <span className="font-semibold text-black">Pay Type</span>
              </TableHead>
            )}
            <TableHead className="px-3 py-2">
              <span className="font-semibold text-black">Actions</span>
            </TableHead>
          </>
        ) : (
          <>
            {isVisible("item") && (
              <TableHead className=" px-3 py-2">
                <span className="font-semibold text-black">Item</span>
              </TableHead>
            )}
            {isVisible("name") && (
              <TableHead className=" px-3 py-2">
                <span className="font-semibold text-black">Name</span>
              </TableHead>
            )}
            {isVisible("surname") && (
              <TableHead className=" px-3 py-2">
                <span className="font-semibold text-black">Surname</span>
              </TableHead>
            )}
            {isVisible("contact") && (
              <TableHead className=" px-3 py-2">
                <span className="font-semibold text-black">Contact</span>
              </TableHead>
            )}
            {isVisible("assignedLand") && (
              <TableHead className="px-3 py-2">
                <span className="font-semibold text-black">Assigned Land</span>
              </TableHead>
            )}
            {isVisible("date") && (
              <TableHead className="py-2">
                <span className="font-semibold text-black">Date</span>
              </TableHead>
            )}
            {isVisible("badge") && (
              <TableHead className="flex items-center justify-center p-2">
                <span className="font-semibold text-black">Status</span>
              </TableHead>
            )}
            <TableHead className=" px-3 py-2">
              <span className="font-semibold text-black">Actions</span>
            </TableHead>
          </>
        )}
      </TableRow>
    </TableHeader>
  );
}
