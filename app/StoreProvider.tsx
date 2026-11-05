"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";

import { loadCurrentUser } from "@/features/auth/authSlice";
import { makeStore, type AppStore } from "@/lib/redux/store";

type StoreProviderProps = {
  children: ReactNode;
};

export default function StoreProvider({ children }: StoreProviderProps) {
  const [store] = useState<AppStore>(makeStore);

  useEffect(() => {
    store.dispatch(loadCurrentUser());
  }, [store]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;
    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        if (navigator.onLine) {
          const worker =
            registration.active ?? (await navigator.serviceWorker.ready).active;
          worker?.postMessage({ type: "SYNC_OUTBOX" });
        }
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    };

    const syncWhenOnline = () => {
      if (registration?.active) {
        registration.active.postMessage({ type: "SYNC_OUTBOX" });
      } else {
        void navigator.serviceWorker.ready.then((ready) =>
          ready.active?.postMessage({ type: "SYNC_OUTBOX" }),
        );
      }
    };

    void register();
    window.addEventListener("online", syncWhenOnline);
    return () => window.removeEventListener("online", syncWhenOnline);
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
