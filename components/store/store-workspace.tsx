import type { RefObject } from "react";

import { DetailsPanel } from "./customer-details-panel";
import { FormPanel } from "./customer-form-panel";
import { Icon } from "./store-icon";
import { AiEntryPanel } from "@/features/ai/components/ai-entry-panel";
import type { Customer, Filter, FormState, Mode, View } from "./store-types";
import {
  dueText,
  initialOf,
  money,
  statusOf,
  toBn,
  TONES,
} from "./store-utils";
import { CustomerCard } from "./customer-card";

type FilterChip = { id: Filter; label: string; cls: string };
type Action = "sms" | "pay" | "statement" | "add-due";

type StoreWorkspaceProps = {
  filtered: Customer[];
  selectedId: string;
  view: View;
  setSelectedId: (id: string) => void;
  setView: (view: View) => void;
  query: string;
  setQuery: (query: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  chips: FilterChip[];
  filter: Filter;
  setFilter: (filter: Filter) => void;
  customers: Customer[];
  isDemo: boolean;
  loaded: boolean;
  shopName: string;
  ownerName: string;
  selected?: Customer;
  form: FormState;
  setForm: (form: FormState) => void;
  errors: Record<string, string>;
  isOnline: boolean;
  flash: boolean;
  onOpenForm: (mode: Mode, customer?: Customer) => void;
  onRowAction: (action: Action, customer: Customer) => void;
  onTab: (mode: Mode) => void;
  onCancel: () => void;
  onSubmit: () => void;
  onDraft: () => void;
  notify: (message: string) => void;
  onAiSaved: () => Promise<void>;
};
export function StoreWorkspace({
  filtered,
  selectedId,
  view,
  setSelectedId,
  setView,
  query,
  setQuery,
  searchRef,
  chips,
  filter,
  setFilter,
  customers,
  isDemo,
  loaded,
  shopName,
  ownerName,
  selected,
  form,
  setForm,
  errors,
  isOnline,
  flash,
  onOpenForm,
  onRowAction,
  onTab,
  onCancel,
  onSubmit,
  onDraft,
  notify,
  onAiSaved,
}: StoreWorkspaceProps) {
  const openForm = onOpenForm;
  const rowAction = onRowAction;
  const switchTab = onTab;
  const submit = onSubmit;
  const saveDraft = onDraft;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* LEFT */}
      <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-3">
        <div className="w-full bg-surface p-3 rounded-2xl shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon name="search" className="text-foreground-muted text-[22px]" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="কাস্টমার নাম, মোবাইল বা পণ্যের নাম দিয়ে খুঁজুন..."
              className="w-full bg-transparent font-semibold text-foreground placeholder:text-foreground-muted focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
              className="px-3 py-1.5 rounded-full bg-surface-muted hover:bg-surface-hover text-foreground font-semibold font-semibold text-label-md transition-colors"
            >
              রিসেট
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-label-lg">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 transition-all whitespace-nowrap ${
                filter === c.id
                  ? "bg-primary text-on-primary shadow-sm"
                  : `bg-surface hover:bg-surface-muted ${c.cls || "text-foreground-muted"}`
              }`}
            >
              {c.id === "urgent" && filter !== "urgent" && (
                <span className="w-2 h-2 rounded-full bg-tertiary" />
              )}
              <span>{c.label}</span>
              {c.id === "all" && (
                <span className="px-1.5 bg-white/20 rounded-full text-label-md">
                  {toBn(customers.length)}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="w-full bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-background px-3 py-2 flex items-center justify-between text-label-md uppercase tracking-wider text-foreground-muted font-bold">
            <span className="w-5/12">কাস্টমারের তথ্য ও ঠিকানা</span>
            <span className="w-3/12 text-right">বাকি স্থিতি (Due)</span>
            <span className="w-4/12 text-right">দ্রুত অ্যাকশন</span>
          </div>

          <div className="divide-y divide-border">
            {filtered.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-foreground-muted">
                <Icon
                  name="person_search"
                  className="text-4xl text-foreground-muted mb-2"
                />
                <p className="font-semibold font-bold">
                  {!isDemo && !loaded
                    ? "কাস্টমার লোড হচ্ছে..."
                    : "কোনো কাস্টমার পাওয়া যায়নি"}
                </p>
                <p className="text-label-md mt-1">
                  {!isDemo && !loaded
                    ? "সার্ভার থেকে আপনার খাতা আনা হচ্ছে"
                    : "অনুসন্ধান বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন"}
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                  className="mt-3 px-4 py-1.5 rounded-full bg-surface-muted hover:bg-surface-muted text-primary font-semibold text-label-md transition-all"
                >
                  ফিল্টার ক্লিয়ার করুন
                </button>
              </div>
            ) : (
              filtered.map((c) => (
                <CustomerCard
                  key={c.id}
                  customer={c}
                  initial={initialOf(c.name)}
                  amount={money(c.totalDue)}
                  dueLabel={dueText(c)}
                  status={statusOf(c)}
                  tone={TONES[c.tone % 4]}
                  selected={c.id === selectedId && view === "details"}
                  isDemo={isDemo}
                  onSelect={() => {
                    setSelectedId(c.id);
                    setView("details");
                  }}
                  onAction={(action) => rowAction(action, c)}
                />
              ))
            )}
          </div>

          <div className="p-3 bg-background flex items-center justify-between text-label-md text-foreground-muted">
            <span>
              মোট {toBn(customers.length)} জন কাস্টমারের মধ্যে{" "}
              {toBn(filtered.length)} জন দৃশ্যমান
            </span>
            <button
              onClick={() => openForm("new_customer")}
              className="text-primary font-bold hover:underline flex items-center gap-1"
            >
              <span>+ নতুন খাতা তৈরি করুন</span>
              <Icon name="arrow_forward" className="text-[16px]" />
            </button>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-surface shadow-sm flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-settled-bg text-secondary flex items-center justify-center flex-shrink-0">
            <Icon name="lightbulb" className="text-[20px]" />
          </div>
          <div>
            <h5 className="font-semibold text-title-lg font-bold text-foreground">
              কাস্টমারকে তাৎক্ষণিক ফ্রি SMS পাঠান
            </h5>
            <p className="font-semibold text-body-md text-foreground-muted mt-0.5">
              প্রতিটি বাকি বা জমার পর আপনার দোকান ‘{shopName}’ এর নামসহ ফ্রি
              মেসেজ চলে যায়। এতে কাস্টমার হিসাব নিয়ে স্বচ্ছ থাকে ও দ্রুত টাকা
              আদায় হয়।
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="lg:col-span-6 xl:col-span-5 bg-surface rounded-2xl shadow-xl p-5 sm:p-6 flex flex-col gap-3 transition-all duration-300">
        {view === "ai" && !isDemo ? (
          <AiEntryPanel
            customers={customers.map((customer) => ({
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
            }))}
            onCancel={() => setView("details")}
            onSaved={onAiSaved}
          />
        ) : view === "form" ? (
          <FormPanel
            form={form}
            shopName={shopName}
            ownerName={ownerName}
            isDemo={isDemo}
            setForm={setForm}
            errors={errors}
            target={selected}
            onTab={switchTab}
            onCancel={onCancel}
            onSubmit={submit}
            onDraft={saveDraft}
            notify={notify}
          />
        ) : selected ? (
          <DetailsPanel
            cust={selected}
            shopName={shopName}
            ownerName={ownerName}
            isDemo={isDemo}
            isOnline={isOnline}
            flash={flash}
            onOpenForm={openForm}
            notify={notify}
          />
        ) : (
          <div className="py-16 text-center text-foreground-muted">
            <Icon
              name="person_add"
              className="text-5xl text-foreground-muted mb-2"
            />
            <p className="font-semibold font-bold">কোনো গ্রাহক নেই</p>
            <button
              onClick={() => openForm("new_customer")}
              className="mt-3 px-5 py-2 rounded-full bg-primary text-on-primary font-semibold font-bold"
            >
              প্রথম খাতা খুলুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
