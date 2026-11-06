"use client";

import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return; // old browsers

    // In `npm run dev` the worker is switched off. It saves /_next/static files
    // and dev file names change all the time, which causes 404 errors.
    // Here we also remove any worker/cache left over from an earlier run.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          registrations.forEach((registration) => registration.unregister()),
        )
        .catch(() => {});
      caches
        .keys()
        .then((names) =>
          names
            .filter((name) => name.startsWith("baki-khata-"))
            .forEach((name) => caches.delete(name)),
        )
        .catch(() => {});
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => console.error("SW registration failed:", error));
  }, []);

  return null; // nothing to show on screen
}
