import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

const flexBetweenGap = { sm: "gap-2", md: "gap-4", lg: "gap-6" } as const;

export function FlexBetween({
  children,
  className,
  align,
  gap,
  wrap,
}: LayoutProps & {
  align?: "center" | "start";
  gap?: "sm" | "md" | "lg";
  wrap?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between",
        align === "start" ? "items-start" : "items-center",
        gap && flexBetweenGap[gap],
        wrap && "flex-wrap",
        className,
      )}
    >
      {children}
    </div>
  );
}

const flexRowGap = {
  xs: "gap-1",
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-4",
} as const;

interface FlexRowProps extends LayoutProps {
  wrap?: boolean;
  gap?: "xs" | "sm" | "md" | "lg";
  align?: "center" | "start";
}

export function FlexRow({
  children,
  className,
  wrap,
  gap,
  align,
}: FlexRowProps) {
  return (
    <div
      className={cn(
        "flex",
        align === "start" ? "items-start" : "items-center",
        gap ? flexRowGap[gap] : "gap-3",
        wrap && "flex-wrap",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function KpiGrid({ children, className }: LayoutProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      {children}
    </div>
  );
}

export function DetailGrid({ children, className }: LayoutProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-6 lg:grid-cols-3", className)}>
      {children}
    </div>
  );
}

export function GridCols2({ children }: LayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">{children}</div>
  );
}

const flexEndGap = { xs: "gap-1", sm: "gap-1.5" } as const;

/** Flex row justified to the end */
export function FlexEnd({
  children,
  className,
  gap,
}: LayoutProps & { gap?: "xs" | "sm" }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end",
        gap ? flexEndGap[gap] : "gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}


const bottomBarSize = { sm: "py-2", default: "py-3", lg: "py-4" } as const;

/** Fixed bottom bar with border-top separator (work-table panels) */
export function BottomBar({
  children,
  className,
  size = "default",
}: LayoutProps & { size?: "sm" | "default" | "lg" }) {
  return (
    <div
      className={cn(
        "shrink-0 border-t bg-white px-4",
        bottomBarSize[size],
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Vertical divider line */
export function Divider({ className }: { className?: string }) {
  return <div className={cn("w-px bg-slate-200", className)} />;
}

/** Full-height column layout — for pages that need flex-col min-h-full */
export function FullHeightColumn({ children, className }: LayoutProps) {
  return (
    <div className={cn("flex min-h-full flex-col", className)}>{children}</div>
  );
}

/** Section with divide-y between children */
export function DivideStack({ children, className }: LayoutProps) {
  return (
    <div className={cn("divide-y divide-gray-100", className)}>{children}</div>
  );
}
