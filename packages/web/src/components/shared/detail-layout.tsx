import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";

/** Gray background wrapper for detail pages (layout level) */
export function DetailPageBackground({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <div className="bg-muted/30">{children}</div>;
}

/** White header strip with bottom border — contains title, tabs, optional KPIs */
export function DetailHeaderShell({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <div className="border-b bg-card">
      <div className="mx-auto max-w-7xl space-y-4 px-6 pb-0 pt-6">
        {children}
      </div>
    </div>
  );
}

/** Flex row that puts title on the left, actions on the right, wraps on small screens */
export function TitleActionsRow({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      {children}
    </div>
  );
}

/** Horizontal tab navigation bar with underline indicator */
export function TabNav({ children }: { readonly children: ReactNode }) {
  return <nav className="-mb-px flex gap-1">{children}</nav>;
}

/** Single tab link — NavLink with active underline styling */
export function TabLink({
  to,
  children,
}: {
  readonly to: string;
  readonly children: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "border-foreground text-foreground"
            : "border-transparent text-muted-foreground hover:border-border hover:text-foreground/80",
        )
      }
    >
      {children}
    </NavLink>
  );
}
