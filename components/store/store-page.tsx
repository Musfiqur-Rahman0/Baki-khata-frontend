"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast as sonnerToast } from "sonner";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Camera,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  CloudCog,
  ContactRound,
  Download,
  Headphones,
  Lightbulb,
  MapPin,
  MessageCircle,
  Mic,
  Phone,
  PlusCircle,
  Printer,
  ReceiptText,
  CircleMinus,
  Save,
  Search,
  Send,
  ShieldCheck,
  Store,
  TrendingUp,
  UserPlus,
  UserRound,
  UsersRound,
  WifiOff,
  X,
  type LucideIcon,
} from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { AccountMenu } from "@/components/account-menu";
import { BUSINESS_TYPE_LABELS } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchAllCustomers,
  createCustomerRecord,
  fetchCustomerLedger,
  type CustomerWithBalance,
} from "@/features/customers/customerSlice";
import {
  fetchAllTransactions,
  createTransactionRecord,
  type ApiTransaction,
} from "@/features/transactions/transactionSlice";
import { AiEntryPanel } from "@/features/ai/components/ai-entry-panel";

/* ================================================================== */
/* Types                                                               */
/* ================================================================== */

type TxType = "due" | "paid";
type Tx = {
  id: string;
  date: string;
  type: TxType;
  desc: string;
  amount: number;
};
type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  creditLimit: number;
  totalDue: number;
  totalCredit?: number;
  totalPaid?: number;
  dueSince: string | null; // ISO date of when the current balance started
  tone: number;
  notes: string;
  history: Tx[];
};
type Filter = "all" | "due" | "urgent" | "paid";
type Mode = "new_customer" | "add_due" | "add_paid";
type View = "details" | "form" | "ai";
type FormState = {
  mode: Mode;
  name: string;
  phone: string;
  address: string;
  limit: string;
  amount: string;
  fard: string;
  sendSms: boolean;
  memoName: string;
};

const DEMO_STORAGE_KEY = "bakhi-khata:demo-customers:v1";
const DRAFT_KEY = "bakhi-khata:draft:v1";
const DEMO_DRAFT_KEY = "bakhi-khata:demo-draft:v1";
const URGENT_DAYS = 15;

const TONES = [
  { bg: "bg-due-bg", text: "text-primary" },
  { bg: "bg-settled-bg", text: "text-secondary" },
  { bg: "bg-surface-muted", text: "text-foreground" },
  { bg: "bg-rolling-bg", text: "text-tertiary" },
];

/* ================================================================== */
/* Helpers                                                             */
/* ================================================================== */

const BN = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBn = (n: number | string) => String(n).replace(/\d/g, (d) => BN[+d]);
const toEn = (s: string) =>
  String(s).replace(/[০-৯]/g, (d) => String(BN.indexOf(d)));
const money = (n: number) =>
  "৳ " + toBn((Number(n) || 0).toLocaleString("en-US"));
const parseAmt = (s: string) => parseInt(toEn(s).replace(/\D/g, "") || "0", 10);
const fmtInput = (s: string) => {
  const n = parseAmt(s);
  return n ? toBn(n.toLocaleString("en-US")) : "";
};

const localISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayISO = () => localISO(new Date());
const daysAgoISO = (n: number) => localISO(new Date(Date.now() - n * 86400000));
const daysSince = (iso: string | null) => {
  if (!iso) return 0;
  const a = new Date(iso + "T00:00:00").getTime();
  const b = new Date(todayISO() + "T00:00:00").getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
};
const fmtDate = (iso: string) => {
  const s = new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso + "T00:00:00"));
  return iso === todayISO() ? `আজ, ${s}` : s;
};

const statusOf = (c: Customer): "paid" | "due" | "urgent" =>
  c.totalDue <= 0
    ? "paid"
    : daysSince(c.dueSince) > URGENT_DAYS
      ? "urgent"
      : "due";

const dueText = (c: Customer) => {
  if (c.totalDue <= 0) return "সম্পূর্ণ পরিশোধিত";
  const d = daysSince(c.dueSince);
  if (d === 0) return "আজকে বাকি যোগ";
  return d > URGENT_DAYS
    ? `${toBn(d)} দিন বাকি (অতিজরুরি)`
    : `${toBn(d)} দিন বাকি`;
};

const initialOf = (name: string) => {
  const t = name.trim();
  if (!t) return "?";
  try {
    const seg = new Intl.Segmenter("bn", { granularity: "grapheme" });
    return Array.from(seg.segment(t))[0].segment;
  } catch {
    return t.charAt(0);
  }
};

const formatPhone = (raw: string) => {
  const d = toEn(raw).replace(/\D/g, "");
  return d.length === 11 ? toBn(`${d.slice(0, 4)}-${d.slice(4)}`) : raw;
};
const validPhone = (raw: string) =>
  /^01\d{9}$/.test(toEn(raw).replace(/\D/g, ""));
const intlPhone = (raw: string) => {
  const d = toEn(raw).replace(/\D/g, "");
  return d.startsWith("0") ? "88" + d : d;
};

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

const reminderText = (c: Customer, shopName: string, ownerName: string) =>
  `আসসালামু আলাইকুম ${c.name} ভাই, ${shopName}তে আপনার খতিয়ানের বর্তমান মোট বকেয়া ${money(
    c.totalDue,
  )}। অনুগ্রহপূর্বক নিকটস্থ সুবিধাজনক সময়ে হিসাবটি সমন্বয় করার অনুরোধ জানাচ্ছি। ধন্যবাদ! - ${ownerName}`;

type SpeechRecognitionLike = {
  lang: string;
  onresult:
    | ((event: {
        results: {
          [index: number]: { [index: number]: { transcript: string } };
        };
      }) => void)
    | null;
  onerror: (() => void) | null;
  start: () => void;
};

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

function listen(onResult: (t: string) => void, onFail: () => void) {
  const speechWindow = window as SpeechRecognitionWindow;
  const Recognition =
    speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
  if (!Recognition) return onFail();
  const recognition = new Recognition();
  recognition.lang = "bn-BD";
  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript;
    if (transcript) onResult(transcript);
  };
  recognition.onerror = onFail;
  recognition.start();
}

