"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface SectionCardProps {
  title: string;
  count?: number;
  onActionClick?: () => void;
  actionAriaLabel?: string;
  className?: string;
  children?: ReactNode;
  footer?: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export function SectionCard({
  title,
  count,
  onActionClick,
  actionAriaLabel,
  className,
  children,
  footer,
  collapsible = true,
  defaultExpanded = false,
  expanded,
  onExpandedChange,
}: SectionCardProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] =
    useState<boolean>(defaultExpanded);
  const isExpanded = expanded ?? uncontrolledExpanded;

  const containerClasses = useMemo(() => {
    if (className) return className;
    return "bg-[#F5F5F5] rounded-xl border border-[hsl(var(--border-light))] flex flex-col p-4";
  }, [className]);

  const handleActionClick = useCallback(() => {
    onActionClick?.();
    if (!collapsible) return;
    const next = !isExpanded;
    if (expanded === undefined) {
      setUncontrolledExpanded(next);
    }
    onExpandedChange?.(next);
  }, [onActionClick, collapsible, isExpanded, expanded, onExpandedChange]);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number>(0);

  useEffect(() => {
    if (!contentRef.current) return;
    // Measure full height of inner content
    const el = contentRef.current;
    const measure = () => setMeasuredHeight(el.scrollHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children, footer]);

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between">
        <p className="text-base font-bold md:text-xl">
          {title}{" "}
          {typeof count === "number" ? (
            <span className="text-[#586665]">({count})</span>
          ) : null}
        </p>
        <button
          className="text-primary"
          onClick={handleActionClick}
          aria-label={actionAriaLabel || title}
          aria-expanded={isExpanded}
        >
          <motion.span
            initial={false}
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="inline-flex"
          >
            <ChevronRight className="size-5" />
          </motion.span>
        </button>
      </div>

      <motion.div
        key="content"
        initial={false}
        animate={{
          maxHeight: isExpanded ? measuredHeight + 1 : 0,
          opacity: isExpanded ? 1 : 0,
          marginTop: isExpanded ? 16 : 0,
          y: isExpanded ? 0 : -4,
        }}
        transition={
          isExpanded
            ? { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
            : { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }
        }
        style={{
          overflow: "hidden",
          willChange: "max-height, opacity, margin",
        }}
      >
        <div ref={contentRef}>
          {children ? <div className="space-y-4">{children}</div> : null}
          {footer ? (
            <div className="flex items-center justify-between">{footer}</div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
