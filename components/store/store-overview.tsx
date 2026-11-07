import { Icon } from "./store-icon";
import type { Customer, Mode, View } from "./store-types";
import { money, toBn, URGENT_DAYS } from "./store-utils";

type Metrics = {
  totalDue: number;
  owing: number;
  urgent: number;
  collected: number;
  collectedCount: number;
};

type StoreOverviewProps = {
  isDemo: boolean;
  isOnline: boolean;
  pendingTransactionCount: number;
  shopName: string;
  view: View;
  apiConnected: boolean;
  loaded: boolean;
  ownerName: string;
  phone: string;
  businessType: string;
  merchantCode: string;
  selected?: Customer;
  customersCount: number;
  metrics: Metrics;
  onOpenForm: (mode: Mode, customer?: Customer) => void;
  onSetAi: () => void;
  onDownloadReport: () => void;
};
export function StoreOverview({
  isDemo,
  isOnline,
  pendingTransactionCount,
  shopName,
  view,
  apiConnected,
  loaded,
  ownerName,
  phone,
  businessType,
  merchantCode,
  selected,
  customersCount,
  metrics,
  onOpenForm,
  onSetAi,
  onDownloadReport,
}: StoreOverviewProps) {
  const openForm = onOpenForm;
  const setView = (nextView: View) => {
    if (nextView === "ai") onSetAi();
  };
  const downloadReport = onDownloadReport;

  return (
    <>
      {isDemo && (
        <div className="mx-4 mt-4 rounded-xl border border-rolling-fg/20 bg-rolling-bg px-4 py-3 text-sm font-semibold text-rolling-fg sm:mx-6 lg:mx-8">
          আপনি নমুনা দোকান দেখছেন। এখানে করা পরিবর্তন শুধু এই ডেমোতেই থাকবে, আর
          কোনো SMS বা WhatsApp বার্তা পাঠানো হবে না।
        </div>
      )}
      {!isDemo && !isOnline && (
        <div
          className="mx-4 mt-4 rounded-xl border border-primary/20 bg-due-bg px-4 py-3 text-sm font-semibold text-primary sm:mx-6 lg:mx-8"
          role="status"
        >
          ইন্টারনেট সংযোগ নেই; আগে লোড করা খাতা দেখানো হচ্ছে।
          {pendingTransactionCount > 0 &&
            ` ${toBn(pendingTransactionCount)} টি লেনদেন সংযোগ ফিরলে সিঙ্ক হবে।`}{" "}
          নতুন গ্রাহক যোগ করতে ইন্টারনেট লাগবে।
        </div>
      )}
      {/* Breadcrumb */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2 flex items-center justify-between text-foreground-muted font-semibold">
        <div className="flex items-center gap-1 flex-wrap">
          <span>হোম</span>
          <span className="text-foreground-muted">/</span>
          <span>ডিজিটাল খাতা</span>
          <span className="text-foreground-muted">/</span>
          <span className="font-semibold text-foreground">{shopName}</span>
          <span className="text-foreground-muted">/</span>
          <span
            className={`px-1 py-0.5 rounded-full font-semibold text-label-md ${view === "form" ? "bg-due-bg text-primary" : "bg-settled-bg text-secondary"}`}
          >
            {view === "form"
              ? "নতুন কাস্টমার ও হিসাব এন্ট্রি"
              : view === "ai"
                ? "AI লেনদেন এন্ট্রি"
                : "গ্রাহক লেজার ও হিসাব বিবরণী"}
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-label-md font-semibold text-secondary">
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
            {isDemo
              ? "ডেমো ডেটা সক্রিয়"
              : apiConnected
                ? "সার্ভার সংযোগ সক্রিয়"
                : loaded
                  ? "সার্ভার সংযোগ নেই"
                  : "সার্ভার সংযোগ হচ্ছে"}
          </span>
          <span className="text-foreground-muted">|</span>
          <span className="text-label-md text-foreground-muted">
            কীবোর্ড শর্টকাট:{" "}
            <kbd className="px-1.5 py-0.5 bg-surface-muted rounded text-foreground font-mono">
              Alt + N
            </kbd>
          </span>
        </div>
      </div>

      {/* Banner */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-3">
        <div className="w-full bg-secondary rounded-2xl shadow-card p-4 sm:p-5 text-on-secondary flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 text-on-secondary flex items-center justify-center shadow-inner flex-shrink-0">
              <Icon name="storefront" className="text-[26px]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-semibold text-headline-lg tracking-tight !text-white leading-tight">
                  {shopName}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-on-secondary font-semibold text-label-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  {isOnline ? "লাইভ সিঙ্ক চালু" : "অফলাইন"}
                </span>
              </div>
              <p className="font-semibold text-white/80 mt-0.5">
                মালিক: {ownerName} • {phone} • {businessType} • মার্চেন্ট আইডি:{" "}
                <span className="font-mono text-white font-bold">
                  #BK-{merchantCode}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-y-3 gap-1 flex-wrap self-stretch xl:self-auto">
            <button
              type="button"
              onClick={() => openForm("add_due", selected)}
              className="cursor-pointer  flex items-center gap-1 px-3 py-2.5 rounded-full bg-primary text-on-primary font-semibold shadow hover:bg-primary-hover transition-all active:scale-95"
            >
              <Icon name="add_circle" className="text-[18px]" />
              <span>+ নতুন হিসাব / বাকি লিখুন</span>
            </button>
            <button
              type="button"
              onClick={() => openForm("new_customer")}
              className="cursor-pointer flex items-center gap-1 px-3 py-2.5 rounded-full bg-surface text-secondary font-semibold shadow hover:bg-surface-hover transition-all"
            >
              <Icon name="person_add" className="text-[18px]" />
              <span>+ নতুন কাস্টমার</span>
            </button>
            {!isDemo && (
              <button
                type="button"
                onClick={() => setView("ai")}
                className="flex items-center gap-1 px-3 py-2.5 rounded-full bg-white/10 text-on-secondary font-medium transition-all hover:bg-white/20"
              >
                <Icon name="lightbulb" className="text-[18px]" />
                <span>AI এন্ট্রি</span>
              </button>
            )}
            <button
              type="button"
              onClick={downloadReport}
              className="flex items-center gap-1 px-3 py-2.5 rounded-full bg-white/10 text-on-secondary font-medium transition-all hover:bg-white/20"
            >
              <Icon name="download" className="text-[18px]" />
              <span>দৈনিক রিপোর্ট</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-3 pb-4">
        <div className="bg-surface p-3 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-foreground-muted font-semibold">
            <span>মোট পাওনা / বকেয়া</span>
            <span className="p-1 rounded-full bg-due-bg text-error">
              <Icon name="call_received" className="text-[16px]" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-semibold text-metric-xl text-primary font-bold">
              {money(metrics.totalDue)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 font-semibold text-error">
            <Icon name="trending_up" className="text-[14px]" />
            <span>{toBn(metrics.owing)} জনের কাছে পাওনা</span>
          </div>
        </div>
        <div className="bg-surface p-3 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-foreground-muted font-semibold">
            <span>খাতার গ্রাহক সংখ্যা</span>
            <span className="p-1 rounded-full bg-due-bg text-primary">
              <Icon name="group" className="text-[16px]" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-semibold text-metric-xl text-foreground font-bold">
              {toBn(customersCount)} জন
            </span>
          </div>
          <div className="mt-2 text-label-md text-secondary flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            সবাই ডিজিটাল রেজিস্ট্রিকৃত
          </div>
        </div>
        <div className="bg-surface p-3 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-foreground-muted font-semibold">
            <span>জরুরি তাগাদা বাকি</span>
            <span className="p-1 rounded-full bg-rolling-bg text-tertiary">
              <Icon name="notifications_active" className="text-[16px]" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-semibold text-metric-xl text-tertiary font-bold">
              {toBn(metrics.urgent)} জন
            </span>
          </div>
          <div className="mt-2 text-label-md text-foreground-muted">
            {toBn(URGENT_DAYS)} দিনের বেশি মেয়াদোত্তীর্ণ
          </div>
        </div>
        <div className="bg-surface p-3 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-foreground-muted font-semibold">
            <span>আজকের নগদ আদায়</span>
            <span className="p-1 rounded-full bg-settled-bg text-secondary">
              <Icon name="payments" className="text-[16px]" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-semibold text-metric-xl text-secondary font-bold">
              {money(metrics.collected)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 font-semibold text-secondary">
            <Icon name="check_circle" className="text-[14px]" />
            <span>{toBn(metrics.collectedCount)} টি লেনদেন নিষ্পত্তি</span>
          </div>
        </div>
      </div>
    </>
  );
}
