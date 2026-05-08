import type { ReactNode } from "react";
import { VStack } from "@/components/shared/VStack";

export function LoginLayout({ children }: { readonly children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <VStack gap="2xl" className="w-full max-w-sm">
        {children}
      </VStack>
    </div>
  );
}
