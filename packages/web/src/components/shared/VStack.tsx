import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const gapMap = {
  xs: "gap-1",
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-3",
  xl: "gap-4",
  "2xl": "gap-6",
} as const;

const ptMap = { sm: "pt-2", md: "pt-4" } as const;

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

interface VStackProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly gap?: keyof typeof gapMap;
  readonly pt?: keyof typeof ptMap;
  readonly align?: keyof typeof alignMap;
}

/** Vertical stack with configurable spacing */
export function VStack({
  children,
  className,
  gap = "lg",
  pt,
  align,
}: VStackProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        gapMap[gap],
        pt && ptMap[pt],
        align && alignMap[align],
        className,
      )}
    >
      {children}
    </div>
  );
}
