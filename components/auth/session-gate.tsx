"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAppSelector } from "@/lib/redux/hooks";

export function SessionGate({
  children,
  requireUser = false,
}: {
  children: ReactNode;
  requireUser?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, sessionResolved } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!requireUser || !sessionResolved || user) return;
    const next = `${pathname}${window.location.search}`;
    router.replace(`/auth?next=${encodeURIComponent(next)}`);
  }, [pathname, requireUser, router, sessionResolved, user]);

  if (!sessionResolved || (requireUser && !user)) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-background px-4"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="size-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-medium text-foreground-muted">
            সেশন যাচাই করা হচ্ছে...
          </p>
        </div>
      </main>
    );
  }

  return children;
}
