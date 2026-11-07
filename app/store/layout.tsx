import { Suspense } from "react";
import StoreProvider from "../StoreProvider";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    // <Suspense
    //   fallback={
    //     <main className="flex min-h-screen items-center justify-center text-sm text-foreground-muted">
    //       খাতা লোড হচ্ছে...
    //     </main>
    //   }
    // >
    <StoreProvider>{children}</StoreProvider>
    // {/* </Suspense> */}
  );
}
