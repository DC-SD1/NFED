"use client";

import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cf/ui";
import type { Row } from "@tanstack/react-table";
import { clsx } from "clsx";
import { MoreHorizontal } from "lucide-react";
import React from "react";

import type { TableActionItem } from "./data-table-component";

interface TableActionProperties<T> {
  actions: TableActionItem<T>[];
  rowData: Row<T>;
  dropdownClassName?: string;
}

const TableAction = <T,>({
  actions,
  rowData,
  dropdownClassName,
}: TableActionProperties<T>) => {
  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLDivElement>,
    item: TableActionItem<T>,
  ) => {
    event.stopPropagation();
    item.action(rowData);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={"sm"}
          className="hover:text-foreground size-7 px-4 hover:bg-[#EDF0E6]"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          "flex w-56 flex-col gap-3 rounded-xl py-1.5",
          dropdownClassName,
        )}
      >
        {actions.map((item, index) => (
          <DropdownMenuItem
            className={clsx(
              "focus:bg-btn-hover text-foreground focus:text-foreground flex items-center gap-4",
              item.className,
            )}
            key={index}
            onClick={(e) => handleMenuItemClick(e, item)}
          >
            {item.icon}
            {item.actionName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TableAction;
