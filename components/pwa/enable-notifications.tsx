"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

import {
  disablePush,
  enablePush,
  getPushStatus,
  type PushStatus,
} from "@/lib/push";

export function EnableNotifications() {
  const [status, setStatus] = useState<PushStatus | "loading">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPushStatus()
      .then(setStatus)
      .catch(() => setStatus("unsupported"));
  }, []);

  // Hide the button where push can't work (for example an iPhone browser tab
  // that hasn't been added to the Home Screen).
  if (status === "loading" || status === "unsupported") return null;

  if (status === "blocked") {
    return (
      <p className="rounded-xl bg-surface-muted p-3 text-sm text-foreground-muted">
        নোটিফিকেশন বন্ধ করা আছে। ব্রাউজারের সাইট সেটিংস থেকে চালু করুন।
      </p>
    );
  }

  const isOn = status === "on";

  const toggle = async () => {
    setBusy(true);
    try {
      if (isOn) {
        await disablePush();
        setStatus("off");
        toast.success("রিমাইন্ডার নোটিফিকেশন বন্ধ হয়েছে");
      } else {
        await enablePush();
        setStatus("on");
        toast.success("রিমাইন্ডার নোটিফিকেশন চালু হয়েছে");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "নোটিফিকেশন পরিবর্তন করা যায়নি।",
      );
      setStatus(await getPushStatus().catch(() => "off" as const));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-surface-muted px-4 py-3 font-semibold text-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isOn ? (
        <BellOff aria-hidden="true" className="size-[18px]" />
      ) : (
        <Bell aria-hidden="true" className="size-[18px]" />
      )}
      {busy
        ? "অপেক্ষা করুন..."
        : isOn
          ? "রিমাইন্ডার নোটিফিকেশন বন্ধ করুন"
          : "বাকির রিমাইন্ডার নোটিফিকেশন চালু করুন"}
    </button>
  );
}