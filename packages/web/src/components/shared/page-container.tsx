import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const containerVariants = cva('space-y-6 p-6 w-full', {
  variants: {
    size: {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-5xl',
      xl: 'max-w-6xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    size: 'xl',
  },
});

interface PageContainerProps extends VariantProps<typeof containerVariants> {
  children: ReactNode;
  className?: string;
}

export function PageContainer({
  size,
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn(containerVariants({ size }), className)}>{children}</div>
  );
}

export function LoadingState() {
  return <div className="p-6">Loading...</div>;
}

interface ErrorStateProps {
  message?: string;
  /** 'error' default, 'empty' centered muted, 'muted' inline muted */
  variant?: "error" | "empty" | "muted";
}

export function ErrorState({
  message = "Error loading data",
  variant = "error",
}: ErrorStateProps) {
  if (variant === "empty") {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        {message}
      </div>
    );
  }
  if (variant === "muted") {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        {message}
      </div>
    );
  }
  return <div className="p-6">{message}</div>;
}
