"use client";

import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    // if (process.env.NODE_ENV !== "production") return;   // skip in next dev
    if (!("serviceWorker" in navigator)) return; // old browsers

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => console.error("SW registration failed:", error));
  }, []);

  return null; // nothing to show on screen
}