function makeSeed(): Customer[] {
  const t = (
    n: number,
    type: TxType,
    desc: string,
    amount: number,
    i: number,
  ): Tx => ({
    id: `seed-${i}-${n}`,
    date: daysAgoISO(n),
    type,
    desc,
    amount,
  });
  return [
    {
      id: "CUST-001",
      name: "আলমগীর হোসেন",
      phone: "০১৭১১-৮৯৩২২১",
      address: "বাসা # ১২, রোড # ৪, ধানমন্ডি",
      creditLimit: 5000,
      totalDue: 3400,
      dueSince: daysAgoISO(10),
      tone: 0,
      notes: "নিয়মিত কাস্টমার, সাধারণত মাসের শুরুতে বিল দেন।",
      history: [
        t(3, "due", "মিনিকেট চাল ২৫ কেজি, চিনি ৩ কেজি", 2100, 1),
        t(10, "due", "তীর সয়াবিন তেল ৫ লিটার, ডাল", 1300, 1),
        t(15, "paid", "বিকাশ পে - সম্পূর্ণ পরিশোধ", 4500, 1),
      ],
    },
    {
      id: "CUST-002",
      name: "বাবুল মিয়া",
      phone: "০১৮১৯-৪৫৫১১২",
      address: "কাঁচাবাজার গলি, চায়ের দোকানদার",
      creditLimit: 3000,
      totalDue: 1750,
      dueSince: daysAgoISO(2),
      tone: 1,
      notes: "প্রতি বিকেলে দোকান থেকে দুধ ও চিনি নেন, ৩ দিন পর পর শোধ করেন।",
      history: [
        t(0, "due", "ডানো দুধ গুঁড়ো ১ কেজি, চিনি ৫ কেজি", 1250, 2),
        t(2, "due", "ইস্পাহানি চা পাতা ৫০০ গ্রাম", 500, 2),
        t(5, "paid", "নগদ ক্যাশ জমা", 2000, 2),
      ],
    },
    {
      id: "CUST-003",
      name: "শফিকুল ইসলাম",
      phone: "০১৭২২-০৯১৮২৭",
      address: "ফ্ল্যাট ৩/বি, বাসা # ২৮, ধানমন্ডি",
      creditLimit: 10000,
      totalDue: 0,
      dueSince: null,
      tone: 2,
      notes: "ভেরিফায়েড গ্রাহক, অ্যাকাউন্ট সবসময় আপডেট রাখেন।",
      history: [
        t(0, "paid", "সিটি ব্যাংক কার্ড পেমেন্ট", 4800, 3),
        t(7, "due", "মাসিক মুদি বাজার সামগ্রী", 4800, 3),
      ],
    },
    {
      id: "CUST-004",
      name: "মাওলানা মোবারক",
      phone: "০১৯১১-২২৩৩৪৪",
      address: "বায়তুল আমান মসজিদ সংলগ্ন কোয়ার্টার",
      creditLimit: 8000,
      totalDue: 7700,
      dueSince: daysAgoISO(20),
      tone: 3,
      notes:
        "মসজিদ ফান্ড থেকে অনুমোদনের অপেক্ষায় রয়েছে, দ্রুত ফোন দিয়ে স্মরণ করিয়ে দিন।",
      history: [
        t(16, "due", "মসজিদ অনুষ্ঠান সামগ্রী ও মিলাদ তবারক", 5200, 4),
        t(20, "due", "তেল, চাল ও ময়দা বস্তা", 2500, 4),
      ],
    },
  ];
}

function mapApiCustomers(
  records: CustomerWithBalance[],
  transactions: ApiTransaction[],
): Customer[] {
  const byCustomer = new Map<string, Tx[]>();
  for (const transaction of transactions) {
    const list = byCustomer.get(transaction.customerId) ?? [];
    list.push({
      id: transaction.id,
      date: String(transaction.date).slice(0, 10),
      type: transaction.type === "CREDIT" ? "due" : "paid",
      desc:
        transaction.note?.trim() ||
        (transaction.type === "CREDIT" ? "বাকি লেনদেন" : "নগদ জমা"),
      amount: Number(transaction.amount) || 0,
    });
    byCustomer.set(transaction.customerId, list);
  }
  return records.map(({ customer, balance }, index) => {
    const history = (byCustomer.get(customer.id) ?? []).sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    const totalDue = Number(balance.due) || 0;
    const creditTotal = Number(balance.creditTotal) || 0;
    const oldestUnpaidCredit = [...history]
      .filter((item) => item.type === "due")
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    return {
      id: customer.id,
      name: customer.name,
      phone: formatPhone(customer.phone.replace(/^\+880/, "0")),
      address: customer.address || "ঠিকানা দেওয়া হয়নি",
      creditLimit: Math.max(creditTotal, 5000),
      totalDue,
      totalCredit: Number(balance.creditTotal) || 0,
      totalPaid: Number(balance.paymentTotal) || 0,
      dueSince: totalDue > 0 ? (oldestUnpaidCredit?.date ?? null) : null,
      tone: index % 4,
      notes: customer.note || "",
      history,
    };
  });
}

const emptyForm = (mode: Mode = "new_customer"): FormState => ({
  mode,
  name: "",
  phone: "",
  address: "",
  limit: "৫,০০০",
  amount: "",
  fard: "",
  sendSms: true,
  memoName: "",
});

