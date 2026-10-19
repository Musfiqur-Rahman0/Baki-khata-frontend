"use client";

import { useState } from "react";
import { Bot, LoaderCircle, Save, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { parseAiTransactions, confirmAiTransactions, type AiDraftTransaction } from "@/features/ai/aiSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

type CustomerOption = { id: string; name: string; phone: string };
type Draft = AiDraftTransaction & { customerId: string };

export function AiEntryPanel({
  customers,
  onCancel,
  onSaved,
}: {
  customers: CustomerOption[];
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const dispatch = useAppDispatch();
  const { parsing, saving } = useAppSelector((state) => state.ai);
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [hasParsed, setHasParsed] = useState(false);

  const parse = async () => {
    if (text.trim().length < 2) {
      toast.error("লেনদেনের বিবরণ লিখুন");
      return;
    }
    try {
      const result = await dispatch(parseAiTransactions(text.trim())).unwrap();
      setDrafts(result.transactions.map((item) => ({
        ...item,
        customerId: item.suggestedCustomerId ?? "",
      })));
      setQuestions(result.questions ?? []);
      setHasParsed(true);
      if (!result.transactions.length) toast.info("AI কোনো নিশ্চিত লেনদেন শনাক্ত করেনি। বিবরণটি আরও পরিষ্কার করে লিখুন।");
    } catch (error) {
      toast.error(typeof error === "string" ? error : error instanceof Error ? error.message : "AI এন্ট্রি বিশ্লেষণ করা যায়নি");
    }
  };

  const updateDraft = (index: number, patch: Partial<Draft>) => {
    setDrafts((current) => current.map((draft, i) => i === index ? { ...draft, ...patch } : draft));
  };

  const save = async () => {
    if (!drafts.length) return;
    if (drafts.some((draft) => !draft.customerId || !Number(draft.amount) || Number(draft.amount) <= 0)) {
      toast.error("প্রতিটি লেনদেনের সঠিক কাস্টমার ও টাকার পরিমাণ নির্বাচন করুন");
      return;
    }
    try {
      const result = await dispatch(confirmAiTransactions(drafts.map((draft) => ({
        customerId: draft.customerId,
        type: draft.type,
        amount: draft.amount,
        note: draft.note ?? null,
        ...(draft.date ? { date: draft.date } : {}),
      })))).unwrap();
      await onSaved();
      toast.success(`${result.savedCount}টি লেনদেন খাতায় সংরক্ষণ হয়েছে`);
      onCancel();
    } catch (error) {
      toast.error(typeof error === "string" ? error : error instanceof Error ? error.message : "লেনদেন সংরক্ষণ করা যায়নি");
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-on-primary"><Bot className="size-5" /></div>
          <div>
            <h2 className="font-bold text-headline-md text-foreground">AI লেনদেন এন্ট্রি</h2>
            <p className="text-label-md text-foreground-muted">বাংলা বা ইংরেজিতে লিখুন, সংরক্ষণের আগে যাচাই করুন</p>
          </div>
        </div>
        <button type="button" onClick={onCancel} aria-label="বন্ধ করুন" className="rounded-full bg-surface-muted p-2 text-foreground-muted hover:text-foreground"><X className="size-4" /></button>
      </div>

      <div className="rounded-2xl bg-background p-3">
        <label htmlFor="ai-transaction-text" className="mb-2 block text-sm font-semibold text-foreground">লেনদেনের বিবরণ</label>
        <textarea
          id="ai-transaction-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          maxLength={4000}
          placeholder="যেমন: রহিমকে ১২০০ টাকার চাল বাকিতে দিলাম, করিম ৫০০ টাকা জমা দিল"
          className="w-full resize-y rounded-2xl border border-border bg-surface p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <button type="button" disabled={parsing} onClick={parse} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-4 py-3 font-semibold text-on-secondary disabled:cursor-not-allowed disabled:opacity-60">
          {parsing ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {parsing ? "AI বিশ্লেষণ করছে..." : "বিবরণ বিশ্লেষণ করুন"}
        </button>
      </div>

      {questions.length > 0 && <div className="rounded-xl border border-rolling-fg/20 bg-rolling-bg p-3 text-sm text-rolling-fg"><p className="mb-1 font-bold">আরও যাচাই প্রয়োজন</p><ul className="list-disc space-y-1 pl-5">{questions.map((question, index) => <li key={`${question}-${index}`}>{question}</li>)}</ul></div>}

      {hasParsed && drafts.map((draft, index) => (
        <div key={`${index}-${draft.customerName}`} className="space-y-3 rounded-2xl border border-border bg-surface p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-foreground">লেনদেন {index + 1}</span>
            <span className="rounded-full bg-surface-muted px-2 py-1 text-xs text-foreground-muted">{draft.confidence != null ? `${Math.round(draft.confidence * 100)}% confidence` : "AI draft"}</span>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground-muted">কাস্টমার</label>
            <select value={draft.customerId} onChange={(event) => updateDraft(index, { customerId: event.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground">
              <option value="">কাস্টমার নির্বাচন করুন</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} — {customer.phone}</option>)}
            </select>
            {draft.customerMatchStatus !== "exact" && <p className="mt-1 text-xs text-tertiary">AI-এর মিলটি নিশ্চিত নয়; সঠিক কাস্টমার বেছে নিন।</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground-muted">লেনদেনের ধরন</label>
              <select value={draft.type} onChange={(event) => updateDraft(index, { type: event.target.value as "CREDIT" | "PAYMENT" })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground">
                <option value="CREDIT">বাকি / ক্রেডিট</option><option value="PAYMENT">জমা / পেমেন্ট</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground-muted">পরিমাণ (৳)</label>
              <input value={draft.amount} onChange={(event) => updateDraft(index, { amount: event.target.value.replace(/[^\d.]/g, "") })} inputMode="decimal" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground-muted">নোট</label>
            <input value={draft.note ?? ""} onChange={(event) => updateDraft(index, { note: event.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground" />
          </div>
          {(draft.needsClarification || draft.clarificationReason) && <p className="text-xs text-tertiary">{draft.clarificationReason || "সংরক্ষণের আগে এই লেনদেনটি যাচাই করুন।"}</p>}
        </div>
      ))}

      {hasParsed && drafts.length > 0 && <button type="button" disabled={saving} onClick={save} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-semibold text-on-primary disabled:opacity-60">
        {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
        {saving ? "সংরক্ষণ হচ্ছে..." : "যাচাই করা লেনদেন সংরক্ষণ করুন"}
      </button>}
    </section>
  );
}
