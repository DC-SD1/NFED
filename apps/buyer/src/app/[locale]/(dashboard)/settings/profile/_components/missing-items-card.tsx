"use client";

import { Button } from "@cf/ui";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

interface MissingSection {
  id: string;
  title: string;
  items: string[];
}

const sections: MissingSection[] = [
  {
    id: "personal-details",
    title: "Personal details",
    items: ["Organization role", "Phone number", "Profile picture"],
  },
  {
    id: "organization-information",
    title: "Organization information",
    items: ["Industry", "Website", "Year established"],
  },
];

const transitionClasses =
  "transition-[max-height,opacity] duration-300 ease-in-out";
const COLLAPSED_HEIGHT = 70;
const BASE_HEIGHT = 90;
const SECTION_HEIGHT = 130;
const CHILD_ITEM_HEIGHT = 160;
const CHILD_ITEM_OPENED_HEIGHT = 260;

interface MissingItemsCardProps {
  isCollapsed?: boolean;
  onCollapsedChangeAction?: (collapsed: boolean) => void;
  onOpenSectionsChangeAction?: (count: number) => void;
}

export function MissingItemsCard({
  isCollapsed = false,
  onCollapsedChangeAction,
  onOpenSectionsChangeAction,
}: MissingItemsCardProps) {
  const initialState = useMemo(
    () =>
      sections.reduce<Record<string, boolean>>((state, section) => {
        state[section.id] = true;
        return state;
      }, {}),
    [],
  );

  const [openSections, setOpenSections] =
    useState<Record<string, boolean>>(initialState);
  const openSectionsCount = useMemo(
    () => Object.values(openSections).filter(Boolean).length,
    [openSections],
  );
  useEffect(() => {
    onOpenSectionsChangeAction?.(openSectionsCount);
  }, [openSectionsCount, onOpenSectionsChangeAction]);
  const expandedHeight = (() => {
    if (openSectionsCount === 0) return CHILD_ITEM_HEIGHT;
    if (openSectionsCount === 1) return CHILD_ITEM_OPENED_HEIGHT;
    return Math.max(
      CHILD_ITEM_OPENED_HEIGHT,
      BASE_HEIGHT + SECTION_HEIGHT * openSectionsCount,
    );
  })();
  const containerHeight = isCollapsed ? COLLAPSED_HEIGHT : expandedHeight;

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    onCollapsedChangeAction?.(next);
  };

  return (
    <div
      className="space-y-2 rounded-2xl bg-[hsl(var(--background-light))] p-4 transition-[height] duration-300"
      style={{ height: containerHeight }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">Missing items</p>
        <Button
          variant="unstyled"
          className="flex h-[36px] w-[75px] items-center justify-center p-0 text-sm font-bold text-[hsl(var(--text-dark))]"
          onClick={handleToggleCollapse}
        >
          {isCollapsed ? (
            <IconChevronDown className="size-4 transition-transform duration-200" />
          ) : (
            <IconChevronUp className="size-4 transition-transform duration-200" />
          )}
        </Button>
      </div>

      <div
        className={`${transitionClasses} space-y-2 overflow-hidden`}
        style={{
          maxHeight: isCollapsed ? "0px" : "1000px",
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        {sections.map((section) => {
          const isOpen = openSections[section.id];
          return (
            <div key={section.id} className="space-y-2 px-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{section.title}</p>
                <Button
                  variant="unstyled"
                  className="flex h-[36px] w-[75px] items-center justify-center p-0 text-sm font-bold text-[hsl(var(--text-dark))]"
                  onClick={() => toggleSection(section.id)}
                  disabled={isCollapsed}
                >
                  {isOpen ? (
                    <IconChevronUp className="size-4 transition-transform duration-200" />
                  ) : (
                    <IconChevronDown className="size-4 transition-transform duration-200" />
                  )}
                </Button>
              </div>

              <div
                className={`${transitionClasses} overflow-hidden`}
                style={{
                  maxHeight: isCollapsed ? "0px" : isOpen ? "200px" : "0px",
                  opacity: isCollapsed ? 0 : isOpen ? 1 : 0,
                }}
              >
                <ul className="ml-4 list-disc space-y-2">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
