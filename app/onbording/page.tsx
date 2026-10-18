"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Bell,
  BellRing,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  CircleHelp,
  CirclePlus,
  CircleStop,
  Clock3,
  Cloud,
  ContactRound,
  CreditCard,
  Eye,
  Headphones,
  Info,
  LockKeyhole,
  MessageCircle,
  PartyPopper,
  PlayCircle,
  Plus,
  ReceiptText,
  RefreshCw,
  Send,
  Shield,
  ShieldCheck,
  Smartphone,
  SquarePen,
  Store,
  UserPlus,
  UserRound,
  UsersRound,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { BUSINESS_TYPE_LABELS } from "@/features/auth/authSlice";
import { useAppSelector } from "@/lib/redux/hooks";

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const ICONS: Record<string, LucideIcon> = {
  account_balance_wallet: Wallet,
  add: Plus,
  add_circle: CirclePlus,
  arrow_back: ArrowLeft,
  badge: ContactRound,
  chat: MessageCircle,
  check_circle: CheckCircle2,
  celebration: PartyPopper,
  cloud_done: Cloud,
  close: X,
  edit_note: SquarePen,
  group: UsersRound,
  headset_mic: Headphones,
  info: Info,
  lock: LockKeyhole,
  menu_book: BookOpen,
  notifications: Bell,
  notification_important: BellRing,
  payments: Banknote,
  person: UserRound,
  person_add: UserPlus,
  play_circle: PlayCircle,
  point_of_sale: CircleDollarSign,
  price_check: CreditCard,
  receipt_long: ReceiptText,
  refresh: RefreshCw,
  schedule: Clock3,
  security: Shield,
  send: Send,
  smartphone: Smartphone,
  storefront: Store,
  stop_circle: CircleStop,
  support_agent: Headphones,
  task_alt: CheckCircle2,
  verified: BadgeCheck,
  verified_user: ShieldCheck,
  visibility: Eye,
  store: Store,
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

function SmsButton({
  status,
  onSend,
  className,
  small,
}: {
  status?: "sending" | "done";
  onSend: () => void;
  className: string;
  small?: boolean;
}) {
  const size = small ? "text-[16px]" : "text-[18px]";

  return (
    <button
      type="button"
      disabled={!!status}
      onClick={onSend}
      className={`${className} ${status === "done" ? "!bg-primary" : ""}`}
    >
      <Icon
        name={
          status === "sending"
            ? "refresh"
            : status === "done"
              ? "check_circle"
              : "send"
        }
        className={`${size} ${status === "sending" ? "animate-spin" : ""}`}
      />
      {status === "sending"
        ? "পাঠানো হচ্ছে..."
        : status === "done"
          ? "সফল!"
          : "হোয়াটসঅ্যাপ তাগাদা পরখ করুন"}
    </button>
  );
}

type View = "welcome" | "dokan";

const NAV_ACTIVE =
  "transition-colors bg-primary text-on-primary rounded-full px-3 py-1 text-label-lg font-semibold";
const NAV_IDLE =
  "text-foreground-muted hover:text-foreground font-semibold text-label-lg px-3 py-1 transition-colors flex items-center gap-1 rounded-full";

const INPUT =
  "w-full pl-10 pr-4 py-2.5 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-normal text-body-md placeholder:text-foreground-muted";

/* Zero-state vs. demo values for the metric ribbon */
const METRICS = [
  {
    label: "মোট বাজার পাওনা",
    icon: "account_balance_wallet",
    iconWrap: "bg-due-bg text-primary",
    empty: {
      value: "৳ ০",
      note: "নতুন শুরু (কোনো বাকি নেই)",
      noteClass: "text-primary",
      dot: "bg-primary",
    },
    demo: {
      value: "৳ ১৯,৮৫০",
      note: "১২ জন গ্রাহকের কাছে পাওনা",
      noteClass: "text-primary",
      dot: "bg-primary",
    },
  },
  {
    label: "খাতার গ্রাহক সংখ্যা",
    icon: "group",
    iconWrap: "bg-settled-bg text-secondary",
    empty: {
      value: "০ জন",
      note: "প্রথম কাস্টমার যোগের অপেক্ষায়",
      noteClass: "text-foreground-muted",
      dot: "bg-border",
    },
    demo: {
      value: "৫২ জন",
      note: "সক্রিয় বাকি গ্রাহক",
      noteClass: "text-foreground-muted",
      dot: "bg-secondary",
    },
  },
  {
    label: "জরুরি তাগাদা প্রয়োজন",
    icon: "notification_important",
    iconWrap: "bg-rolling-bg text-tertiary",
    empty: {
      value: "০ জন",
      note: "সব পাওনা ব্যালেন্স ক্লিয়ার",
      noteClass: "text-secondary",
      dot: "bg-secondary",
    },
    demo: {
      value: "৩ জন",
      note: "৭ দিনের বেশি বাকি",
      noteClass: "text-tertiary",
      dot: "bg-tertiary",
    },
  },
  {
    label: "আজকের মোট ক্যাশ জমা",
    icon: "point_of_sale",
    iconWrap: "bg-surface-muted text-foreground",
    empty: {
      value: "৳ ০",
      note: "দৈনিক ক্যাশ বাক্স প্রস্তুত",
      noteClass: "text-foreground-muted",
      dot: "bg-border",
    },
    demo: {
      value: "৳ ৮,৫৫০",
      note: "ক্যাশ কাউন্টারে জমা",
      noteClass: "text-foreground-muted",
      dot: "bg-border",
    },
  },
];

const CUSTOMERS = [
  {
    initial: "হ",
    avatar: "bg-due-bg text-primary",
    name: "হাজী কামাল উদ্দিন",
    phone: "০১৮১৭-XXXXXX",
    note: "শেষ কেনাকাটা: গতকাল (চাল, তেল ও ডাল)",
    amount: "৳ ৩,৪৫০ বাকি",
    tag: "১০ দিন বাকি",
    tagClass: "text-secondary",
  },
  {
    initial: "ত",
    avatar: "bg-settled-bg text-secondary",
    name: "তারেক মাস্টার",
    phone: "০১৯১২-XXXXXX",
    note: "আজ সকালে ১,০০০ টাকা পরিশোধ করেছেন",
    amount: "৳ ১,১৫০ বাকি",
    tag: "নিয়মিত খরিদ্দার",
    tagClass: "text-foreground-muted",
  },
  {
    initial: "ম",
    avatar: "bg-rolling-bg text-tertiary",
    name: "মোস্তফা ড্রাইভার",
    phone: "০১৭৫৫-XXXXXX",
    note: "শেষ এন্ট্রি: ৪ দিন আগে (চা-নাশতা)",
    amount: "৳ ৬২০ বাকি",
    tag: "তাগাদা পাঠানো প্রয়োজন",
    tagClass: "text-primary font-semibold",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const shopName = user?.shopName ?? "আপনার দোকান";
  const ownerName = user?.name ?? "দোকানদার";
  const businessType = user
    ? BUSINESS_TYPE_LABELS[user.businessType]
    : "ব্যবসার ধরন";
  const merchantCode = user?.id.slice(0, 6).toUpperCase() ?? "------";
  const [view, setView] = useState<View>("welcome");
  const [modalOpen, setModalOpen] = useState(false);
  const [demo, setDemo] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sms, setSms] = useState<Record<string, "sending" | "done">>({});
  const [cust, setCust] = useState({ name: "", phone: "", balance: "" });

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4000);
  };

  const switchView = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveCustomer = () => {
    if (!cust.name.trim()) return notify("দয়া করে গ্রাহকের নাম লিখুন");
    setModalOpen(false);
    notify(`অভিনন্দন! ${cust.name} সফলভাবে আপনার বাকি খাতায় যুক্ত হয়েছেন।`);
    setCust({ name: "", phone: "", balance: "" });
    // TODO: POST /api/customers
  };

  const sendSms = (id: string) => {
    setSms((s) => ({ ...s, [id]: "sending" }));
    window.setTimeout(() => {
      setSms((s) => ({ ...s, [id]: "done" }));
      notify(
        "আপনার নিবন্ধিত মার্চেন্ট নম্বরে একটি পরীক্ষামূলক তাগাদা পাঠানো হয়েছে!",
      );
      window.setTimeout(
        () =>
          setSms((state) =>
            Object.fromEntries(
              Object.entries(state).filter(([key]) => key !== id),
            ),
          ),
        3500,
      );
    }, 1200);
  };

  const openVideoHelp = () =>
    notify(
      "বাকি খাতা ২-মিনিটের ভিডিও গাইড লোড হচ্ছে। ইন্টারনেটের প্রয়োজন হবে।",
    );
  const openQuickEntry = () =>
    notify(
      'কুইক এন্ট্রি চালু হচ্ছে... লিখুনঃ যেমন "রফিক ভাই চিনি বাকি ১২০ টাকা"',
    );

  return (
    <div
      id="top"
      className="min-h-screen bg-background font-sans text-foreground antialiased flex flex-col justify-between"
    >
      {/* ============================ HEADER ============================ */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandLogo />

          <nav className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => switchView("welcome")}
              aria-current={view === "welcome" ? "page" : undefined}
              className={view === "welcome" ? NAV_ACTIVE : NAV_IDLE}
            >
              স্বাগতম ও সেটআপ
            </button>
            <button onClick={() => router.push("/store")} className={NAV_IDLE}>
              <Icon name="storefront" className="text-[18px]" />
              <span>আমার দোকানে যান</span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="বিজ্ঞপ্তি"
              className="relative flex size-9 items-center justify-center rounded-full bg-surface-muted text-foreground-muted transition-colors hover:bg-surface-hover"
            >
              <Icon name="notifications" className="text-[20px]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-surface" />
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex flex-col text-right">
                <span className="text-label-lg font-semibold text-foreground">
                  {shopName}
                </span>
                <span className="text-label-md font-medium text-secondary">
                  {ownerName}
                </span>
              </div>
              <div className="flex size-8 items-center justify-center rounded-full bg-primary text-on-primary">
                <Icon name="person" className="text-[18px]" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============================ MAIN ============================== */}
      <main className="w-full flex-1 bg-background">
        {/* ------------------------- WELCOME VIEW ------------------------- */}
        {view === "welcome" && (
          <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {/* 1. Store banner */}
            <div className="bg-surface rounded-2xl p-3 lg:p-4 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-lg bg-surface-muted flex items-center justify-center overflow-hidden">
                    <Icon
                      name="storefront"
                      className="text-primary text-[36px]"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center text-on-secondary text-[12px] shadow-sm">
                    ✓
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1">
                    <h1 className="font-bold text-headline-md text-foreground">
                      {shopName}
                    </h1>
                    <span className="bg-surface-muted px-1 py-0.5 rounded-full font-medium text-label-md text-foreground-muted font-mono">
                      #BK-{merchantCode}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-normal text-body-md text-foreground-muted">
                    <span>
                      প্রোপাইটার: <strong>{ownerName}</strong>
                    </span>
                    <span>
                      ব্যবসার ধরন: <strong>{businessType}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 text-secondary font-medium">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      ক্লাউড সিঙ্ক চালু (প্রথম দিন)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full lg:w-auto lg:justify-end sm:justify-end">
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-label-lg shadow-sm hover:shadow-md hover:bg-primary-hover transition-all"
                >
                  <Icon name="person_add" className="text-[18px]" />+ কাস্টমার
                  যোগ করুন
                </button>
                <button
                  onClick={() => router.push("/store")}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-surface-muted hover:bg-surface-hover text-foreground font-semibold text-label-lg transition-colors"
                >
                  <Icon
                    name="storefront"
                    className="text-primary text-[18px]"
                  />
                  আমার দোকানে যান
                </button>
                <button
                  onClick={openVideoHelp}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-surface-muted hover:bg-surface-muted text-foreground-muted font-semibold text-label-lg transition-colors"
                >
                  <Icon
                    name="play_circle"
                    className="text-tertiary text-[18px]"
                  />
                  টিউটোরিয়াল
                </button>
              </div>
            </div>

            {/* 2. Welcome hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-due-bg/70 via-background to-settled-bg rounded-2xl p-4 lg:p-6 shadow-sm">
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold text-label-lg">
                    <Icon name="celebration" className="text-[16px]" />
                    স্মার্ট খাতা শুভ সূচনা
                  </div>
                  <h2 className="font-bold text-headline-lg text-foreground">
                    স্বাগতম, {ownerName}! আপনার ডিজিটাল খাতার নতুন যাত্রা শুরু
                    হলো 🎉
                  </h2>
                  <p className="font-normal text-body-lg text-foreground-muted leading-relaxed">
                    আর কোনো খাতার পাতা ছেঁড়া, হিসেব না মেলা বা বাকি ভুলে
                    যাওয়ার ভয় নেই। মাত্র ৩টি সহজ ধাপে আপনার প্রথম লেনদেন
                    সম্পন্ন করুন এবং সরাসরি কাস্টমারের হোয়াটসঅ্যাপে তাগাদা
                    পাঠানোর সুবিধা উপভোগ করুন।
                  </p>
                  <div className="pt-2 w-full max-w-lg space-y-1">
                    <div className="flex items-center justify-between font-semibold text-label-lg text-foreground">
                      <span className="flex items-center gap-1 font-semibold">
                        <Icon
                          name="task_alt"
                          className="text-primary text-[18px]"
                        />
                        দোকান খাতা সেটআপ: ১/৩ ধাপ সম্পন্ন
                      </span>
                      <span className="font-mono text-primary font-bold">
                        ৩৩%
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-surface-hover overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                        style={{ width: "33%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="hidden xl:flex items-center gap-3">
                  <div className="relative w-44 h-44 rounded-lg bg-surface p-2 shadow-md rotate-2 hover:rotate-0 transition-transform">
                    <div className="w-full h-full rounded-lg bg-background flex flex-col items-center justify-center text-center p-1">
                      <Icon
                        name="security"
                        className="text-secondary text-[40px] mb-1"
                      />
                      <span className="font-semibold text-label-lg font-bold text-foreground">
                        শতভাগ নিরাপদ
                      </span>
                      <span className="font-medium text-label-md text-foreground-muted">
                        মুঠোফোনে স্বয়ংক্রিয় ব্যাকআপ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Three guided cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Card 1 */}
              <div className="bg-surface rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-lg">
                      ১
                    </span>
                    <span className="px-1 py-0.5 rounded-full bg-due-bg text-due-fg font-medium text-label-md font-bold uppercase">
                      প্রথম করণীয়
                    </span>
                  </div>
                  <div className="space-y-1 pt-1">
                    <h3 className="font-semibold text-title-lg text-foreground">
                      প্রথম বাকি কাস্টমার যুক্ত করুন
                    </h3>
                    <p className="font-normal text-body-md text-foreground-muted">
                      খাতার প্রথম খতিয়ান খুলুন নাম ও মোবাইল নম্বর দিয়ে।
                      কাস্টমারকে এক ক্লিকে হোয়াটসঅ্যাপে রসিদ পাঠিয়ে দিন।
                    </p>
                  </div>
                  <div className="p-2 bg-background rounded-lg flex items-center gap-1 text-foreground-muted font-medium text-label-md">
                    <Icon
                      name="verified"
                      className="text-primary text-[18px]"
                    />
                    কোনো অ্যাপ ছাড়াই কাস্টমার দেখতে পাবে
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-full py-3 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-semibold text-label-lg flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Icon name="add_circle" className="text-[18px]" />+ কাস্টমার
                    যোগ করুন
                  </button>
                </div>
              </div>

              {/* Card 2 */}
              <QuickEntryCard onTry={openQuickEntry} />

              {/* Card 3 */}
              <div className="bg-surface rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-full bg-surface-muted text-foreground flex items-center justify-center font-bold text-label-lg">
                      ৩
                    </span>
                    <span className="px-1 py-0.5 rounded-full bg-settled-bg text-settled-fg font-medium text-label-md font-semibold">
                      স্মার্ট তাগাদা
                    </span>
                  </div>
                  <div className="space-y-1 pt-1">
                    <h3 className="font-semibold text-title-lg text-foreground">
                      হোয়াটসঅ্যাপে সরাসরি তাগাদা
                    </h3>
                    <p className="font-normal text-body-md text-foreground-muted">
                      সরাসরি কাস্টমারের হোয়াটসঅ্যাপে তাগাদা মেসেজ ও পরিশোধ লিংক
                      পাঠান এক ক্লিকেই।
                    </p>
                  </div>
                  <div className="p-2 bg-settled-bg/50 rounded-lg flex items-center gap-1 text-foreground-muted font-medium text-label-md">
                    <Icon name="chat" className="text-secondary text-[18px]" />
                    বাংলায় তৈরি প্রফেশনাল হোয়াটসঅ্যাপ বার্তা
                  </div>
                </div>
                <div className="pt-4">
                  <SmsButton
                    status={sms.card3}
                    onSend={() => sendSms("card3")}
                    className="w-full py-3 rounded-full bg-secondary text-on-secondary font-semibold text-label-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm hover:brightness-110"
                  />
                </div>
              </div>
            </div>

            {/* 4. Metric ribbon */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-title-lg text-foreground">
                  বর্তমান আর্থিক খতিয়ান স্ট্যাটাস
                </h3>
                <span className="font-medium text-label-md text-foreground-muted">
                  রিয়েল-টাইম ক্যালকুলেটর
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {METRICS.map((m) => {
                  const d = demo ? m.demo : m.empty;
                  return (
                    <div
                      key={m.label}
                      className="bg-surface rounded-2xl p-3 shadow-sm relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between pb-2">
                        <span className="font-semibold text-label-lg text-foreground-muted">
                          {m.label}
                        </span>
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${m.iconWrap}`}
                        >
                          <Icon name={m.icon} className="text-[18px]" />
                        </span>
                      </div>
                      <div>
                        <div className="font-extrabold text-metric-xl text-foreground font-mono">
                          {d.value}
                        </div>
                        <div
                          className={`flex items-center gap-1 mt-1 font-medium text-label-md ${d.noteClass}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${d.dot}`} />
                          {d.note}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Live demo section */}
            <div className="bg-surface rounded-2xl p-4 lg:p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-rolling-bg text-rolling-fg font-semibold text-label-lg">
                    <Icon name="visibility" className="text-[16px]" />
                    লাইভ প্রিভিউ ডেমো
                  </div>
                  <h3 className="font-bold text-headline-lg text-foreground">
                    কীভাবে কাজ করে বুঝতে চান? ১-ক্লিকে নমুনা ডেটা দেখুন
                  </h3>
                  <p className="font-normal text-body-md text-foreground-muted">
                    একটি পুরোদস্তুর চলমান মুদি দোকানের হিসাবের বই দেখতে চান?
                    লাইভ ডেমো চালু করে দেখুন কীভাবে ৫০+ বাকি গ্রাহক,
                    স্বয়ংক্রিয় মেসেজ তাগাদা এবং দিনশেষের লাভ-ক্ষতির রিপোর্ট
                    প্রদর্শিত হয়।
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setDemo((v) => !v);
                        notify(
                          demo
                            ? "ডেমো বন্ধ হয়েছে। আপনার স্বাভাবিক খাতা দেখানো হচ্ছে।"
                            : "নমুনা ডেটা সক্রিয় হয়েছে! উপরের খতিয়ান স্ট্যাটাসে দেখুন।",
                        );
                      }}
                      className={`inline-flex items-center gap-2 px-4 py-3 rounded-full text-on-secondary font-semibold text-label-lg transition-all shadow-md ${
                        demo
                          ? "bg-primary"
                          : "bg-secondary hover:brightness-110"
                      }`}
                    >
                      <Icon
                        name={demo ? "stop_circle" : "play_circle"}
                        className="text-[18px]"
                      />
                      {demo
                        ? "ডেমো বন্ধ করুন (স্বাভাবিক খাতা)"
                        : "নমুনা ডেটা দেখুন (ডেমো অন)"}
                    </button>
                    <button
                      onClick={() => router.push("/demo-store")}
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-full border border-border bg-background text-foreground font-semibold text-label-lg transition-colors hover:bg-surface-muted"
                    >
                      <Icon name="storefront" className="text-[18px]" />
                      ডেমো দোকান খুলুন
                    </button>
                    <span className="font-medium text-label-md text-foreground-muted">
                      * আপনার নিজস্ব শূন্য খাতার ওপর কোনো প্রভাব পড়বে না
                    </span>
                  </div>
                </div>

                <div className="w-full lg:w-[480px] bg-background rounded-2xl p-3 shadow-inner space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-border">
                    <span className="font-semibold text-label-lg text-foreground font-semibold flex items-center gap-1">
                      <Icon
                        name="receipt_long"
                        className="text-primary text-[18px]"
                      />
                      নমুনা খতিয়ান প্রিভিউ
                    </span>
                    <span
                      className={`text-label-md font-medium px-1 py-0.5 rounded-full ${
                        demo
                          ? "bg-settled-bg text-secondary"
                          : "bg-surface-muted text-foreground-muted"
                      }`}
                    >
                      {demo ? "নমুনা ডেমো সক্রিয়" : "অ্যাক্টিভেশন সিমুলেশন"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="p-2 rounded-2xl bg-surface flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-2xl bg-due-bg flex items-center justify-center text-primary font-bold text-label-md">
                          হা
                        </div>
                        <div>
                          <div className="font-semibold text-label-lg text-foreground font-semibold">
                            হাজী কামাল উদ্দিন
                          </div>
                          <div className="font-medium text-label-md text-foreground-muted">
                            আজ বিকাল ৪:২০ • চাল ও সয়াবিন
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-label-lg text-primary font-bold font-mono">
                          ৳ ২,৪৫০ বাকি
                        </span>
                        <span className="block text-label-md font-medium text-secondary">
                          হোয়াটসঅ্যাপ প্রেরিত
                        </span>
                      </div>
                    </div>
                    <div className="p-2 rounded-2xl bg-surface flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-settled-bg flex items-center justify-center text-secondary font-bold text-label-md">
                          তা
                        </div>
                        <div>
                          <div className="font-semibold text-label-lg text-foreground font-semibold">
                            তারেক মাস্টার
                          </div>
                          <div className="font-medium text-label-md text-foreground-muted">
                            গতকাল • নগদ পরিশোধ
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-label-lg text-secondary font-bold font-mono">
                          ৳ ৫০০ জমা
                        </span>
                        <span className="block text-label-md font-medium text-foreground-muted">
                          হিসাব ক্লিয়ার
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-1 text-center font-medium text-label-md text-foreground-muted bg-surface-hover/60 rounded-lg">
                    👆 ডেমো চালু করলে এই খতিয়ান অনুযায়ী লাইভ ব্যালেন্স দেখতে
                    পাবেন
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Trust & support row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-surface rounded-2xl p-4 flex flex-col justify-between shadow-sm border border-border/30 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-settled-bg flex items-center justify-center text-secondary shrink-0 shadow-sm">
                    <Icon name="verified_user" className="text-[24px]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-title-lg font-bold text-foreground">
                      ব্যাংক-গ্রেড ২৫৬-বিট নিরাপত্তা
                    </h4>
                    <p className="font-normal text-body-md text-foreground-muted leading-relaxed">
                      আপনার দোকানের সকল বাকি ও ক্যাশের হিসাব সম্পূর্ণ ব্যক্তিগত
                      ও সামরিক গ্রেড এনক্রিপশনে সুরক্ষিত।
                    </p>
                  </div>
                </div>
                <div className="pt-3 flex items-center gap-1.5 text-secondary font-medium text-label-md font-semibold">
                  <Icon name="lock" className="text-[18px]" />
                  <span>শতভাগ নিরাপদ ও সুরক্ষিত লেজার</span>
                </div>
              </div>

              <QuickEntryCard onTry={openQuickEntry} bordered />

              <div className="bg-surface rounded-2xl p-4 flex flex-col justify-between shadow-sm border border-border/30 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-rolling-bg flex items-center justify-center text-tertiary shrink-0 shadow-sm">
                    <Icon name="support_agent" className="text-[24px]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-title-lg font-bold text-foreground">
                      ২৪/৭ মার্চেন্ট হেল্পলাইন ও সহায়তা
                    </h4>
                    <p className="font-normal text-body-md text-foreground-muted leading-relaxed">
                      যেকোনো সমস্যায় কল করুন আমাদের টোল-ফ্রি মার্চেন্ট
                      হেল্পলাইনে অথবা সরাসরি হোয়াটসঅ্যাপ চ্যাটে যোগাযোগ করুন।
                    </p>
                  </div>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <span className="font-semibold text-label-lg font-bold text-primary font-mono">
                    হটলাইন: ১৬২৬৩
                  </span>
                  <button
                    onClick={openVideoHelp}
                    className="px-3 py-1.5 rounded-full bg-surface-muted hover:bg-surface-muted text-foreground font-medium text-label-md transition-colors inline-flex items-center gap-1"
                  >
                    <Icon
                      name="headset_mic"
                      className="text-[16px] text-tertiary"
                    />
                    সরাসরি সহায়তা
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------- DOKAN VIEW -------------------------- */}
        {view === "dokan" && (
          <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <div className="bg-surface rounded-2xl p-3 lg:p-4 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-lg bg-primary-hover flex items-center justify-center overflow-hidden shadow-sm">
                    <Icon
                      name="store"
                      className="text-on-primary text-[36px]"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center text-on-secondary text-[12px] shadow-sm">
                    ✓
                  </span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1">
                    <h1 className="font-bold text-headline-md text-foreground">
                      {shopName} • মূল খতিয়ান
                    </h1>
                    <span className="bg-settled-bg text-settled-fg px-1 py-0.5 rounded-full font-medium text-label-md font-semibold">
                      দোকান সক্রিয়
                    </span>
                  </div>
                  <p className="font-normal text-body-md text-foreground-muted mt-0.5">
                    দৈনিক বেচাকেনা, বাকির খাতা ও সরাসরি হোয়াটসঅ্যাপ আদায়
                    কেন্দ্র
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full lg:w-auto lg:justify-end">
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-label-lg shadow-sm hover:shadow-md hover:bg-primary-hover transition-all"
                >
                  <Icon name="person_add" className="text-[18px]" />+ কাস্টমার
                  যোগ করুন
                </button>
                <button
                  onClick={() => switchView("welcome")}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-surface-muted hover:bg-surface-hover text-foreground font-semibold text-label-lg transition-colors"
                >
                  <Icon name="arrow_back" className="text-[18px]" />
                  সেটআপ গাইডে ফিরুন
                </button>
              </div>
            </div>

            {/* Financial metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  l: "মোট বর্তমান বাকি",
                  i: "payments",
                  w: "bg-due-bg text-primary",
                  v: "৳ ১৯,৮৫০",
                  vc: "text-primary",
                  n: "১২ জন গ্রাহকের কাছে পাওনা",
                  nc: "text-primary",
                },
                {
                  l: "আজকের আদায়/জমা",
                  i: "price_check",
                  w: "bg-settled-bg text-secondary",
                  v: "৳ ৪,২০০",
                  vc: "text-secondary",
                  n: "৫ জন থেকে সংগৃহীত",
                  nc: "text-secondary",
                },
                {
                  l: "আজকের ক্যাশ বিক্রি",
                  i: "point_of_sale",
                  w: "bg-rolling-bg text-tertiary",
                  v: "৳ ৮,৫৫০",
                  vc: "text-foreground",
                  n: "ক্যাশ কাউন্টারে জমা",
                  nc: "text-foreground-muted",
                },
                {
                  l: "জরুরি তাগাদা তালিকা",
                  i: "schedule",
                  w: "bg-surface-muted text-primary",
                  v: "৩ জন",
                  vc: "text-foreground",
                  n: "৭ দিনের বেশি বাকি",
                  nc: "text-tertiary",
                },
              ].map((m) => (
                <div
                  key={m.l}
                  className="bg-surface rounded-2xl p-3 shadow-sm border border-border/30"
                >
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-semibold text-label-lg text-foreground-muted">
                      {m.l}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${m.w}`}
                    >
                      <Icon name={m.i} className="text-[20px]" />
                    </div>
                  </div>
                  <div
                    className={`font-extrabold text-metric-xl font-mono ${m.vc}`}
                  >
                    {m.v}
                  </div>
                  <div className={`mt-1 font-medium text-label-md ${m.nc}`}>
                    {m.n}
                  </div>
                </div>
              ))}
            </div>

            {/* Customer ledger */}
            <div className="bg-surface rounded-2xl p-4 shadow-sm space-y-3 border border-border/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-border">
                <div>
                  <h3 className="font-bold text-headline-md text-foreground">
                    দোকানের গ্রাহক বাকি খতিয়ান
                  </h3>
                  <p className="font-medium text-label-md text-foreground-muted">
                    সরাসরি হোয়াটসঅ্যাপ মেসেজ পাঠিয়ে টাকা আদায় করুন
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-semibold text-label-lg inline-flex items-center gap-1 shadow-sm"
                >
                  <Icon name="add" className="text-[16px]" />
                  নতুন খতিয়ান
                </button>
              </div>

              <div className="space-y-1">
                {CUSTOMERS.map((c, idx) => (
                  <div
                    key={c.name}
                    className="p-3 rounded-lg bg-background flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-surface-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-semibold ${c.avatar}`}
                      >
                        {c.initial}
                      </div>
                      <div>
                        <div className="font-semibold text-title-lg text-foreground font-bold">
                          {c.name}{" "}
                          <span className="font-medium text-label-md font-mono text-foreground-muted">
                            {c.phone}
                          </span>
                        </div>
                        <div className="font-normal text-body-md text-foreground-muted">
                          {c.note}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="font-extrabold text-[20px] text-primary font-mono font-bold block">
                          {c.amount}
                        </span>
                        <span
                          className={`font-medium text-label-md ${c.tagClass}`}
                        >
                          {c.tag}
                        </span>
                      </div>
                      <SmsButton
                        status={sms[`row${idx}`]}
                        onSend={() => sendSms(`row${idx}`)}
                        small
                        className="px-3 py-2 rounded-full bg-secondary text-on-secondary font-medium text-label-md inline-flex items-center gap-1 shadow-sm transition-all hover:brightness-110"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================ FOOTER ============================ */}
      <footer className="w-full bg-background shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-foreground-muted sm:px-6 md:flex-row lg:px-8">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <div className="flex items-center gap-1">
              <Icon
                name="verified_user"
                className="text-secondary text-[20px]"
              />
              <span className="font-normal text-body-md">
                ব্যাংক-গ্রেড ২৫৬-বিট এনক্রিপশন গ্যারান্টি
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="cloud_done" className="text-secondary text-[20px]" />
              <span className="font-normal text-body-md">
                ২৪/৭ ক্লাউড অটো-সিঙ্ক ও সুরক্ষিত ব্যাকআপ
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4">
            <div className="flex items-center gap-1">
              <Icon name="support_agent" className="text-primary text-[20px]" />
              <span className="font-medium text-body-md text-foreground">
                মার্চেন্ট হেল্পলাইন: ১৬২৬৩
              </span>
            </div>
            <div className="font-medium text-label-md">
              © ২০২৫ বাকি খাতা সর্বস্বত্ব সংরক্ষিত
            </div>
          </div>
        </div>
      </footer>

      {/* ======================= ADD-CUSTOMER MODAL ===================== */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/40 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-surface rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-due-bg flex items-center justify-center">
                  <Icon
                    name="person_add"
                    className="text-primary text-[22px]"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-headline-md text-foreground">
                    প্রথম কাস্টমার নিবন্ধন
                  </h3>
                  <p className="font-medium text-label-md text-foreground-muted">
                    মাত্র ৩০ সেকেন্ডে খতিয়ান তৈরি করুন
                  </p>
                </div>
              </div>
              <button
                aria-label="বন্ধ করুন"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-muted hover:bg-surface-muted flex items-center justify-center text-foreground-muted"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <div className="pt-3 space-y-3">
              <div>
                <label className="block font-semibold text-label-lg text-foreground mb-1">
                  গ্রাহকের পূর্ণ নাম <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Icon
                    name="badge"
                    className="absolute left-3 top-3 text-foreground-muted text-[20px]"
                  />
                  <input
                    className={INPUT}
                    placeholder="উদাঃ কামরুল ইসলাম"
                    type="text"
                    value={cust.name}
                    onChange={(e) => setCust({ ...cust, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-label-lg text-foreground mb-1">
                  মোবাইল নম্বর (এসএমএস ট্র্যাকিংয়ের জন্য){" "}
                  <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Icon
                    name="smartphone"
                    className="absolute left-3 top-3 text-foreground-muted text-[20px]"
                  />
                  <input
                    className={INPUT}
                    placeholder="০১XXXXXXXXX"
                    type="tel"
                    value={cust.phone}
                    onChange={(e) =>
                      setCust({ ...cust, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-label-lg text-foreground mb-1">
                  পূর্বের কোনো পুরোনো বাকি আছে? (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <Icon
                    name="payments"
                    className="absolute left-3 top-3 text-foreground-muted text-[20px]"
                  />
                  <input
                    className={INPUT}
                    placeholder="৳ ০"
                    type="number"
                    value={cust.balance}
                    onChange={(e) =>
                      setCust({ ...cust, balance: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="p-2 bg-settled-bg/70 rounded-lg flex items-start gap-1">
                <Icon
                  name="chat"
                  className="text-secondary text-[20px] mt-0.5"
                />
                <p className="font-medium text-label-md text-settled-fg leading-tight">
                  কাস্টমার যুক্ত হওয়ার সাথে সাথে সরাসরি হোয়াটসঅ্যাপে ওয়েলকাম
                  মেসেজ ও হিসাবের খতিয়ান লিংক পাঠানো যাবে।
                </p>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-full bg-surface-muted hover:bg-surface-muted text-foreground-muted font-semibold text-label-lg transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={saveCustomer}
                  className="flex-1 py-3 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-semibold text-label-lg transition-all shadow-md"
                >
                  সংরক্ষণ ও খাতা শুরু
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================= TOAST ============================ */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-[90vw] bg-secondary text-on-secondary px-4 py-2 rounded-full shadow-xl font-semibold text-label-lg flex items-center gap-1"
        >
          <Icon name="info" className="text-[18px] text-due-fg" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quick-entry card (appears twice in the original layout)             */
/* ------------------------------------------------------------------ */

function QuickEntryCard({
  onTry,
  bordered = false,
}: {
  onTry: () => void;
  bordered?: boolean;
}) {
  return (
    <div
      className={`bg-surface rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden hover:shadow-md transition-shadow ${
        bordered ? "border border-border/30" : ""
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="w-8 h-8 rounded-full bg-surface-muted text-foreground flex items-center justify-center font-bold text-label-lg">
            ২
          </span>
          <span className="px-1 py-0.5 rounded-full bg-rolling-bg text-rolling-fg font-medium text-label-md font-semibold">
            স্মার্ট ফিচার
          </span>
        </div>
        <div className="space-y-1 pt-1">
          <h3 className="font-semibold text-title-lg text-foreground">
            দ্রুত লিখে বাকি যোগ
          </h3>
          <p className="font-normal text-body-md text-foreground-muted">
            সহজ কুইক এন্ট্রি দিয়ে মাত্র কয়েক সেকেন্ডে পণ্য বা টাকার অংক দ্রুত
            হিসাবভুক্ত করুন।
          </p>
        </div>
        <div className="p-2 bg-background rounded-lg space-y-1 text-center">
          <span className="font-medium text-label-md text-foreground-muted block">
            উদাহরণ বাক্য:
          </span>
          <span className="font-mono text-label-md text-primary font-semibold block">
            “করিম চা-বিস্কুট বাকি ৫০ টাকা”
          </span>
        </div>
      </div>
      <div className="pt-4">
        <button
          onClick={onTry}
          className="w-full py-3 rounded-full bg-surface-muted hover:bg-surface-hover text-foreground font-semibold text-label-lg flex items-center justify-center gap-1.5 transition-colors"
        >
          <Icon name="edit_note" className="text-primary text-[18px]" />
          কুইক এন্ট্রি পরখ করুন
        </button>
      </div>
    </div>
  );
}
