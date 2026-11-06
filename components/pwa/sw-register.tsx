"use client";

import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return; // old browsers

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .register("/dev-sw.js", { scope: "/", updateViaCache: "none" })
        .catch((error) =>
          console.error("Development service worker registration failed:", error),
        );
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => console.error("SW registration failed:", error));
  }, []);

  return null; // nothing to show on screen
}
