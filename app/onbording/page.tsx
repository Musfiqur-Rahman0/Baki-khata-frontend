"use client";

import { useCallback, useEffect, useState } from "react";
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
import { AccountMenu } from "@/components/account-menu";
import { SessionGate } from "@/components/auth/session-gate";
import { BUSINESS_TYPE_LABELS } from "@/features/auth/authSlice";
import {
  createCustomerRecord,
  fetchAllCustomers,
  type CustomerWithBalance,
} from "@/features/customers/customerSlice";
import {
  createTransactionRecord,
  fetchAllTransactions,
} from "@/features/transactions/transactionSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

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
  label,
}: {
  status?: "sending" | "done";
  onSend: () => void;
  className: string;
  small?: boolean;
  label?: string;
}) {
  const size = small ? "text-[16px]" : "text-[18px]";

  return (
    <button
      type="button"
      disabled={!!status}
      onClick={onSend}
      className={`${className} ${status === "done" ? "!bg-primary" : ""} cursor-pointer `}
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
          : (label ?? "হোয়াটসঅ্যাপ তাগাদা পাঠান")}
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

type OnboardingCustomer = {
  id: string;
  name: string;
  phone: string;
  due: number;
  note: string;
};

const DEMO_CUSTOMERS: OnboardingCustomer[] = [
  {
    id: "demo-kamal",
    name: "হাজী কামাল উদ্দিন",
    phone: "০১৮১৭-XXXXXX",
    note: "শেষ কেনাকাটা: গতকাল (চাল, তেল ও ডাল)",
    due: 3450,
  },
  {
    id: "demo-tarek",
    name: "তারেক মাস্টার",
    phone: "০১৯১২-XXXXXX",
    note: "আজ সকালে ১,০০০ টাকা পরিশোধ করেছেন",
    due: 1150,
  },
  {
    id: "demo-mostafa",
    name: "মোস্তফা ড্রাইভার",
    phone: "০১৭৫৫-XXXXXX",
    note: "শেষ এন্ট্রি: ৪ দিন আগে (চা-নাশতা)",
    due: 620,
  },
];

const DEMO_PAYMENT_TODAY = 8550;

const formatTaka = (amount: number) =>
  `৳ ${amount.toLocaleString("bn-BD", { maximumFractionDigits: 2 })}`;

function mapCustomers(customers: CustomerWithBalance[]): OnboardingCustomer[] {
  return customers.map(({ customer, balance }) => ({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    due: Number(balance.due) || 0,
    note: customer.note || "খতিয়ান সক্রিয়",
  }));
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function OnboardingPage() {
  return (
    <SessionGate>
      <OnboardingContent />
    </SessionGate>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const shopName = user?.shopName ?? "আপনার দোকান";
  const ownerName = user?.name ?? "দোকানদার";
  const businessType = user
    ? BUSINESS_TYPE_LABELS[user.businessType]
    : "ব্যবসার ধরন";
  const merchantCode = user?.id.slice(0, 6).toUpperCase() ?? "------";
  const [view, setView] = useState<View>("welcome");
  const [modalOpen, setModalOpen] = useState(false);
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const [demo, setDemo] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [demoCustomers, setDemoCustomers] =
    useState<OnboardingCustomer[]>(DEMO_CUSTOMERS);
  const [liveCustomers, setLiveCustomers] = useState<OnboardingCustomer[]>([]);
  const [demoPaymentToday, setDemoPaymentToday] = useState(DEMO_PAYMENT_TODAY);
  const [livePaymentToday, setLivePaymentToday] = useState(0);
  const [demoTransactionCount, setDemoTransactionCount] = useState(2);
  const [liveTransactionCount, setLiveTransactionCount] = useState(0);
  const [reminderSent, setReminderSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [cust, setCust] = useState({ name: "", phone: "" });
  const [quickEntry, setQuickEntry] = useState({
    customerId: DEMO_CUSTOMERS[0]?.id ?? "",
    type: "CREDIT" as "CREDIT" | "PAYMENT",
    amount: "",
    note: "",
  });
  const customers = user ? liveCustomers : demoCustomers;
  const paymentToday = user ? livePaymentToday : demoPaymentToday;
  const transactionCount = user ? liveTransactionCount : demoTransactionCount;
  const dataLoading = useAppSelector(
    (state) => state.customers.loading || state.transactions.loading,
  );

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const refreshLiveData = useCallback(async () => {
    const [customerResult, transactionResult] = await Promise.all([
      dispatch(fetchAllCustomers()).unwrap(),
      dispatch(fetchAllTransactions()).unwrap(),
    ]);
    setLiveCustomers(mapCustomers(customerResult));
    setLiveTransactionCount(transactionResult.length);
    const today = new Date().toDateString();
    setLivePaymentToday(
      transactionResult
        .filter(
          (transaction) =>
            transaction.type === "PAYMENT" &&
            new Date(transaction.date).toDateString() === today,
        )
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    );
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;

    const timeout = window.setTimeout(() => {
      void refreshLiveData().catch((error: unknown) => {
        setDataError(
          typeof error === "string"
            ? error
            : error instanceof Error
              ? error.message
              : "দোকানের তথ্য লোড করা যায়নি",
        );
      });
    });

    return () => {
      window.clearTimeout(timeout);
    };
  }, [refreshLiveData, user]);

  const switchView = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveCustomer = async () => {
    const name = cust.name.trim();
    const phone = cust.phone.trim();
    if (!name) return notify("দয়া করে গ্রাহকের নাম লিখুন");
    if (!phone) return notify("দয়া করে গ্রাহকের মোবাইল নম্বর লিখুন");

    setSaving(true);
    try {
      if (user) {
        await dispatch(createCustomerRecord({ name, phone })).unwrap();
        await refreshLiveData();
      } else {
        setDemoCustomers((previous) => [
          {
            id: `demo-${Date.now()}`,
            name,
            phone,
            due: 0,
            note: "ডেমো খাতায় সদ্য যুক্ত",
          },
          ...previous,
        ]);
      }

      setModalOpen(false);
      notify(
        user
          ? `${name} খাতায় যুক্ত হয়েছেন`
          : `${name} ডেমো খাতায় যুক্ত হয়েছেন (শুধু এই পেজে)`,
      );
      setCust({ name: "", phone: "" });
    } catch (error) {
      notify(
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "গ্রাহক যোগ করা যায়নি",
      );
      if (user) {
        await refreshLiveData().catch(() => {
          setDataError("তথ্য সংরক্ষিত হয়েছে কি না যাচাই করা যায়নি");
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const saveQuickEntry = async () => {
    const amount = Number(
      quickEntry.amount.replace(/[০-৯]/g, (digit) =>
        String("০১২৩৪৫৬৭৮৯".indexOf(digit)),
      ),
    );
    const target = customers.find(
      (customer) => customer.id === quickEntry.customerId,
    );
    if (!target) return notify("গ্রাহক নির্বাচন করুন");
    if (!Number.isFinite(amount) || amount <= 0) {
      return notify("সঠিক টাকার পরিমাণ লিখুন");
    }
    if (quickEntry.type === "PAYMENT" && amount > target.due) {
      return notify("জমার পরিমাণ বর্তমান বকেয়ার চেয়ে বেশি হতে পারে না");
    }

    setSaving(true);
    try {
      if (user) {
        await dispatch(
          createTransactionRecord({
            customerId: target.id,
            type: quickEntry.type,
            amount,
            note: quickEntry.note.trim() || undefined,
          }),
        ).unwrap();
        await refreshLiveData();
      } else {
        setDemoCustomers((previous) =>
          previous.map((customer) =>
            customer.id !== target.id
              ? customer
              : {
                  ...customer,
                  due:
                    customer.due +
                    (quickEntry.type === "CREDIT" ? amount : -amount),
                  note: quickEntry.note.trim() || "ডেমো লেনদেন যোগ হয়েছে",
                },
          ),
        );
        if (quickEntry.type === "PAYMENT") {
          setDemoPaymentToday((previous) => previous + amount);
        }
        setDemoTransactionCount((previous) => previous + 1);
      }

      setQuickEntryOpen(false);
      notify(
        user
          ? "লেনদেন খাতায় সংরক্ষণ করা হয়েছে"
          : "ডেমো লেনদেন যোগ হয়েছে (সার্ভারে সংরক্ষিত হয়নি)",
      );
      setQuickEntry((previous) => ({ ...previous, amount: "", note: "" }));
    } catch (error) {
      notify(
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "লেনদেন সংরক্ষণ করা যায়নি",
      );
      if (user) await refreshLiveData().catch(() => undefined);
    } finally {
      setSaving(false);
    }
  };

  const sendReminder = (customer: OnboardingCustomer) => {
    if (!user) {
      notify(
        "ডেমো: তাগাদার বার্তা তৈরি হয়েছে, কিন্তু কোনো বার্তা পাঠানো হয়নি।",
      );
      setReminderSent(true);
      return;
    }
    const phone = customer.phone.replace(/\D/g, "").replace(/^0/, "88");
    if (!phone) {
      notify("গ্রাহকের সঠিক মোবাইল নম্বর পাওয়া যায়নি");
      return;
    }
    const message =
      `আসসালামু আলাইকুম ${customer.name}, ${shopName}তে আপনার বর্তমান বকেয়া ` +
      `${formatTaka(customer.due)}। অনুগ্রহ করে পরিশোধ করুন। ধন্যবাদ - ${ownerName}`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setReminderSent(true);
  };

  const sendFirstReminder = () => {
    const customer = customers.find((item) => item.due > 0);
    if (!customer) {
      notify("তাগাদা পাঠানোর মতো বকেয়া খাতা নেই");
      return;
    }
    sendReminder(customer);
  };

  const openAddCustomer = () => {
    setModalOpen(true);
  };

  const openVideoHelp = () =>
    notify(
      "বাকি খাতা ২-মিনিটের ভিডিও গাইড লোড হচ্ছে। ইন্টারনেটের প্রয়োজন হবে।",
    );
  const openQuickEntry = () => {
    if (!customers.length) {
      notify("কুইক এন্ট্রির আগে একজন কাস্টমার যোগ করুন");
      setModalOpen(true);
      return;
    }
    setQuickEntry((previous) => ({
      ...previous,
      customerId: customers[0].id,
    }));
    setQuickEntryOpen(true);
  };

  const totalDue = customers.reduce(
    (total, customer) => total + customer.due,
    0,
  );
  const owingCustomers = customers.filter(
    (customer) => customer.due > 0,
  ).length;
  const demoView = !user;
  const completedSteps =
    Number(customers.length > 0) +
    Number(transactionCount > 0) +
    Number(reminderSent);
  const setupProgress = Math.round((completedSteps / 3) * 100);

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
              className={`cursor-pointer ${view === "welcome" ? NAV_ACTIVE : NAV_IDLE}`}
            >
              স্বাগতম ও সেটআপ
            </button>
            <button
              onClick={() => router.push("/store")}
              className={`cursor-pointer ${NAV_IDLE}`}
            >
              <Icon name="storefront" className="text-[18px]" />
              <span>আমার দোকানে যান</span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="hidden flex-col text-right sm:flex">
                <span className="text-label-lg font-semibold text-foreground">
                  {shopName}
                </span>
                <span className="text-label-md font-medium text-secondary">
                  {ownerName}
                </span>
              </div>
              <AccountMenu />
            </div>
          </div>
        </div>
      </header>

      {/* ============================ MAIN ============================== */}
      <main className="w-full flex-1 bg-background">
        {/* ------------------------- WELCOME VIEW ------------------------- */}
        {view === "welcome" && (
          <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {demoView && (
              <div className="rounded-xl border border-rolling-fg/20 bg-rolling-bg px-4 py-3 text-sm font-semibold text-rolling-fg">
                ডেমো মোড: এখানে যোগ করা গ্রাহক ও লেনদেন শুধু এই পেজে থাকবে; কোনো
                তথ্য সার্ভারে পাঠানো হবে না।
              </div>
            )}
            {dataError && user && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-due-bg px-4 py-3 text-sm text-primary">
                <span>{dataError}</span>
                <button
                  type="button"
                  onClick={() => {
                    setDataError(null);
                    refreshLiveData().catch((error: unknown) => {
                      setDataError(
                        error instanceof Error
                          ? error.message
                          : "দোকানের তথ্য লোড করা যায়নি",
                      );
                    });
                  }}
                  className="cursor-pointer font-semibold underline"
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            )}
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
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        demoView ? "text-tertiary" : "text-secondary"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          demoView
                            ? "bg-tertiary"
                            : "bg-secondary animate-pulse"
                        }`}
                      />
                      {demoView
                        ? "লোকাল ডেমো (সার্ভারে সংযুক্ত নয়)"
                        : dataLoading
                          ? "দোকানের তথ্য লোড হচ্ছে..."
                          : "ক্লাউড সিঙ্ক চালু"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full lg:w-auto lg:justify-end sm:justify-end">
                <button
                  onClick={openAddCustomer}
                  className="cursor-pointer 
                   flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-label-lg shadow-sm hover:shadow-md hover:bg-primary-hover transition-all"
                >
                  <Icon name="person_add" className="text-[18px]" />+ কাস্টমার
                  যোগ করুন
                </button>
                <button
                  onClick={() => router.push("/store")}
                  className="cursor-pointer  flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-surface-muted hover:bg-surface-hover text-foreground font-semibold text-label-lg transition-colors"
                >
                  <Icon
                    name="storefront"
                    className="text-primary text-[18px]"
                  />
                  আমার দোকানে যান
                </button>
                <button
                  onClick={openVideoHelp}
                  className="cursor-pointer  inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-surface-muted hover:bg-surface-muted text-foreground-muted font-semibold text-label-lg transition-colors"
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
                        দোকান খাতা সেটআপ: {completedSteps}/৩ ধাপ সম্পন্ন
                      </span>
                      <span className="font-mono text-primary font-bold">
                        {setupProgress.toLocaleString("bn-BD")}%
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-surface-hover overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                        style={{ width: `${setupProgress}%` }}
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
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-label-lg ${
                        customers.length > 0
                          ? "bg-secondary text-on-secondary"
                          : "bg-primary text-on-primary"
                      }`}
                    >
                      {customers.length > 0 ? "✓" : "১"}
                    </span>
                    <span className="px-1 py-0.5 rounded-full bg-due-bg text-due-fg font-medium text-label-md font-bold uppercase">
                      প্রথম করণীয়
                    </span>
                  </div>
                  <div className="space-y-1 pt-1">
                    <h3 className="font-semibold text-title-lg text-foreground">
                      {customers.length > 0
                        ? "কাস্টমার খাতায় যুক্ত হয়েছে"
                        : "প্রথম বাকি কাস্টমার যুক্ত করুন"}
                    </h3>
                    <p className="font-normal text-body-md text-foreground-muted">
                      নাম ও মোবাইল নম্বর দিয়ে প্রথম কাস্টমার তৈরি করুন।
                      লেনদেনের তথ্য পরের ধাপে যোগ হবে।
                    </p>
                  </div>
                  <div className="p-2 bg-background rounded-lg flex items-center gap-1 text-foreground-muted font-medium text-label-md">
                    <Icon
                      name="verified"
                      className="text-primary text-[18px]"
                    />
                    {customers.length > 0
                      ? `${customers.length.toLocaleString("bn-BD")} জন কাস্টমার খাতায় আছে`
                      : "কোনো অ্যাপ ছাড়াই কাস্টমার দেখতে পাবে"}
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    onClick={openAddCustomer}
                    className="cursor-pointer  w-full py-3 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-semibold text-label-lg flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Icon name="add_circle" className="text-[18px]" />
                    {customers.length > 0
                      ? "আরও কাস্টমার যোগ করুন"
                      : "+ কাস্টমার যোগ করুন"}
                  </button>
                </div>
              </div>

              {/* Card 2 */}
              <QuickEntryCard
                onTry={openQuickEntry}
                completed={transactionCount > 0}
              />

              {/* Card 3 */}
              <div className="bg-surface rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-label-lg ${
                        reminderSent
                          ? "bg-secondary text-on-secondary"
                          : "bg-surface-muted text-foreground"
                      }`}
                    >
                      {reminderSent ? "✓" : "৩"}
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
                    onSend={sendFirstReminder}
                    status={reminderSent ? "done" : undefined}
                    label={
                      reminderSent
                        ? "তাগাদা সম্পন্ন"
                        : "হোয়াটসঅ্যাপ তাগাদা পাঠান"
                    }
                    className="cursor-pointer w-full py-3 rounded-full bg-secondary text-on-secondary font-semibold text-label-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm hover:brightness-110"
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
                {METRICS.map((m, index) => {
                  const liveMetrics = [
                    {
                      value: formatTaka(totalDue),
                      note: `${owingCustomers} জন গ্রাহকের কাছে বকেয়া`,
                    },
                    {
                      value: `${customers.length.toLocaleString("bn-BD")} জন`,
                      note: "খাতায় থাকা গ্রাহক",
                    },
                    {
                      value: `${owingCustomers.toLocaleString("bn-BD")} জন`,
                      note: "বকেয়া থাকা গ্রাহক",
                    },
                    {
                      value: formatTaka(paymentToday),
                      note: user ? "আজকের আদায়" : "ডেমো দিনের জমা",
                    },
                  ];
                  const d = {
                    ...m.empty,
                    ...liveMetrics[index],
                  };
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
                      className={`cursor-pointer  inline-flex items-center gap-2 px-4 py-3 rounded-full text-on-secondary font-semibold text-label-lg transition-all shadow-md ${
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
                      className="cursor-pointer  inline-flex items-center gap-2 px-4 py-3 rounded-full border border-border bg-background text-foreground font-semibold text-label-lg transition-colors hover:bg-surface-muted"
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

              {/* <QuickEntryCard onTry={openQuickEntry} bordered /> */}

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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------- DOKAN VIEW -------------------------- */}
        {view === "dokan" && (
          <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {demoView && (
              <div className="rounded-xl border border-rolling-fg/20 bg-rolling-bg px-4 py-3 text-sm font-semibold text-rolling-fg">
                ডেমো মোড: এখানে যোগ করা গ্রাহক ও লেনদেন শুধু এই পেজে থাকবে; কোনো
                তথ্য সার্ভারে পাঠানো হবে না।
              </div>
            )}
            {dataLoading && user && (
              <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-foreground-muted">
                দোকানের তথ্য লোড হচ্ছে...
              </div>
            )}
            {dataError && user && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-due-bg px-4 py-3 text-sm text-primary">
                <span>{dataError}</span>
                <button
                  type="button"
                  onClick={() => {
                    setDataError(null);
                    refreshLiveData().catch((error: unknown) => {
                      setDataError(
                        error instanceof Error
                          ? error.message
                          : "দোকানের তথ্য লোড করা যায়নি",
                      );
                    });
                  }}
                  className="cursor-pointer font-semibold underline"
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            )}
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
                  onClick={openAddCustomer}
                  className="cursor-pointer  flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-label-lg shadow-sm hover:shadow-md hover:bg-primary-hover transition-all"
                >
                  <Icon name="person_add" className="text-[18px]" />+ কাস্টমার
                  যোগ করুন
                </button>
                <button
                  onClick={() => switchView("welcome")}
                  className="cursor-pointer  inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-surface-muted hover:bg-surface-hover text-foreground font-semibold text-label-lg transition-colors"
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
                  v: formatTaka(totalDue),
                  vc: "text-primary",
                  n: `${owingCustomers.toLocaleString("bn-BD")} জন গ্রাহকের কাছে পাওনা`,
                  nc: "text-primary",
                },
                {
                  l: "আজকের আদায়/জমা",
                  i: "price_check",
                  w: "bg-settled-bg text-secondary",
                  v: formatTaka(paymentToday),
                  vc: "text-secondary",
                  n: user ? "আজকের জমা" : "ডেমো দিনের জমা",
                  nc: "text-secondary",
                },
                {
                  l: "খাতার গ্রাহক সংখ্যা",
                  i: "schedule",
                  w: "bg-surface-muted text-primary",
                  v: `${customers.length.toLocaleString("bn-BD")} জন`,
                  vc: "text-foreground",
                  n: "সক্রিয় খাতার গ্রাহক",
                  nc: "text-foreground-muted",
                },
                {
                  l: "বকেয়া থাকা গ্রাহক",
                  i: "notification_important",
                  w: "bg-rolling-bg text-tertiary",
                  v: `${owingCustomers.toLocaleString("bn-BD")} জন`,
                  vc: "text-tertiary",
                  n: "বর্তমানে বকেয়া আছে",
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
                  onClick={openAddCustomer}
                  className="cursor-pointer  px-3 py-1.5 rounded-full bg-primary text-on-primary font-semibold text-label-lg inline-flex items-center gap-1 shadow-sm"
                >
                  <Icon name="add" className="text-[16px]" />
                  নতুন খতিয়ান
                </button>
              </div>

              <div className="space-y-1">
                {customers.length === 0 ? (
                  <p className="rounded-xl bg-background p-6 text-center text-sm text-foreground-muted">
                    {dataLoading
                      ? "গ্রাহকের খাতা লোড হচ্ছে..."
                      : "এখনো কোনো গ্রাহক যোগ করা হয়নি। নতুন খতিয়ান তৈরি করুন।"}
                  </p>
                ) : (
                  customers.map((c, idx) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-background flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-surface-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-semibold ${
                            idx % 3 === 0
                              ? "bg-due-bg text-primary"
                              : idx % 3 === 1
                                ? "bg-settled-bg text-secondary"
                                : "bg-rolling-bg text-tertiary"
                          }`}
                        >
                          {c.name.slice(0, 1)}
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
                            {formatTaka(c.due)} بাকি
                          </span>
                          <span
                            className={`font-medium text-label-md ${
                              c.due > 0 ? "text-primary" : "text-secondary"
                            }`}
                          >
                            {c.due > 0 ? "বকেয়া আছে" : "বকেয়া নেই"}
                          </span>
                        </div>
                        <SmsButton
                          onSend={() => sendReminder(c)}
                          small
                          className="cursor-pointer  px-3 py-2 rounded-full bg-secondary text-on-secondary font-medium text-label-md inline-flex items-center gap-1 shadow-sm transition-all hover:brightness-110"
                        />
                      </div>
                    </div>
                  ))
                )}
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
                    কাস্টমার খাতায় যুক্ত করুন
                  </h3>
                  <p className="font-medium text-label-md text-foreground-muted">
                    এই ধাপে শুধু কাস্টমারের পরিচিতি সংরক্ষণ হবে
                  </p>
                </div>
              </div>
              <button
                aria-label="বন্ধ করুন"
                onClick={() => setModalOpen(false)}
                className="cursor-pointer  w-8 h-8 rounded-full bg-surface-muted hover:bg-surface-muted flex items-center justify-center text-foreground-muted"
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
                    onChange={(e) =>                     setCust((current) => ({ ...current, name: e.target.value }))}
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
                      setCust((current) => ({
                        ...current,
                        phone: e.target.value,
                      }))
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
                  কাস্টমার যোগ হলে পরের ধাপে বাকি (Credit) বা জমা (Debit)
                  লেনদেন আলাদাভাবে যোগ করুন।
                </p>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                  className="cursor-pointer flex-1 py-3 rounded-full bg-surface-muted hover:bg-surface-muted text-foreground-muted font-semibold text-label-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={saveCustomer}
                  className="cursor-pointer flex-1 py-3 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-semibold text-label-lg transition-all shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "সংরক্ষণ হচ্ছে..." : "কাস্টমার সংরক্ষণ করুন"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {quickEntryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/40 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!saving) setQuickEntryOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-entry-title"
            className="relative w-full max-w-lg rounded-2xl bg-surface p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <h2
                  id="quick-entry-title"
                  className="font-bold text-headline-md text-foreground"
                >
                  দ্রুত লেনদেন যোগ
                </h2>
                <p className="font-medium text-label-md text-foreground-muted">
                  {user
                    ? "এই লেনদেন আপনার সার্ভার খাতায় সংরক্ষিত হবে।"
                    : "ডেমো লেনদেন শুধু এই পেজে থাকবে; সার্ভারে যাবে না।"}
                </p>
              </div>
              <button
                type="button"
                aria-label="বন্ধ করুন"
                disabled={saving}
                onClick={() => setQuickEntryOpen(false)}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface-muted text-foreground-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="quick-entry-customer"
                  className="mb-1 block font-semibold text-label-lg text-foreground"
                >
                  কাস্টমার
                </label>
                <select
                  id="quick-entry-customer"
                  value={quickEntry.customerId}
                  onChange={(event) =>
                    setQuickEntry({
                      ...quickEntry,
                      customerId: event.target.value,
                    })
                  }
                  className={INPUT}
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} — বকেয়া {formatTaka(customer.due)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="quick-entry-type"
                  className="mb-1 block font-semibold text-label-lg text-foreground"
                >
                  লেনদেনের ধরন
                </label>
                <select
                  id="quick-entry-type"
                  value={quickEntry.type}
                  onChange={(event) =>
                    setQuickEntry({
                      ...quickEntry,
                      type: event.target.value as "CREDIT" | "PAYMENT",
                    })
                  }
                  className={INPUT}
                >
                  <option value="CREDIT">বাকি যোগ (Credit)</option>
                  <option value="PAYMENT">জমা গ্রহণ (Debit)</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="quick-entry-amount"
                  className="mb-1 block font-semibold text-label-lg text-foreground"
                >
                  টাকার পরিমাণ
                </label>
                <input
                  id="quick-entry-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quickEntry.amount}
                  onChange={(event) =>
                    setQuickEntry({
                      ...quickEntry,
                      amount: event.target.value,
                    })
                  }
                  className={INPUT}
                  placeholder="৳ ০"
                />
              </div>
              <div>
                <label
                  htmlFor="quick-entry-note"
                  className="mb-1 block font-semibold text-label-lg text-foreground"
                >
                  বিবরণ (ঐচ্ছিক)
                </label>
                <input
                  id="quick-entry-note"
                  type="text"
                  value={quickEntry.note}
                  onChange={(event) =>
                    setQuickEntry({
                      ...quickEntry,
                      note: event.target.value,
                    })
                  }
                  className={INPUT}
                  placeholder="যেমন: চাল ও তেল"
                />
              </div>
              <button
                type="button"
                disabled={saving || customers.length === 0}
                onClick={saveQuickEntry}
                className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary py-3 font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="save" className="text-[18px]" />
                {saving ? "সংরক্ষণ হচ্ছে..." : "লেনদেন সংরক্ষণ করুন"}
              </button>
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
  completed,
  bordered = false,
}: {
  onTry: () => void;
  completed: boolean;
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
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-label-lg ${
              completed
                ? "bg-secondary text-on-secondary"
                : "bg-surface-muted text-foreground"
            }`}
          >
            {completed ? "✓" : "২"}
          </span>
          <span className="px-1 py-0.5 rounded-full bg-rolling-bg text-rolling-fg font-medium text-label-md font-semibold">
            স্মার্ট ফিচার
          </span>
        </div>
        <div className="space-y-1 pt-1">
          <h3 className="font-semibold text-title-lg text-foreground">
            {completed ? "লেনদেন খাতায় যুক্ত হয়েছে" : "প্রথম লেনদেন যোগ করুন"}
          </h3>
          <p className="font-normal text-body-md text-foreground-muted">
            কাস্টমার বেছে বাকি (Credit) যোগ করুন অথবা জমা (Debit) গ্রহণ করে
            হিসাবভুক্ত করুন।
          </p>
        </div>
        {/* <div className="p-2 bg-background rounded-lg space-y-1 text-center">
          <span className="font-medium text-label-md text-foreground-muted block">
            উদাহরণ বাক্য:
          </span>
          <span className="font-mono text-label-md text-primary font-semibold block">
            “করিম • বাকি ৫০ টাকা / জমা ৫০ টাকা”
          </span>
        </div> */}
      </div>
      <div className="pt-4">
        <button
          onClick={onTry}
          className="cursor-pointer w-full py-3 rounded-full bg-surface-muted hover:bg-surface-hover text-foreground font-semibold text-label-lg flex items-center justify-center gap-1.5 transition-colors"
        >
          <Icon name="edit_note" className="text-primary text-[18px]" />
          {completed ? "আরও লেনদেন যোগ করুন" : "প্রথম লেনদেন যোগ করুন"}
        </button>
      </div>
    </div>
  );
}
