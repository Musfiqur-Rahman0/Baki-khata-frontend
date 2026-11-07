import type { Customer, FormState } from "./store-types";

export const URGENT_DAYS = 15;

export const TONES = [
  { bg: "bg-due-bg", text: "text-primary" },
  { bg: "bg-settled-bg", text: "text-secondary" },
  { bg: "bg-surface-muted", text: "text-foreground" },
  { bg: "bg-rolling-bg", text: "text-tertiary" },
];

const BN = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => BN[+d]);
export const toEn = (s: string) =>
  String(s).replace(/[০-৯]/g, (d) => String(BN.indexOf(d)));
export const money = (n: number) =>
  "৳ " + toBn((Number(n) || 0).toLocaleString("en-US"));
export const parseAmt = (s: string) =>
  parseInt(toEn(s).replace(/\D/g, "") || "0", 10);
export const fmtInput = (s: string) => {
  const n = parseAmt(s);
  return n ? toBn(n.toLocaleString("en-US")) : "";
};

const localISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const todayISO = () => localISO(new Date());
export const daysAgoISO = (n: number) =>
  localISO(new Date(Date.now() - n * 86400000));
const daysSince = (iso: string | null) => {
  if (!iso) return 0;
  const a = new Date(iso + "T00:00:00").getTime();
  const b = new Date(todayISO() + "T00:00:00").getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
};
export const fmtDate = (iso: string) => {
  const s = new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso + "T00:00:00"));
  return iso === todayISO() ? `আজ, ${s}` : s;
};

export const statusOf = (c: Customer): "paid" | "due" | "urgent" =>
  c.totalDue <= 0
    ? "paid"
    : daysSince(c.dueSince) > URGENT_DAYS
      ? "urgent"
      : "due";

export const dueText = (c: Customer) => {
  if (c.totalDue <= 0) return "সম্পূর্ণ পরিশোধিত";
  const d = daysSince(c.dueSince);
  if (d === 0) return "আজকে বাকি যোগ";
  return d > URGENT_DAYS
    ? `${toBn(d)} দিন বাকি (অতিজরুরি)`
    : `${toBn(d)} দিন বাকি`;
};

export const initialOf = (name: string) => {
  const t = name.trim();
  if (!t) return "?";
  try {
    const seg = new Intl.Segmenter("bn", { granularity: "grapheme" });
    return Array.from(seg.segment(t))[0].segment;
  } catch {
    return t.charAt(0);
  }
};

export const formatPhone = (raw: string) => {
  const d = toEn(raw).replace(/\D/g, "");
  return d.length === 11 ? toBn(`${d.slice(0, 4)}-${d.slice(4)}`) : raw;
};
export const validPhone = (raw: string) =>
  /^01\d{9}$/.test(toEn(raw).replace(/\D/g, ""));
export const intlPhone = (raw: string) => {
  const d = toEn(raw).replace(/\D/g, "");
  return d.startsWith("0") ? "88" + d : d;
};

export const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

export const reminderText = (
  c: Customer,
  shopName: string,
  ownerName: string,
) =>
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

export function listen(onResult: (t: string) => void, onFail: () => void) {
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

export const emptyForm = (mode: FormState["mode"] = "new_customer"): FormState => ({
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
