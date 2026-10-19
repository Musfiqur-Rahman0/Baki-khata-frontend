"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, Store, UserRound, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { logout, BUSINESS_TYPE_LABELS } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

export function AccountMenu() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, sessionResolved, sessionLoading, logoutLoading } =
    useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      setOpen(false);

      toast.success("সফলভাবে লগআউট হয়েছে");
      router.replace("/");
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : "লগআউট করা যায়নি। আবার চেষ্টা করুন।",
      );
    }
  };

  const openLogin = () => {
    setOpen(false);
    router.push("/auth");
  };

  const initial = user?.name.trim().slice(0, 1) || "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        type="button"
        aria-label={user ? `অ্যাকাউন্ট: ${user.name}` : "অ্যাকাউন্ট"}
        className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {initial ? (
          <span aria-hidden="true">{initial}</span>
        ) : (
          <UserRound aria-hidden="true" className="size-[18px]" />
        )}
      </DialogTrigger>

      <DialogContent showCloseButton={false}>
        <DialogHeader className="mb-1 pr-8">
          <DialogTitle>আপনার অ্যাকাউন্ট</DialogTitle>
          <DialogDescription>
            {user ? "আপনার অ্যাকাউন্টের তথ্য" : "সেশন ও প্রবেশ"}
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          aria-label="বন্ধ করুন"
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface-muted text-foreground-muted transition-colors hover:bg-surface-hover"
        >
          <X aria-hidden="true" className="size-5" />
        </button>

        {!sessionResolved || sessionLoading ? (
          <p className="rounded-xl bg-surface-muted p-4 text-sm text-foreground-muted">
            সেশন যাচাই করা হচ্ছে...
          </p>
        ) : user ? (
          <>
            <div className="space-y-3 rounded-2xl bg-surface-muted p-4">
              <InfoRow icon={UserRound} label="নাম" value={user.name} />
              <InfoRow icon={Store} label="দোকান" value={user.shopName} />
              <InfoRow
                icon={Store}
                label="ব্যবসার ধরন"
                value={BUSINESS_TYPE_LABELS[user.businessType]}
              />
              <InfoRow
                icon={UserRound}
                label="মোবাইল"
                value={user.phone ?? "মোবাইল নম্বর নেই"}
              />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="mt-1 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut aria-hidden="true" className="size-[18px]" />
              {logoutLoading ? "লগআউট হচ্ছে..." : "লগআউট"}
            </button>
          </>
        ) : (
          <div className="rounded-xl bg-surface-muted p-4">
            <p className="text-sm text-foreground-muted">
              আপনি বর্তমানে লগইন করা নেই।
            </p>
            <button
              type="button"
              onClick={openLogin}
              className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-semibold text-on-primary transition-colors hover:bg-primary-hover"
            >
              <LogIn aria-hidden="true" className="size-[18px]" />
              লগইন করুন
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        aria-hidden="true"
        className="mt-0.5 size-[18px] shrink-0 text-primary"
      />
      <div className="min-w-0">
        <p className="text-xs text-foreground-muted">{label}</p>
        <p className="break-words font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
