import { BrandLogo } from "@/components/brand-logo";
import { AccountMenu } from "@/components/account-menu";
import { toBn } from "./store-utils";

type StoreHeaderProps = {
  logoHref: string;
  isOnline: boolean;
  pendingTransactionCount: number;
  ownerName: string;
  phone: string;
  onDashboard: () => void;
  onCustomers: () => void;
};
export function StoreHeader({
  logoHref,
  isOnline,
  pendingTransactionCount,
  ownerName,
  phone,
  onDashboard,
  onCustomers,
}: StoreHeaderProps) {
  return (
    <header className="sticky top-0 left-0 right-0 z-40 border-b border-border bg-background/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <BrandLogo href={logoHref} />
          <div className="h-6 w-px bg-surface-hover hidden sm:block" />
        </div>

        <nav className="hidden xl:flex items-center gap-1 bg-background p-1 rounded-full">
          <button
            onClick={onDashboard}
            className="px-3 py-1 rounded-full font-semibold text-label-lg bg-primary text-on-primary font-semibold"
          >
            খাতা / ড্যাশবোর্ড
          </button>
          <button
            onClick={onCustomers}
            className="px-3 py-1 rounded-full font-semibold text-label-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-all"
          >
            গ্রাহক তালিকা
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <div
            className={`hidden md:flex items-center gap-1 px-3 py-1 rounded-full ${isOnline ? "bg-settled-bg/40" : "bg-due-bg"}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isOnline ? "bg-secondary animate-pulse" : "bg-error"}`}
            />
            <span className="font-semibold text-label-md font-semibold text-settled-fg">
              {isOnline
                ? "ক্লাউড সিঙ্ক চালু"
                : pendingTransactionCount
                  ? `${toBn(pendingTransactionCount)} টি লেনদেন সিঙ্ক অপেক্ষায়`
                  : "অফলাইন"}
            </span>
          </div>
          {/* <button
              type="button"
              onClick={() => notify("ইংরেজি সংস্করণ শীঘ্রই আসছে")}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-surface-muted hover:bg-surface-hover transition-colors"
            >
              <span className="font-semibold text-label-md font-semibold text-primary">
                বাংলা
              </span>
              <span className="font-semibold text-label-md text-foreground-muted">
                /
              </span>
              <span className="font-semibold text-label-md text-foreground-muted">
                ENG
              </span>
            </button> */}
          <div className="h-6 w-px bg-surface-hover hidden sm:block" />
          <div className="hidden sm:block text-right">
            <p className="font-semibold text-label-md text-foreground">
              {ownerName}
            </p>
            <p className="text-label-md text-foreground-muted">{phone}</p>
          </div>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
