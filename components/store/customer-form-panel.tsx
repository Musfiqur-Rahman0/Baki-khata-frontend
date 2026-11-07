import { useRef } from "react";
import { toast as sonnerToast } from "sonner";
import { Icon } from "./store-icon";
import type { Customer, FormState, Mode } from "./store-types";
import { fmtDate, fmtInput, listen, parseAmt, todayISO, toBn } from "./store-utils";

type ContactsNavigator = Navigator & {
  contacts?: {
    select: (properties: ("name" | "tel")[], options: { multiple: false }) => Promise<Array<{ name?: string[]; tel?: string[] }>>;
  };
};

export function FormPanel({
  form,
  shopName,
  ownerName,
  isDemo,
  setForm,
  errors,
  target,
  onTab,
  onCancel,
  onSubmit,
  onDraft,
  notify,
}: {
  form: FormState;
  shopName: string;
  ownerName: string;
  isDemo: boolean;
  setForm: (f: FormState) => void;
  errors: Record<string, string>;
  target: Customer | undefined;
  onTab: (m: Mode) => void;
  onCancel: () => void;
  onSubmit: () => void;
  onDraft: () => void;
  notify: (m: string) => void;
}) {
  const isNew = form.mode === "new_customer";
  const isDue = form.mode === "add_due";
  const isPaid = form.mode === "add_paid";
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<FormState>) => setForm({ ...form, ...patch });
  const accent = isPaid ? "text-secondary" : "text-primary";
  const lockProfile = !isNew;

  const field = (hasErr?: string) =>
    `w-full bg-background px-4 py-3 rounded-2xl text-foreground focus:bg-white focus:outline-none focus:ring-2 transition-all disabled:opacity-70 ${hasErr ? "ring-2 ring-error" : "focus:ring-primary"}`;

  const pickContact = async () => {
    const nav = navigator as ContactsNavigator;
    if (nav.contacts?.select) {
      try {
        const [c] = await nav.contacts.select(["name", "tel"], {
          multiple: false,
        });
        if (c)
          set({
            name: c.name?.[0] ?? form.name,
            phone: c.tel?.[0] ?? form.phone,
          });
      } catch {
        /* cancelled */
      }
    } else notify("এই ডিভাইসে ফোনবুক অ্যাক্সেস সমর্থিত নয়। নম্বর হাতে লিখুন।");
  };

  const voiceFard = () =>
    listen(
      (t) => set({ fard: form.fard ? `${form.fard}, ${t}` : t }),
      () =>
        notify(
          "ভয়েস ইনপুট চালু করা যায়নি। মাইক্রোফোনের অনুমতি দিন বা লিখুন।",
        ),
    );

  const previewName = form.name.trim() || "গ্রাহক";

  return (
    <>
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
            <Icon
              name={
                isPaid
                  ? "payments"
                  : isDue
                    ? "remove_circle_outline"
                    : "person_add_alt"
              }
              className="text-[22px]"
            />
          </div>
          <div>
            <h2 className="font-semibold text-headline-md text-foreground font-bold leading-tight">
              {isPaid
                ? "নগদ জমা গ্রহণ"
                : isDue
                  ? "নতুন বাকি হিসাব এন্ট্রি"
                  : "নতুন কাস্টমার ও হিসাব এন্ট্রি"}
            </h2>
            <p className="font-semibold text-label-md text-foreground-muted">
              সরাসরি লেজারে সংরক্ষিত হবে
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 rounded-full bg-surface-muted hover:bg-surface-muted text-foreground-muted text-label-lg font-semibold flex items-center gap-1 transition-colors"
        >
          <span>বাতিল</span>
          <Icon name="close" className="text-[16px]" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1 bg-surface-muted p-1 rounded-full">
        {(
          [
            ["new_customer", "person_add", "নতুন গ্রাহক", "bg-primary"],
            ["add_due", "remove_circle_outline", "বাকি দিলাম", "bg-primary"],
            ["add_paid", "add_circle_outline", "জমা পেলাম", "bg-secondary"],
          ] as const
        ).map(([m, ic, label, on]) => (
          <button
            key={m}
            type="button"
            onClick={() => onTab(m)}
            className={`py-2 rounded-full font-semibold font-bold text-center flex items-center justify-center gap-1 text-label-md transition-all ${
              form.mode === m
                ? `${on} text-white shadow-sm`
                : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
            }`}
          >
            <Icon name={ic} className="text-[16px]" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="f-name"
              className="font-semibold text-label-lg font-bold text-foreground flex items-center gap-1"
            >
              <span>গ্রাহকের পুরো নাম</span>
              <span className="text-error">*</span>
            </label>
            <span className="text-label-md text-secondary font-semibold bg-settled-bg/40 px-2 py-0.5 rounded-full">
              {isNew ? "নতুন গ্রাহক কার্ড তৈরি হচ্ছে" : "বিদ্যমান খাতা"}
            </span>
          </div>
          <input
            id="f-name"
            disabled={lockProfile}
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="যেমন: আব্দুর রহমান"
            className={`${field(errors.name)} font-semibold font-semibold`}
          />
          {errors.name && (
            <p className="text-label-md text-error mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="f-phone"
              className="font-semibold text-label-lg font-bold text-foreground flex items-center gap-1"
            >
              <span>মোবাইল নম্বর (SMS রসিদের জন্য)</span>
              <span className="text-error">*</span>
            </label>
            {isNew && (
              <button
                type="button"
                onClick={pickContact}
                className="text-label-md text-primary font-bold hover:underline flex items-center gap-0.5"
              >
                <Icon name="contacts" className="text-[14px]" />
                <span>ফোনবুক থেকে খুঁজুন</span>
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-3 bg-surface-muted rounded-2xl font-mono text-foreground-muted font-bold text-body-md flex items-center">
              +৮৮০
            </div>
            <input
              id="f-phone"
              type="tel"
              inputMode="numeric"
              maxLength={14}
              disabled={lockProfile}
              value={form.phone}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder="০১XXXXXXXXX"
              className={`${field(errors.phone)} flex-1 font-mono font-bold`}
            />
          </div>
          {errors.phone && (
            <p className="text-label-md text-error mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="f-addr"
              className="font-semibold text-label-lg font-bold text-foreground block mb-1"
            >
              ঠিকানা / এলাকা
            </label>
            <input
              id="f-addr"
              disabled={lockProfile}
              value={form.address}
              onChange={(e) => set({ address: e.target.value })}
              placeholder="যেমন: ধানমন্ডি ৭/এ"
              className={`${field()} !py-2.5 !px-3 font-semibold`}
            />
          </div>
          <div>
            <label
              htmlFor="f-limit"
              className="font-semibold text-label-lg font-bold text-foreground block mb-1"
            >
              অনুমোদিত বাকি সীমা
            </label>
            <input
              id="f-limit"
              disabled={isPaid}
              inputMode="numeric"
              value={form.limit ? `৳ ${form.limit}` : ""}
              onChange={(e) => set({ limit: fmtInput(e.target.value) })}
              className={`${field(errors.limit)} !py-2.5 !px-3 font-semibold font-bold text-primary`}
            />
            {errors.limit && (
              <p className="text-label-md text-error mt-1">{errors.limit}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-background p-4 rounded-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-title-lg font-bold text-foreground flex items-center gap-1">
            <Icon name="receipt_long" className={`${accent} text-[20px]`} />
            <span>
              {isPaid
                ? "জমা বিবরণ / ভাউচার"
                : isDue
                  ? "বাকি মালের এন্ট্রি"
                  : "প্রারম্ভিক হিসাব / লেনদেন"}
            </span>
          </span>
          <span className="font-semibold text-label-md text-foreground-muted">
            তারিখ: {fmtDate(todayISO())}
          </span>
        </div>

        <div>
          <label
            htmlFor="f-amount"
            className="font-semibold text-label-md uppercase tracking-wider text-foreground-muted font-bold block mb-1"
          >
            {isPaid ? "নগদ জমার টাকার পরিমাণ" : "বাকি মালের টাকার পরিমাণ"}
          </label>
          <div
            className={`relative bg-surface p-3 rounded-2xl shadow-inner flex items-center justify-between ${errors.amount ? "ring-2 ring-error" : ""}`}
          >
            <span className={`font-semibold ${accent} font-bold`}>৳</span>
            <input
              id="f-amount"
              inputMode="numeric"
              placeholder="০"
              value={form.amount}
              onChange={(e) => set({ amount: fmtInput(e.target.value) })}
              className={`w-full bg-transparent text-right font-display-lg text-display-lg ${accent} font-bold focus:outline-none tracking-tight`}
            />
          </div>
          {errors.amount && (
            <p className="text-label-md text-error mt-1">{errors.amount}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {[100, 500, 1000, 2000, 5000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() =>
                  set({
                    amount: toBn(
                      (parseAmt(form.amount) + v).toLocaleString("en-US"),
                    ),
                  })
                }
                className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
                  v === 1000
                    ? "bg-due-bg text-primary font-bold shadow-sm"
                    : "bg-surface-muted hover:bg-surface-muted text-foreground font-semibold"
                }`}
              >
                +৳ {toBn(v.toLocaleString("en-US"))}
              </button>
            ))}
            {isPaid && target && target.totalDue > 0 && (
              <button
                type="button"
                onClick={() =>
                  set({ amount: toBn(target.totalDue.toLocaleString("en-US")) })
                }
                className="px-2.5 py-1 rounded-full bg-settled-bg text-secondary font-semibold font-bold"
              >
                সম্পূর্ণ বকেয়া
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="f-fard"
              className="font-semibold text-label-lg font-bold text-foreground"
            >
              পণ্যের বিবরণ / ফর্দ
            </label>
            <button
              type="button"
              onClick={voiceFard}
              className="text-label-md text-primary flex items-center gap-1 hover:underline font-semibold"
            >
              <Icon name="mic" className="text-[14px]" />
              <span>মুখে বলুন</span>
            </button>
          </div>
          <textarea
            id="f-fard"
            rows={2}
            value={form.fard}
            onChange={(e) => set({ fard: e.target.value })}
            placeholder="যেমন: ২ বস্তা মিনিকেট চাল, ৫ লিটার সয়াবিন তেল..."
            className="w-full bg-surface p-3 rounded-2xl font-semibold text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              set({ memoName: f.name });
              notify("মেমোর ছবি সংযুক্ত হয়েছে");
            }
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="p-2.5 rounded-2xl bg-surface flex items-center justify-between text-label-md text-foreground-muted hover:bg-surface-muted transition-colors text-left"
        >
          <span className="flex items-center gap-2 min-w-0">
            <Icon
              name="add_a_photo"
              className="text-foreground-muted text-[20px]"
            />
            <span
              className={`truncate ${form.memoName ? "text-secondary font-bold" : ""}`}
            >
              {form.memoName
                ? `${form.memoName} সংযুক্ত হয়েছে ✓`
                : "চালান বা মেমোর ছবি তুলুন / আপলোড করুন (ঐচ্ছিক)"}
            </span>
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-muted font-mono text-label-md">
            ক্যামেরা
          </span>
        </button>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#f2f8f4] flex items-start gap-2.5">
        <input
          id="f-sms"
          type="checkbox"
          checked={isDemo ? false : form.sendSms}
          disabled={isDemo}
          onChange={(e) => set({ sendSms: e.target.checked })}
          className="mt-1 w-4 h-4 rounded accent-secondary"
        />
        <label
          htmlFor="f-sms"
          className="cursor-pointer"
          onClick={() => {
            if (isDemo) {
              sonnerToast.info("ডেমো মোডে কোনো বার্তা পাঠানো হয় না।");
            }
          }}
        >
          <span className="font-semibold text-label-lg font-bold text-secondary block leading-snug">
            কাস্টমারের মোবাইলে ফ্রি এসএমএস ও হোয়াটসঅ্যাপ রসিদ পাঠান
          </span>
          <span className="font-semibold text-label-md text-foreground-muted block mt-0.5">
            {isDemo
              ? "ডেমো মোডে SMS ও WhatsApp পাঠানো বন্ধ রাখা হয়েছে।"
              : `অটোমেটিক বার্তা যাবে: “আসসালামু আলাইকুম ${previewName} ভাই, ${shopName}তে আপনার খতিয়ান সংরক্ষিত হয়েছে। পরিমাণ: ৳ ${form.amount || "০"}। ধন্যবাদ! - ${ownerName}”`}
          </span>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
        <button
          type="button"
          onClick={onSubmit}
          className="w-full sm:flex-1 py-3.5 px-3 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-semibold shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Icon name="save" className="text-[20px]" />
          <span>
            {isDemo ? "ডেমো খাতায় যোগ করুন" : "খাতায় যোগ করুন ও রসিদ পাঠান"}
          </span>
          <Icon name="arrow_forward" className="text-[18px]" />
        </button>
        <button
          type="button"
          onClick={onDraft}
          className="w-full sm:w-auto px-3 py-3.5 rounded-full bg-surface-muted hover:bg-surface-muted text-foreground font-semibold font-semibold transition-colors"
        >
          খসড়া রাখুন
        </button>
      </div>
    </>
  );
}
