"use client";

import {
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@cf/ui";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

import { type SideBarItem, useActiveNavigation } from "@/lib/config/side-bar";

interface Props {
  items: SideBarItem[];
  locale?: string;
}

export default function SidebarMainNav({ items }: Props) {
  const pathname = usePathname();
  const { isActive, shouldExpand } = useActiveNavigation(pathname);
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) =>
          item.items && item.items.length > 0 ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={shouldExpand(item)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      "text-sm",
                      shouldExpand(item) && "bg-[#F3F6F3]",
                    )}
                  >
                    {item.icon && <item.icon />}
                    <span className="truncate">{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className={"py-1.5"}>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={
                            isActive(subItem.url) ? "bg-[#F3F6F3]" : ""
                          }
                        >
                          <a href={subItem.url}>
                            <span
                              className={cn(
                                "truncate text-sm",
                                isActive(subItem.url) &&
                                  "font-bold text-[#36B92E]",
                              )}
                            >
                              {subItem.title}
                            </span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuButton
              tooltip={item.title}
              className={cn(
                "text-sm",
                isActive(`/${item.id}`) && "bg-[#F3F6F3] text-[#36B92E]",
              )}
              asChild
              key={item.title}
            >
              <a href={item.url}>
                {item.icon && <item.icon />}
                <span className="truncate">{item.title}</span>
              </a>
            </SidebarMenuButton>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
