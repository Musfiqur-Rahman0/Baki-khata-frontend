"use client";

import StorePageView from "@/components/store/store-page";
import { SessionGate } from "@/components/auth/session-gate";

export default function DemoStorePage() {
  return (
    <SessionGate>
      <StorePageView demo />
    </SessionGate>
  );
}