const ICONS: Record<string, LucideIcon> = {
  add_a_photo: Camera,
  add_circle: PlusCircle,
  arrow_forward: ArrowRight,
  arrow_upward: ArrowUpRight,
  call: Phone,
  call_received: ArrowDownLeft,
  chat: MessageCircle,
  check_circle: CheckCircle2,
  close: X,
  cloud_sync: CloudCog,
  contacts: ContactRound,
  download: Download,
  edit_calendar: PlusCircle,
  expand_more: ChevronDown,
  group: UsersRound,
  history_edu: ReceiptText,
  lightbulb: Lightbulb,
  location_on: MapPin,
  menu_book: ReceiptText,
  mic: Mic,
  notifications_active: BadgeCheck,
  payments: Banknote,
  person: UserRound,
  person_add: UserPlus,
  person_add_alt: UserPlus,
  person_search: UsersRound,
  remove_circle_outline: CircleMinus,
  add_circle_outline: PlusCircle,
  print: Printer,
  receipt_long: ReceiptText,
  save: Save,
  search: Search,
  send: Send,
  sms: MessageCircle,
  storefront: Store,
  support_agent: Headphones,
  trending_up: TrendingUp,
  verified: BadgeCheck,
  verified_user: ShieldCheck,
  wifi_off: WifiOff,
};

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const IconComponent = ICONS[name] ?? CircleHelp;
  const size = className.match(/text-\[(\d+)px\]/)?.[1] ?? "20";
  const iconClassName = className
    .replace(/text-\[\d+px\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <IconComponent
      aria-hidden="true"
      className={`inline-block shrink-0 align-middle ${iconClassName}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

/* ================================================================== */
/* Right panel: customer details                                       */
/* ================================================================== */

function DetailsPanel({
  cust,
  shopName,
  ownerName,
  isDemo,
  flash,
  onOpenForm,
  notify,
}: {
  cust: Customer;
  shopName: string;
  ownerName: string;
  isDemo: boolean;
  flash: boolean;
  onOpenForm: (mode: Mode, c?: Customer) => void;
  notify: (m: string) => void;
}) {
  const pct =
    cust.creditLimit > 0
      ? Math.min(100, Math.round((cust.totalDue / cust.creditLimit) * 100))
      : 0;
  const msg = reminderText(cust, shopName, ownerName);

  const printReceipt = () => {
    const w = window.open("", "_blank", "width=420,height=640");
    if (!w) return notify("পপ-আপ ব্লক করা আছে। অনুমতি দিয়ে আবার চেষ্টা করুন।");
    const rows = cust.history
      .slice(0, 8)
      .map(
        (h) =>
          `<tr><td>${esc(fmtDate(h.date))}</td><td>${esc(h.desc)}</td><td style="text-align:right">${
            h.type === "due" ? "+" : "-"
          }${esc(money(h.amount))}</td></tr>`,
      )
      .join("");
    w.document
      .write(`<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>রসিদ</title>
      <style>body{font-family:sans-serif;padding:20px;color:#1c1c19}h2{margin:0}table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}
      td{padding:6px 0;border-bottom:1px dashed #ccc}.tot{font-size:20px;font-weight:700;margin-top:16px}</style></head><body>
      <h2>${esc(shopName)}</h2><p>মালিক: ${esc(ownerName)}<br>গ্রাহক: <b>${esc(cust.name)}</b><br>মোবাইল: ${esc(cust.phone)}<br>তারিখ: ${esc(fmtDate(todayISO()))}</p>
      <table>${rows}</table><div class="tot">মোট বাকি: ${esc(money(cust.totalDue))}</div>
      <script>window.onload=()=>window.print()<\/script></body></html>`);
    w.document.close();
  };

  const sendWhatsapp = () => {
    if (isDemo) {
      sonnerToast.info("ডেমো মোডে কোনো বার্তা পাঠানো হয় না।");
      return;
    }
    window.open(
      `https://wa.me/${intlPhone(cust.phone)}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener",
    );
    notify("হোয়াটসঅ্যাপ খোলা হয়েছে");
  };
  return (
    <>
      <div className="flex items-start justify-between pb-1 border-b border-border">
        <div className="flex  gap-2">
          <div
            className={`w-12 h-12 aspect-square  rounded-full ${TONES[cust.tone % 4].bg} ${TONES[cust.tone % 4].text} flex items-center justify-center justify-center font-bold text-headline-md shadow-sm leading-1`}
          >
            {initialOf(cust.name)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold text-headline-md text-foreground font-bold leading-tight">
                {cust.name}
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full font-semibold font-bold ${cust.totalDue > 0 ? "bg-due-bg text-primary" : "bg-settled-bg text-secondary"}`}
              >
                {cust.totalDue > 0 ? dueText(cust) : "পরিশোধিত"}
              </span>
            </div>
            <p className="font-semibold text-label-md text-foreground-muted flex items-center gap-1 mt-0.5 flex-wrap">
              <Icon name="call" className="text-[15px]" />
              <span className="font-mono font-semibold">{cust.phone}</span>
              <span className="text-foreground-muted">•</span>
              <Icon name="location_on" className="text-[15px]" />
              <span className="truncate max-w-[200px]">{cust.address}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => onOpenForm("add_due", cust)}
          className="px-3 py-1.5 rounded-full bg-primary hover:bg-primary-hover text-white text-label-md font-bold flex items-center gap-1 shadow-sm transition-all shrink-0"
        >
          <Icon name="edit_calendar" className="text-[16px]" />
          <span>+ নতুন হিসাব</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-background p-3.5 rounded-2xl">
        <div className="bg-surface p-3 rounded-2xl flex flex-col justify-between">
          <span className="font-semibold text-label-md text-foreground-muted font-bold">
            মোট বর্তমান বাকি
          </span>
          <div className="mt-1">
            <span
              className={`font-semibold text-headline-lg font-extrabold block leading-none ${cust.totalDue > 0 ? "text-primary" : "text-secondary"}`}
            >
              {money(cust.totalDue)}
            </span>
            <span className="text-label-md text-foreground-muted mt-1 block">
              ক্রেডিট সীমা: {money(cust.creditLimit)}
            </span>
          </div>
        </div>
        <div className="bg-surface p-3 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between font-semibold text-label-md font-bold text-foreground-muted">
            <span>সীমা ব্যবহার</span>
            <span
              className={pct > 80 ? "text-error font-bold" : "text-secondary"}
            >
              {toBn(pct)}%
            </span>
          </div>
          <div className="mt-2 w-full bg-surface-muted rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${pct > 80 ? "bg-error" : pct > 50 ? "bg-tertiary" : "bg-secondary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-label-md text-foreground-muted mt-1.5 block">
            অবশিষ্ট বাকি সীমা:{" "}
            {money(Math.max(0, cust.creditLimit - cust.totalDue))}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-border bg-background p-3">
          <span className="block text-label-md font-semibold text-foreground-muted">
            মোট ক্রেডিট / বাকি দেওয়া
          </span>
          <strong className="mt-1 block font-mono text-title-lg text-primary">
            {money(
              cust.totalCredit ??
                cust.history
                  .filter((item) => item.type === "due")
                  .reduce((sum, item) => sum + item.amount, 0),
            )}
          </strong>
        </div>
        <div className="rounded-2xl border border-border bg-background p-3">
          <span className="block text-label-md font-semibold text-foreground-muted">
            মোট জমা / পেমেন্ট
          </span>
          <strong className="mt-1 block font-mono text-title-lg text-secondary">
            {money(
              cust.totalPaid ??
                cust.history
                  .filter((item) => item.type === "paid")
                  .reduce((sum, item) => sum + item.amount, 0),
            )}
          </strong>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onOpenForm("add_due", cust)}
          className="py-2.5 px-2 rounded-2xl bg-due-bg/40 hover:bg-due-bg text-primary font-bold text-label-md flex flex-col items-center justify-center gap-1 transition-all"
        >
          <Icon name="add_circle" className="text-[18px]" />
          <span>+ বাকি মাল দিন</span>
        </button>
        <button
          onClick={() => onOpenForm("add_paid", cust)}
          className="py-2.5 px-2 rounded-2xl bg-settled-bg/60 hover:bg-settled-bg text-secondary font-bold text-label-md flex flex-col items-center justify-center gap-1 transition-all"
        >
          <Icon name="payments" className="text-[18px]" />
          <span>+ নগদ জমা নিন</span>
        </button>
        <button
          onClick={printReceipt}
          className="py-2.5 px-2 rounded-2xl bg-surface-muted hover:bg-surface-muted text-foreground font-bold text-label-md flex flex-col items-center justify-center gap-1 transition-all"
        >
          <Icon name="print" className="text-[18px]" />
          <span>রসিদ প্রিন্ট</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-title-lg font-bold text-foreground flex items-center gap-1.5">
            <Icon name="history_edu" className="text-secondary text-[20px]" />
            <span>সাম্প্রতিক ফর্দ ও লেনদেন বিবরণী</span>
          </h4>
          <span className="font-semibold text-foreground-muted">
            {toBn(cust.history.length)} টি এন্ট্রি
          </span>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {cust.history.map((h) => (
            <div
              key={h.id}
              className="p-2.5 rounded-2xl border border-border bg-background flex items-center justify-between hover:bg-white transition-all"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <Icon
                  name={h.type === "due" ? "arrow_upward" : "check_circle"}
                  className={`text-[20px] mt-0.5 ${h.type === "due" ? "text-error" : "text-secondary"}`}
                />
                <div className="min-w-0">
                  <p className="font-semibold font-bold text-foreground truncate">
                    {h.desc}
                  </p>
                  <p className="font-semibold text-foreground-muted text-[12px]">
                    {fmtDate(h.date)}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <span
                  className={`font-semibold font-bold block leading-tight ${h.type === "due" ? "text-primary" : "text-secondary"}`}
                >
                  {h.type === "due" ? "+" : "-"}
                  {money(h.amount)}
                </span>
                <span className="text-label-md font-semibold text-foreground-muted">
                  {h.type === "due" ? "বাকি" : "জমা পরিশোধ"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`p-3.5 rounded-2xl bg-settled-bg/60 border border-secondary/20 flex flex-col gap-2 transition-all ${flash ? "ring-2 ring-primary" : ""}`}
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold text-label-lg font-bold text-secondary flex items-center gap-1">
            <Icon name="sms" className="text-[18px]" />
            <span>তাগাদা রসিদ ও মেসেজ ড্রাফট</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-settled-bg text-secondary text-label-md font-semibold">
            ফ্রি এসএমএস
          </span>
        </div>
        <p className="font-semibold text-body-md text-foreground-muted bg-white p-2.5 rounded border border-border text-sm leading-relaxed">
          “{msg}”
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={sendWhatsapp}
            className="flex-1 py-2 px-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold font-bold text-label-md flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Icon name="chat" className="text-[16px]" />
            <span>হোয়াটসঅ্যাপে পাঠান</span>
          </button>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-border">
        <button
          onClick={() => onOpenForm("new_customer")}
          className="font-semibold font-bold text-primary hover:underline flex items-center gap-1"
        >
          <Icon name="person_add" className="text-[16px]" />
          <span>+ নতুন গ্রাহক নিবন্ধন করুন</span>
        </button>
      </div>
    </>
  );
}

/* ================================================================== */
/* Right panel: add customer / due / payment form                      */
/* ================================================================== */

function FormPanel({
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
    const nav = navigator as any;
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

/* ================================================================== */
/* Page                                                                */
/* ================================================================== */

function StorePageContent({ isDemo }: { isDemo: boolean }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const shopName = isDemo ? "সোনালী বাজার" : (user?.shopName ?? "আপনার দোকান");
  const ownerName = isDemo ? "মোঃ আরিফুল ইসলাম" : (user?.name ?? "দোকানদার");
  const phone = isDemo ? "০১৭১২-৩৪৫৬৭৮" : (user?.phone ?? "মোবাইল নম্বর নেই");
  const businessType = isDemo
    ? "মুদি / গ্রোসারি"
    : user
      ? BUSINESS_TYPE_LABELS[user.businessType]
      : "ব্যবসার ধরন";
  const merchantCode = isDemo
    ? "DEMO01"
    : (user?.id.slice(0, 6).toUpperCase() ?? "------");
  const draftKey = isDemo ? DEMO_DRAFT_KEY : DRAFT_KEY;
  const [customers, setCustomers] = useState<Customer[]>(() =>
    isDemo ? makeSeed() : [],
  );
  const [loaded, setLoaded] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [selectedId, setSelectedId] = useState(isDemo ? "CUST-001" : "");
  const [view, setView] = useState<View>("details");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const toastTimer = useRef<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* ---- data source: demo uses isolated local data; live store uses the API ---- */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (isDemo) {
        // Reset the in-memory model to demo fixtures before reading demo-only storage.
        setCustomers(makeSeed());
        setSelectedId("CUST-001");
        try {
          const raw = localStorage.getItem(DEMO_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Customer[];
            if (Array.isArray(parsed) && parsed.length && !cancelled) {
              setCustomers(parsed);
              setSelectedId(parsed[0].id);
            }
          }
        } catch {
          // Ignore invalid demo-only local data.
        } finally {
          if (!cancelled) setLoaded(true);
        }
        return;
      }
      try {
        const [customerResult, transactionResult] = await Promise.all([
          dispatch(fetchAllCustomers()).unwrap(),
          dispatch(fetchAllTransactions()).unwrap(),
        ]);
        if (cancelled) return;
        const mapped = mapApiCustomers(customerResult, transactionResult);
        setApiConnected(true);
        setCustomers(mapped);
        setSelectedId((current) =>
          mapped.some((customer) => customer.id === current)
            ? current
            : (mapped[0]?.id ?? ""),
        );
      } catch (error) {
        if (!cancelled) {
          setApiConnected(false);
          const message =
            typeof error === "string"
              ? error
              : error instanceof Error
                ? error.message
                : "ডেটা লোড করা যায়নি";
          sonnerToast.error(message);
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };
    setLoaded(false);
    void load();
    return () => {
      cancelled = true;
    };
  }, [dispatch, isDemo]);

  useEffect(() => {
    if (!loaded || !isDemo) return;
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(customers));
    } catch {
      // Demo state remains usable even when browser storage is unavailable.
    }
  }, [customers, loaded, isDemo]);

  /* ---- toast ---- */
  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  }, []);

  /* ---- derived ---- */
  const selected = customers.find((c) => c.id === selectedId) ?? customers[0];

  const metrics = useMemo(() => {
    const today = todayISO();
    const paidToday = customers
      .flatMap((c) => c.history)
      .filter((h) => h.type === "paid" && h.date === today);
    return {
      totalDue: customers.reduce((s, c) => s + c.totalDue, 0),
      owing: customers.filter((c) => c.totalDue > 0).length,
      urgent: customers.filter((c) => statusOf(c) === "urgent").length,
      collected: paidToday.reduce((s, h) => s + h.amount, 0),
      collectedCount: paidToday.length,
    };
  }, [customers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qEn = toEn(q);
    return customers.filter((c) => {
      const st = statusOf(c);
      if (filter === "due" && c.totalDue <= 0) return false;
      if (filter === "urgent" && st !== "urgent") return false;
      if (filter === "paid" && c.totalDue > 0) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        toEn(c.phone).replace(/\D/g, "").includes(qEn) ||
        c.address.toLowerCase().includes(q) ||
        c.history.some((h) => h.desc.toLowerCase().includes(q))
      );
    });
  }, [customers, filter, query]);

  useEffect(() => {
    if (isDemo || !selectedId) return;
    let cancelled = false;
    void dispatch(
      fetchCustomerLedger({ customerId: selectedId, page: 1, limit: 100 }),
    )
      .unwrap()
      .then((ledger) => {
        if (cancelled) return;
        const history: Tx[] = ledger.transactions.map((transaction) => ({
          id: transaction.id,
          date: String(transaction.date).slice(0, 10),
          type: transaction.type === "CREDIT" ? "due" : "paid",
          desc:
            transaction.note?.trim() ||
            (transaction.type === "CREDIT" ? "বাকি লেনদেন" : "নগদ জমা"),
          amount: Number(transaction.amount) || 0,
        }));
        setCustomers((previous) =>
          previous.map((customer) =>
            customer.id !== selectedId
              ? customer
              : {
                  ...customer,
                  totalDue: Number(ledger.balance.due) || 0,
                  totalCredit: Number(ledger.balance.creditTotal) || 0,
                  totalPaid: Number(ledger.balance.paymentTotal) || 0,
                  history,
                  creditLimit: Math.max(
                    Number(ledger.balance.creditTotal) || 0,
                    customer.creditLimit,
                  ),
                  dueSince:
                    Number(ledger.balance.due) > 0
                      ? ([...history]
                          .filter((transaction) => transaction.type === "due")
                          .sort((a, b) => a.date.localeCompare(b.date))[0]
                          ?.date ?? null)
                      : null,
                },
          ),
        );
      })
      .catch(() => {
        // Initial transaction list remains visible if the ledger endpoint fails.
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch, isDemo, selectedId]);

  /* ---- form opening ---- */
  const openForm = useCallback(
    (mode: Mode, c?: Customer) => {
      setErrors({});
      if (mode === "new_customer") {
        let f = emptyForm("new_customer");
        try {
          const d = isDemo ? localStorage.getItem(draftKey) : null;
          if (d) {
            f = {
              ...f,
              ...(JSON.parse(d) as Partial<FormState>),
              mode,
              memoName: "",
            };
            if (isDemo) localStorage.removeItem(draftKey);
            notify("সংরক্ষিত খসড়া ফিরিয়ে আনা হয়েছে");
          }
        } catch {
          /* ignore */
        }
        setForm(f);
      } else {
        const t = c ?? selected;
        if (!t) return;
        setSelectedId(t.id);
        setForm({
          ...emptyForm(mode),
          name: t.name,
          phone: t.phone,
          address: t.address,
          limit: toBn(t.creditLimit.toLocaleString("en-US")),
          amount:
            mode === "add_paid" && t.totalDue > 0
              ? toBn(t.totalDue.toLocaleString("en-US"))
              : "",
          fard: mode === "add_paid" ? "নগদ জমা গ্রহণ" : "",
        });
      }
      setView("form");
    },
    [draftKey, isDemo, notify, selected],
  );

  const switchTab = (m: Mode) => {
    if (m === form.mode) return;
    if (m === "new_customer")
      setForm({
        ...emptyForm("new_customer"),
        amount: form.amount,
        fard: form.fard,
      });
    else if (selected)
      setForm({
        ...form,
        mode: m,
        name: selected.name,
        phone: selected.phone,
        address: selected.address,
        limit: toBn(selected.creditLimit.toLocaleString("en-US")),
      });
    setErrors({});
  };

  /* ---- keyboard shortcut (Alt+N) ---- */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        openForm("new_customer");
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [openForm]);

  /* ---- submit: demo mutations stay local; live mutations go to the API ---- */

  const submit = async () => {
    const e: Record<string, string> = {};
    const amount = parseAmt(form.amount);
    const limit = parseAmt(form.limit);
    const isNew = form.mode === "new_customer";

    if (isNew && !form.name.trim()) {
      e.name = "গ্রাহকের নাম লিখুন";
    }

    if (isNew && !validPhone(form.phone)) {
      e.phone = "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (০১XXXXXXXXX)";
    }

    if (
      isNew &&
      customers.some(
        (c) =>
          toEn(c.phone).replace(/\D/g, "") ===
          toEn(form.phone).replace(/\D/g, ""),
      )
    ) {
      e.phone = "এই নম্বরে আগেই একটি খাতা আছে";
    }

    if (amount <= 0 && !(isNew && amount === 0)) {
      e.amount = "টাকার পরিমাণ লিখুন";
    }

    if (form.mode !== "add_paid" && limit <= 0) {
      e.limit = "বাকি সীমা দিন";
    }

    const target = isNew ? undefined : selected;

    if (form.mode === "add_due" && target && target.totalDue + amount > limit) {
      e.amount = `বাকি সীমা ${money(limit)} অতিক্রম করবে। সীমা বাড়ান বা পরিমাণ কমান।`;
    }

    if (isNew && amount > limit) {
      e.amount = `বাকি সীমা ${money(limit)} অতিক্রম করবে।`;
    }

    if (form.mode === "add_paid" && target && amount > target.totalDue) {
      e.amount = `জমা বকেয়ার (${money(target.totalDue)}) চেয়ে বেশি হতে পারে না`;
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const today = todayISO();
    const note =
      form.fard.trim() ||
      (form.mode === "add_paid" ? "নগদ জমা" : "মুদি সামগ্রী");

    const localTx = (type: TxType): Tx => ({
      id: `tx-${Date.now()}`,
      date: today,
      type,
      desc: note,
      amount,
    });

    const shouldOpenSms =
      !isDemo &&
      form.sendSms &&
      (form.mode === "add_due" || form.mode === "add_paid");

    const smsWindow = shouldOpenSms
      ? window.open("about:blank", "_blank")
      : null;

    if (isDemo) {
      if (isNew) {
        const nextNum =
          Math.max(
            0,
            ...customers.map((c) => parseInt(c.id.replace(/\D/g, ""), 10) || 0),
          ) + 1;

        const id = `DEMO-CUST-${String(nextNum).padStart(3, "0")}`;

        const customer: Customer = {
          id,
          name: form.name.trim(),
          phone: formatPhone(form.phone),
          address: form.address.trim() || "ঠিকানা দেওয়া হয়নি",
          creditLimit: limit,
          totalDue: amount,
          dueSince: amount > 0 ? today : null,
          tone: nextNum % 4,
          notes: "ডেমো কাস্টমার",
          history: amount > 0 ? [localTx("due")] : [],
        };

        setCustomers((previous) => [customer, ...previous]);
        setSelectedId(id);
        notify(`‘${customer.name}’ ডেমো খাতায় যুক্ত হয়েছেন`);
      } else if (target) {
        setCustomers((previous) =>
          previous.map((customer) => {
            if (customer.id !== target.id) return customer;

            if (form.mode === "add_due") {
              return {
                ...customer,
                creditLimit: limit,
                totalDue: customer.totalDue + amount,
                dueSince: customer.dueSince ?? today,
                history: [localTx("due"), ...customer.history],
              };
            }

            const due = customer.totalDue - amount;

            return {
              ...customer,
              totalDue: due,
              dueSince: due > 0 ? customer.dueSince : null,
              history: [localTx("paid"), ...customer.history],
            };
          }),
        );

        notify(
          form.mode === "add_due"
            ? `${money(amount)} ডেমো বাকি যোগ হয়েছে`
            : `${money(amount)} ডেমো জমা গৃহীত হয়েছে`,
        );
      }

      setView("details");
      return;
    }

    let customerId = target?.id;
    let customerCreated = false;
    let transactionCreated = false;

    try {
      // Step 1: Create the customer, if needed.
      if (isNew) {
        const created = await dispatch(
          createCustomerRecord({
            name: form.name.trim(),
            phone: toEn(form.phone).replace(/\D/g, "").replace(/^0/, "+880"),
            address: form.address.trim() || null,
            note: form.fard.trim() || null,
          }),
        ).unwrap();

        customerId = created.customer.id;
        customerCreated = true;
      }

      // Step 2: Create the opening balance or transaction.
      if (customerId && amount > 0) {
        await dispatch(
          createTransactionRecord({
            customerId,
            type: isNew || form.mode === "add_due" ? "CREDIT" : "PAYMENT",
            amount,
            note,
            date: new Date(`${today}T12:00:00.000Z`).toISOString(),
          }),
        ).unwrap();

        transactionCreated = true;
      }
    } catch (error) {
      if (smsWindow && !smsWindow.closed) {
        smsWindow.close();
      }

      // Refresh the data if a customer or transaction may already have
      // been saved, so the UI doesn't incorrectly forget the new record.
      try {
        const [customerResult, transactionResult] = await Promise.all([
          dispatch(fetchAllCustomers()).unwrap(),
          dispatch(fetchAllTransactions()).unwrap(),
        ]);

        setCustomers(mapApiCustomers(customerResult, transactionResult));

        if (customerId) {
          setSelectedId(customerId);
        }
      } catch {
        // Keep the original mutation error.
      }

      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "তথ্য সংরক্ষণ করা যায়নি";

      sonnerToast.error(
        customerCreated && !transactionCreated
          ? "গ্রাহক তৈরি হয়েছে, কিন্তু লেনদেন সংরক্ষণ করা যায়নি। গ্রাহকের তথ্য যাচাই করে আবার চেষ্টা করুন।"
          : message,
      );

      setErrors({ submit: message });
      return;
    }

    // Step 3: Refresh data separately. A refresh failure should not make
    // an already-saved customer or transaction look like a failed save.
    try {
      const [customerResult, transactionResult] = await Promise.all([
        dispatch(fetchAllCustomers()).unwrap(),
        dispatch(fetchAllTransactions()).unwrap(),
      ]);

      setCustomers(mapApiCustomers(customerResult, transactionResult));
      setApiConnected(true);
    } catch {
      sonnerToast.info(
        "তথ্য সংরক্ষিত হয়েছে, তবে তালিকা রিফ্রেশ করা যায়নি। পেজ রিফ্রেশ করুন।",
      );
    }

    if (customerId) {
      setSelectedId(customerId);
    }

    notify(
      isNew
        ? `‘${form.name.trim()}’ খাতায় যুক্ত হয়েছেন`
        : form.mode === "add_due"
          ? `${money(amount)} বাকি ${target?.name ?? ""}-এর খাতায় যোগ হয়েছে`
          : `${money(amount)} জমা গৃহীত হয়েছে`,
    );

    // Step 4: Preserve the existing SMS composer behavior.
    if (shouldOpenSms) {
      const recipient = intlPhone(
        isNew ? form.phone : (target?.phone ?? form.phone),
      ).replace(/\D/g, "");

      const smsMessage =
        `আসসালামু আলাইকুম ${isNew ? form.name.trim() : (target?.name ?? "গ্রাহক")} ভাই, ` +
        `${shopName}তে আপনার খতিয়ান আপডেট হয়েছে। ` +
        `${form.mode === "add_paid" ? "জমা" : "লেনদেন"}: ${money(amount)}। ` +
        `${note}। ধন্যবাদ! - ${ownerName}`;

      if (smsWindow) {
        smsWindow.location.href = `https://wa.me/${recipient}?text=${encodeURIComponent(smsMessage)}`;
      } else {
        sonnerToast.info("লেনদেন সংরক্ষিত হয়েছে, তবে WhatsApp খোলা যায়নি।");
      }
    }
    setView("details");
  };

  const saveDraft = () => {
    try {
      const { memoName, ...rest } = form;
      if (!isDemo) {
        notify("লাইভ খসড়া সংরক্ষণ সুবিধা চালু নেই");
        return;
      }
      localStorage.setItem(draftKey, JSON.stringify(rest));
      notify("ডেমো খসড়া সংরক্ষিত হয়েছে");
    } catch {
      notify("খসড়া সংরক্ষণ করা যায়নি");
    }
  };

  /* ---- row quick actions ---- */
  const rowAction = (
    action: "sms" | "pay" | "statement" | "add-due",
    c: Customer,
  ) => {
    setSelectedId(c.id);
    if (action === "pay") return openForm("add_paid", c);
    if (action === "add-due") return openForm("add_due", c);
    setView("details");
    if (action === "sms" && isDemo) {
      sonnerToast.info("ডেমো মোডে কোনো বার্তা পাঠানো হয় না।");
      return;
    }
    if (action === "sms") {
      const body = encodeURIComponent(reminderText(c, shopName, ownerName));
      const recipient = intlPhone(c.phone);

      window.location.href = `sms:${recipient}?body=${body}`;

      setFlash(true);
      window.setTimeout(() => setFlash(false), 1500);
    }
  };

  /* ---- daily report (CSV) ---- */
  const downloadReport = () => {
    const head = [
      "গ্রাহক",
      "মোবাইল",
      "ঠিকানা",
      "বাকি",
      "ক্রেডিট সীমা",
      "অবস্থা",
    ];
    const rows = customers.map((c) => [
      c.name,
      c.phone,
      c.address,
      c.totalDue,
      c.creditLimit,
      dueText(c),
    ]);
    const csv = [head, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `khata-report-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify("দৈনিক রিপোর্ট ডাউনলোড হচ্ছে");
  };

  const voiceSearch = () =>
    listen(
      (t) => {
        setQuery(t);
        notify(`ভয়েস সার্চ: ‘${t}’`);
      },
      () => notify("ভয়েস সার্চ চালু করা যায়নি। মাইক্রোফোনের অনুমতি দিন।"),
    );

  const chips: { id: Filter; label: string; cls: string }[] = [
    { id: "all", label: "সকল খাতা", cls: "" },
    { id: "due", label: "বকেয়া বাকি (Due)", cls: "" },
    { id: "urgent", label: "তাগাদা প্রয়োজন", cls: "text-tertiary" },
    { id: "paid", label: "পরিশোধিত (Paid)", cls: "text-secondary" },
  ];

  /* ================================================================ */

  return (
    <div
      id="top"
      className="flex min-h-screen flex-col justify-between bg-background font-normal text-foreground antialiased"
    >
      {/* ============================ HEADER ============================ */}
      <header className="sticky top-0 left-0 right-0 z-40 border-b border-border bg-background/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <BrandLogo />
            <div className="h-6 w-px bg-surface-hover hidden sm:block" />
          </div>

          <nav className="hidden xl:flex items-center gap-1 bg-background p-1 rounded-full">
            <button
              onClick={() => {
                setView("details");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-3 py-1 rounded-full font-semibold text-label-lg bg-primary text-on-primary font-semibold"
            >
              খাতা / ড্যাশবোর্ড
            </button>
            <button
              onClick={() => {
                searchRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                searchRef.current?.focus();
              }}
              className="px-3 py-1 rounded-full font-semibold text-label-lg text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-all"
            >
              গ্রাহক তালিকা
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 px-3 py-1 rounded-full bg-settled-bg/40">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-semibold text-label-md font-semibold text-settled-fg">
                ক্লাউড সিঙ্ক চালু
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

      {/* ============================ MAIN ============================== */}
      <main className="w-full bg-background flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col">
          {isDemo && (
            <div className="mx-4 mt-4 rounded-xl border border-rolling-fg/20 bg-rolling-bg px-4 py-3 text-sm font-semibold text-rolling-fg sm:mx-6 lg:mx-8">
              আপনি নমুনা দোকান দেখছেন। এখানে করা পরিবর্তন শুধু এই ডেমোতেই থাকবে,
              আর কোনো SMS বা WhatsApp বার্তা পাঠানো হবে না।
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
                      লাইভ সিঙ্ক চালু
                    </span>
                  </div>
                  <p className="font-semibold text-white/80 mt-0.5">
                    মালিক: {ownerName} • {phone} • {businessType} • মার্চেন্ট
                    আইডি:{" "}
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

          {/* Metrics */}
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
                  {toBn(customers.length)} জন
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

          {/* Workspace */}
          <div className="w-full px-4 sm:px-6 lg:px-8 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* LEFT */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-3">
              <div className="w-full bg-surface p-3 rounded-2xl shadow-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Icon
                    name="search"
                    className="text-foreground-muted text-[22px]"
                  />
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
                    filtered.map((c) => {
                      const sel = c.id === selectedId && view === "details";
                      const st = statusOf(c);
                      const tone = TONES[c.tone % 4];
                      return (
                        <div
                          key={c.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setSelectedId(c.id);
                            setView("details");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setSelectedId(c.id);
                              setView("details");
                            }
                          }}
                          className={`px-3 py-3.5 hover:bg-background/70 cursor-pointer flex items-center justify-between transition-all border-l-4 ${
                            sel
                              ? "bg-due-bg/30 border-primary shadow-sm"
                              : "border-transparent"
                          }`}
                        >
                          <div className="w-5/12 flex items-center gap-2 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-full ${tone.bg} ${tone.text} flex items-center justify-center font-bold font-semibold flex-shrink-0`}
                            >
                              {initialOf(c.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-semibold text-title-lg text-foreground font-semibold truncate leading-tight">
                                  {c.name}
                                </h4>
                                {sel && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                )}
                              </div>
                              <p className="font-semibold text-label-md text-foreground-muted truncate">
                                {c.phone} • {c.address}
                              </p>
                            </div>
                          </div>
                          <div className="w-3/12 text-right">
                            <span
                              className={`font-semibold text-headline-md font-bold block leading-none ${c.totalDue > 0 ? "text-primary" : "text-secondary"}`}
                            >
                              {money(c.totalDue)}
                            </span>
                            <span
                              className={`text-label-md inline-block mt-0.5 ${st === "urgent" ? "text-error font-bold" : st === "paid" ? "text-secondary font-semibold" : "text-foreground-muted"}`}
                            >
                              {dueText(c)}
                            </span>
                          </div>
                          <div
                            className="w-4/12 flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {c.totalDue > 0 ? (
                              <>
                                <button
                                  onClick={() => rowAction("sms", c)}
                                  title={
                                    isDemo
                                      ? "ডেমো মোডে বার্তা পাঠানো বন্ধ"
                                      : "SMS তাগাদা পাঠান"
                                  }
                                  className={`px-2 py-1 rounded-full bg-surface-muted text-settled-fg hover:bg-surface-muted text-label-md font-bold flex items-center gap-1 transition-all ${isDemo ? "opacity-70" : ""}`}
                                >
                                  <Icon name="sms" className="text-[14px]" />
                                  <span>তাগাদা</span>
                                </button>
                                <button
                                  onClick={() => rowAction("pay", c)}
                                  className="px-2 py-1 rounded-full bg-settled-bg/60 text-secondary text-label-md font-bold hover:bg-settled-bg transition-all"
                                >
                                  জমা
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => rowAction("statement", c)}
                                  className="px-2 py-1 rounded-full bg-surface-muted hover:bg-surface-muted text-foreground text-label-md font-semibold transition-all"
                                >
                                  বিবরণী
                                </button>
                                <button
                                  onClick={() => rowAction("add-due", c)}
                                  className="px-2 py-1 rounded-full bg-due-bg text-primary text-label-md font-bold hover:bg-due-bg transition-all"
                                >
                                  + বাকি দিন
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
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
                    প্রতিটি বাকি বা জমার পর আপনার দোকান ‘{shopName}’ এর নামসহ
                    ফ্রি মেসেজ চলে যায়। এতে কাস্টমার হিসাব নিয়ে স্বচ্ছ থাকে ও
                    দ্রুত টাকা আদায় হয়।
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
                  onSaved={async () => {
                    const [customerResult, transactionResult] =
                      await Promise.all([
                        dispatch(fetchAllCustomers()).unwrap(),
                        dispatch(fetchAllTransactions()).unwrap(),
                      ]);
                    const mapped = mapApiCustomers(
                      customerResult,
                      transactionResult,
                    );
                    setApiConnected(true);
                    setCustomers(mapped);
                    setSelectedId((current) =>
                      mapped.some((customer) => customer.id === current)
                        ? current
                        : (mapped[0]?.id ?? ""),
                    );
                  }}
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
                  onCancel={() => {
                    setView("details");
                    setErrors({});
                  }}
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

          {/* Trust bar */}
          <div className="w-full px-4 sm:px-6 lg:px-8 pb-4">
            <div className="w-full bg-background rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
                <div className="flex items-center gap-1 text-secondary">
                  <Icon name="verified" className="text-[20px]" />
                  <span className="font-semibold text-label-lg font-bold text-foreground">
                    ডিজিটাল খাতা গ্যারান্টি: ১০০% নিরাপদ ও এনক্রিপ্টেড ব্যাকআপ
                  </span>
                </div>
                <div className="h-4 w-px bg-surface-hover hidden md:block" />
                {/* <div className="flex items-center gap-1 text-foreground-muted font-semibold">
                  <Icon
                    name="cloud_sync"
                    className="text-[18px] text-primary"
                  />
                  <span>
                    অফলাইনে ডাটা এন্ট্রি হলেও নেট কানেকশন পাওয়া মাত্রই সার্ভারে
                    জমা হবে
                  </span>
                </div> */}
              </div>
              <div className="flex items-center gap-1 text-label-md text-foreground-muted">
                <span>যেকোনো সমস্যায় কল করুন:</span>
                <span className="font-bold text-primary">০১৭০০-০০০০০০</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============================ FOOTER ============================ */}
      <footer className="w-full bg-background py-3 mt-auto shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
            <div className="flex items-center gap-1 text-secondary">
              <Icon name="verified_user" className="text-[18px]" />
              <span className="font-semibold text-label-md font-semibold text-foreground">
                ব্যাংক-গ্রেড ২৫৬-বিট এনক্রিপ্টেড ডাটা সুরক্ষা
              </span>
            </div>
            <div className="h-4 w-px bg-surface-hover hidden md:block" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-foreground-muted">
              <Icon name="support_agent" className="text-[16px] text-primary" />
              <span className="font-semibold text-label-md font-semibold text-foreground">
                সহায়তা: ১৬২৬০ / ০১৭০০-০০০০০০
              </span>
            </div>
            <span className="font-semibold text-label-md text-foreground-muted">
              © ২০২৫ বাকি খাতা লিমিটেড
            </span>
          </div>
        </div>
      </footer>

      {/* ============================= TOAST ============================ */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 max-w-[90vw] bg-secondary text-on-secondary px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-semibold text-sm border border-secondary/60"
        >
          <Icon name="check_circle" className="text-[20px] text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default function StorePageView({ demo = false }: { demo?: boolean }) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background text-sm text-foreground-muted">
          খাতা লোড হচ্ছে...
        </main>
      }
    >
      <StorePageContent isDemo={demo} />
    </Suspense>
  );
}
