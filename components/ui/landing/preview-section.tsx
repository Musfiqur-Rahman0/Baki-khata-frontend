"use client";

import { useState } from "react";
import { deskPreviewData } from "@/lib/landing-content";

export function PreviewSection() {
  const [quickInput, setQuickInput] = useState("");
  const [activeMessageCustomer, setActiveMessageCustomer] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [newEntryToast, setNewEntryToast] = useState<string | null>(null);

  const handleQuickSave = () => {
    const text = quickInput.trim() || deskPreviewData.quickEntryHint;
    setNewEntryToast(`যাচাইকৃত: "${text}" সফলভাবে ডেস্কে সেভ করা হয়েছে`);
    setTimeout(() => setNewEntryToast(null), 3500);
    setQuickInput("");
  };

  const openReminderModal = (name: string, amount: string) => {
    setActiveMessageCustomer(`${name} (${amount})`);
    setCopied(false);
  };

  const copyReminder = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setActiveMessageCustomer(null);
    }, 2000);
  };

  return (
    <section
      className="border-b border-stone-200 bg-white py-16 sm:py-24"
      data-purpose="desk-dashboard-preview"
      id="desk-preview"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="rounded-full border border-emerald-600/20 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-800">
            {deskPreviewData.badge}
          </span>
          <h2 className="font-serif-title mt-3 text-3xl font-bold tracking-tight text-forest-950 sm:text-4xl">
            {deskPreviewData.title}
          </h2>
          <p className="mt-2 text-sm text-stone-600 sm:text-base">
            {deskPreviewData.description}
          </p>
        </div>

        {/* Desktop Mockup Container */}
        <div className="overflow-hidden rounded-2xl border border-stone-300 bg-[#FAF8F5] shadow-card-lift">
          {/* Mock Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest-950 bg-forest-900 px-5 py-4 text-white sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg border border-forest-700 bg-forest-800 font-serif text-sm font-bold text-amber-200">
                রব
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-tight sm:text-base">
                  {deskPreviewData.shopName}
                </h3>
                <p className="text-[11px] text-stone-300">
                  {deskPreviewData.branch}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="hidden rounded-full border border-emerald-700/50 bg-forest-800/80 px-2.5 py-1 text-xs text-emerald-200 sm:inline-flex">
                ● লাইভ সিঙ্ক চালু
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewEntryToast("নতুন হিসাব যোগ করার উইন্ডো প্রস্তুত");
                  setTimeout(() => setNewEntryToast(null), 3000);
                }}
                className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-forest-950 shadow-sm transition hover:bg-amber-300 active:scale-95"
              >
                + নতুন হিসাব
              </button>
            </div>
          </div>

          {/* Toast Alert if any */}
          {newEntryToast && (
            <div className="animate-fade-in bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 text-xs font-medium text-emerald-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-600" />
                {newEntryToast}
              </span>
              <button
                onClick={() => setNewEntryToast(null)}
                className="text-emerald-700 hover:text-emerald-950 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 gap-4 border-b border-stone-200/80 bg-white/70 p-5 sm:grid-cols-3 sm:p-7">
            {deskPreviewData.metrics.map((metric) => {
              const isRose = metric.tone === "rose";
              return (
                <div
                  key={metric.label}
                  className="rounded-xl border border-stone-200 bg-[#FAF8F5] p-4"
                >
                  <span
                    className={`block text-[11px] font-semibold uppercase tracking-wider ${
                      isRose ? "text-rose-700" : "text-stone-500"
                    }`}
                  >
                    {metric.label}
                  </span>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span
                      className={`font-serif-title text-3xl font-bold ${
                        isRose
                          ? "text-rose-700"
                          : metric.tone === "forest"
                          ? "text-forest-950"
                          : "text-stone-800"
                      }`}
                    >
                      {metric.amount}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        isRose ? "text-rose-600" : "text-stone-500"
                      }`}
                    >
                      {metric.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Natural Language Fast Entry Bar */}
          <div className="flex flex-col items-center gap-3 border-b border-stone-200 bg-stone-100/90 px-5 py-3.5 sm:flex-row sm:px-7">
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-forest-950">
              <svg
                className="size-4 text-forest-800"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  fillRule="evenodd"
                />
              </svg>
              সহজ এন্ট্রি:
            </span>
            <div className="flex w-full items-center justify-between rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs sm:text-sm text-stone-700">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder='লিখুন: "রহিম মিয়া ২ কেজি চাল নিল, ৩০০ টাকা বাকি"'
                className="w-full border-none bg-transparent p-0 text-xs text-stone-800 placeholder:italic placeholder:text-stone-500 focus:outline-none focus:ring-0 sm:text-sm"
              />
              <button
                type="button"
                onClick={handleQuickSave}
                className="ml-2 shrink-0 rounded bg-forest-900 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-forest-800 active:scale-95"
              >
                যাচাই ও সেভ করুন
              </button>
            </div>
          </div>

          {/* Customer Ledger Entries Table */}
          <div className="overflow-x-auto p-5 sm:p-7">
            <div className="min-w-[580px]">
              <div className="grid grid-cols-12 border-b border-stone-200 pb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                <div className="col-span-4">গ্রাহকের নাম</div>
                <div className="col-span-3">স্ট্যাটাস</div>
                <div className="col-span-2 text-right">বাকি পরিমাণ</div>
                <div className="col-span-3 text-right">তাগাদা বা অ্যাকশন</div>
              </div>

              {deskPreviewData.entries.map((entry, index) => {
                const isOverdue = entry.statusType === "overdue";
                const isRolling = entry.statusType === "rolling";
                const isSettled = entry.statusType === "settled";

                return (
                  <div
                    key={entry.id}
                    className={`grid grid-cols-12 items-center py-3.5 text-sm transition-colors hover:bg-stone-50/70 ${
                      index !== deskPreviewData.entries.length - 1
                        ? "border-b border-stone-200/70"
                        : ""
                    }`}
                  >
                    <div className="col-span-4 flex items-center gap-2 font-semibold text-stone-900">
                      <span>{entry.name}</span>
                      <span className="hidden text-[11px] font-normal text-stone-500 sm:inline">
                        ({entry.phone})
                      </span>
                    </div>

                    <div className="col-span-3">
                      {isOverdue && (
                        <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800">
                          {entry.statusText}
                        </span>
                      )}
                      {isRolling && (
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          {entry.statusText}
                        </span>
                      )}
                      {isSettled && (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                          {entry.statusText}
                        </span>
                      )}
                    </div>

                    <div
                      className={`font-serif-title col-span-2 text-right text-base ${
                        isOverdue
                          ? "font-bold text-rose-700"
                          : isSettled
                          ? "font-semibold text-stone-400"
                          : "font-bold text-stone-900"
                      }`}
                    >
                      {entry.amount}
                    </div>

                    <div className="col-span-3 text-right">
                      {!entry.isSettled ? (
                        <button
                          type="button"
                          onClick={() => openReminderModal(entry.name, entry.amount)}
                          className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-xs transition hover:bg-stone-100 active:scale-95"
                        >
                          <svg
                            className="size-3 text-emerald-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                          </svg>
                          মেসেজ পাঠান
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setNewEntryToast(`${entry.name}-এর সম্পূর্ণ পরিশোধিত হিসাব প্রদর্শিত`);
                            setTimeout(() => setNewEntryToast(null), 3000);
                          }}
                          className="rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-100 active:scale-95"
                        >
                          খাতা দেখুন
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desk Mock Footer Disclaimer */}
          <div className="flex flex-col items-center justify-between gap-1 border-t border-stone-200 bg-stone-100/60 px-5 py-3 text-[11px] text-stone-500 sm:flex-row">
            <span>ডেমো শপ থেকে প্রদর্শিত কাল্পনিক হিসাব</span>
            <span className="font-medium text-forest-900">
              ১০০% আপনার দোকানের জন্য সুরক্ষিত
            </span>
          </div>
        </div>

        {/* Dignified Reminder Draft Modal */}
        {activeMessageCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-card-lift">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h4 className="font-serif-title font-bold text-forest-950 text-base">
                  ভদ্র ও সম্মানজনক তাগাদা ড্রাফট
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveMessageCustomer(null)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              </div>
              <div className="mt-4 rounded-xl bg-[#FAF8F5] p-4 text-xs leading-relaxed text-stone-700 border border-stone-200">
                <p className="font-semibold text-forest-900 mb-1">
                  প্রাপক: {activeMessageCustomer}
                </p>
                <p className="italic text-stone-600">
                  "আসসালামু আলাইকুম। আশা করি ভালো আছেন। রহমান ব্রাদার্স গ্রোসারি
                  থেকে জানাচ্ছি যে আপনার খাতার মোট বকেয়া টাকার পরিমাণ{" "}
                  {activeMessageCustomer.split("(")[1]?.replace(")", "") || "৳ ৬৫০"}।
                  সুবিধাজনক সময়ে পরিশোধ করলে কৃতজ্ঞ থাকব। ধন্যবাদ।"
                </p>
              </div>
              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveMessageCustomer(null)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={copyReminder}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-forest-900 px-4 py-2 text-xs font-semibold text-white hover:bg-forest-800 transition"
                >
                  {copied ? "কপি হয়েছে!" : "মেসেজ কপি করুন"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
