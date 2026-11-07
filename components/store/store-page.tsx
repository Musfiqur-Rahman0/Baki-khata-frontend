"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { toast as sonnerToast } from "sonner";
import { StoreHeader } from "@/components/store/store-header";
import { StoreOverview } from "@/components/store/store-overview";
import { StorePageFooter } from "@/components/store/store-page-footer";
import { StoreTrustBar } from "@/components/store/store-trust-bar";
import { StoreWorkspace } from "@/components/store/store-workspace";
import {
  type Customer,
  type Filter,
  type FormState,
  type Mode,
  type Tx,
  type TxType,
  type View,
} from "@/components/store/store-types";
import {
  daysAgoISO,
  dueText,
  emptyForm,
  formatPhone,
  getDueSinceFromTransactions,
  intlPhone,
  listen,
  money,
  parseAmt,
  reminderText,
  statusOf,
  todayISO,
  toBn,
  toEn,
  validPhone,
} from "@/components/store/store-utils";
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
import { getQueuedTransactions, type QueuedTransaction } from "@/lib/offline";
import { useSearchParams } from "next/navigation";

const DEMO_STORAGE_KEY = "bakhi-khata:demo-customers:v1";
const DRAFT_KEY = "bakhi-khata:draft:v1";
const DEMO_DRAFT_KEY = "bakhi-khata:demo-draft:v1";

function subscribeToConnection(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getConnectionStatus() {
  return navigator.onLine;
}

function getServerConnectionStatus() {
  return true;
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
    return {
      id: customer.id,
      name: customer.name,
      phone: formatPhone(customer.phone.replace(/^\+880/, "0")),
      address: customer.address || "ঠিকানা দেওয়া হয়নি",
      creditLimit: Math.max(creditTotal, 5000),
      totalDue,
      totalCredit: Number(balance.creditTotal) || 0,
      totalPaid: Number(balance.paymentTotal) || 0,
      dueSince: totalDue > 0 ? getDueSinceFromTransactions(history) : null,
      tone: index % 4,
      notes: customer.note || "",
      history,
    };
  });
}

function addQueuedTransactions(
  customers: Customer[],
  transactions: QueuedTransaction[],
): Customer[] {
  const queuedByCustomer = new Map<string, QueuedTransaction[]>();
  for (const transaction of transactions) {
    const queued = queuedByCustomer.get(transaction.customerId) ?? [];
    queued.push(transaction);
    queuedByCustomer.set(transaction.customerId, queued);
  }

  return customers.map((customer) => {
    const queued = queuedByCustomer.get(customer.id);
    if (!queued?.length) return customer;

    let totalDue = customer.totalDue;
    let totalCredit = customer.totalCredit ?? 0;
    let totalPaid = customer.totalPaid ?? 0;
    let dueSince = customer.dueSince;
    const history = [...customer.history];

    for (const transaction of queued) {
      const amount = Number(transaction.amount) || 0;
      const date = transaction.date.slice(0, 10);
      if (transaction.type === "CREDIT") {
        totalDue += amount;
        totalCredit += amount;
        dueSince ??= date;
      } else {
        totalDue -= amount;
        totalPaid += amount;
        if (totalDue <= 0) dueSince = null;
      }
      history.push({
        id: transaction.id,
        date,
        type: transaction.type === "CREDIT" ? "due" : "paid",
        desc:
          transaction.note?.trim() ||
          (transaction.type === "CREDIT" ? "বাকি লেনদেন" : "নগদ জমা"),
        amount,
        pendingSync: true,
        syncError: transaction.syncError,
      });
    }

    history.sort((a, b) => b.date.localeCompare(a.date));
    return {
      ...customer,
      totalDue,
      totalCredit,
      totalPaid,
      dueSince,
      creditLimit: Math.max(totalCredit, customer.creditLimit),
      history,
    };
  });
}

/* ================================================================== */
/* Page                                                                */
/* ================================================================== */

function StorePageContent({ isDemo }: { isDemo: boolean }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isOnline = useSyncExternalStore(
    subscribeToConnection,
    getConnectionStatus,
    getServerConnectionStatus,
  );
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
  const [pendingTransactionCount, setPendingTransactionCount] = useState(0);
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

  const searchParams = useSearchParams();
  const remindId = searchParams.get("remind");

  const refreshStoreData = useCallback(async () => {
    const [customerResult, transactionResult, queuedTransactions] =
      await Promise.all([
        dispatch(fetchAllCustomers()).unwrap(),
        dispatch(fetchAllTransactions()).unwrap(),
        getQueuedTransactions(),
      ]);
    const mapped = addQueuedTransactions(
      mapApiCustomers(customerResult, transactionResult),
      queuedTransactions,
    );
    setPendingTransactionCount(queuedTransactions.length);
    setApiConnected(true);
    setCustomers(mapped);
    return mapped;
  }, [dispatch]);

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
        const mapped = await refreshStoreData();
        if (cancelled) return;
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
  }, [isDemo, refreshStoreData]);

  useEffect(() => {
    if (isDemo || !("serviceWorker" in navigator)) return;
    const handleWorkerMessage = (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type === "OUTBOX_SYNCED") {
        void refreshStoreData().catch((error: unknown) => {
          console.error("Could not refresh synced ledger data:", error);
        });
      } else if (event.data?.type === "OUTBOX_FAILED") {
        sonnerToast.error(
          "একটি অফলাইন লেনদেন সংরক্ষণ করা যায়নি। লেনদেনের পাশে কারণটি দেখুন।",
        );
        void refreshStoreData().catch((error: unknown) => {
          console.error("Could not refresh failed ledger data:", error);
        });
      }
    };
    navigator.serviceWorker.addEventListener("message", handleWorkerMessage);
    return () =>
      navigator.serviceWorker.removeEventListener(
        "message",
        handleWorkerMessage,
      );
  }, [isDemo, refreshStoreData]);

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

  console.log("filtered customer", filtered);

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
                      ? getDueSinceFromTransactions(history)
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
    let createdTransaction: ApiTransaction | null = null;

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
        createdTransaction = await dispatch(
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
        await refreshStoreData();

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
      await refreshStoreData();
    } catch {
      if (!createdTransaction?.pendingSync) {
        sonnerToast.info(
          "তথ্য সংরক্ষিত হয়েছে, তবে তালিকা রিফ্রেশ করা যায়নি। পেজ রিফ্রেশ করুন।",
        );
      }
    }

    if (customerId) {
      setSelectedId(customerId);
    }

    if (createdTransaction?.pendingSync) {
      if (smsWindow && !smsWindow.closed) smsWindow.close();
      sonnerToast.info(
        "লেনদেনটি ডিভাইসে অপেক্ষমাণ আছে; ইন্টারনেট এলে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।",
      );
    } else {
      notify(
        isNew
          ? `‘${form.name.trim()}’ খাতায় যুক্ত হয়েছেন`
          : form.mode === "add_due"
            ? `${money(amount)} বাকি ${target?.name ?? ""}-এর খাতায় যোগ হয়েছে`
            : `${money(amount)} জমা গৃহীত হয়েছে`,
      );
    }

    // Step 4: Preserve the existing SMS composer behavior.
    if (shouldOpenSms && !createdTransaction?.pendingSync) {
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

  useEffect(() => {
    if (!remindId || !loaded || isDemo) return;
    const target = customers.find((c) => c.id === remindId);
    if (!target) return;
    setSelectedId(target.id);
    setView("details");
    notify(`${target.name}-কে বার্তা পাঠাতে “হোয়াটসঅ্যাপে পাঠান” চাপুন`);
    window.history.replaceState(null, "", "/store"); // refresh won't repeat this
  }, [remindId, loaded, customers, isDemo, notify]);

  /* ================================================================ */

  const handleAiSaved = async () => {
    const [customerResult, transactionResult] = await Promise.all([
      dispatch(fetchAllCustomers()).unwrap(),
      dispatch(fetchAllTransactions()).unwrap(),
    ]);
    const mapped = mapApiCustomers(customerResult, transactionResult);
    setApiConnected(true);
    setCustomers(mapped);
    setSelectedId((current) =>
      mapped.some((customer) => customer.id === current)
        ? current
        : (mapped[0]?.id ?? ""),
    );
  };

  return (
    <div
      id="top"
      className="flex min-h-screen flex-col justify-between bg-background font-normal text-foreground antialiased"
    >
      <StoreHeader
        logoHref={user ? "/onbording" : "/"}
        isOnline={isOnline}
        pendingTransactionCount={pendingTransactionCount}
        ownerName={ownerName}
        phone={phone}
        onDashboard={() => {
          setView("details");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onCustomers={() => {
          searchRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          searchRef.current?.focus();
        }}
      />

      {/* ============================ MAIN ============================== */}
      <main className="w-full bg-background flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col">
          <StoreOverview
            isDemo={isDemo}
            isOnline={isOnline}
            pendingTransactionCount={pendingTransactionCount}
            shopName={shopName}
            view={view}
            apiConnected={apiConnected}
            loaded={loaded}
            ownerName={ownerName}
            phone={phone}
            businessType={businessType}
            merchantCode={merchantCode}
            selected={selected}
            customersCount={customers.length}
            metrics={metrics}
            onOpenForm={openForm}
            onSetAi={() => setView("ai")}
            onDownloadReport={downloadReport}
          />
          <StoreWorkspace
            filtered={filtered}
            selectedId={selectedId}
            view={view}
            setSelectedId={setSelectedId}
            setView={setView}
            query={query}
            setQuery={setQuery}
            searchRef={searchRef}
            chips={chips}
            filter={filter}
            setFilter={setFilter}
            customers={customers}
            isDemo={isDemo}
            loaded={loaded}
            shopName={shopName}
            ownerName={ownerName}
            selected={selected}
            form={form}
            setForm={setForm}
            errors={errors}
            isOnline={isOnline}
            flash={flash}
            onOpenForm={openForm}
            onRowAction={rowAction}
            onTab={switchTab}
            onCancel={() => {
              setView("details");
              setErrors({});
            }}
            onSubmit={submit}
            onDraft={saveDraft}
            notify={notify}
            onAiSaved={handleAiSaved}
          />
          <StoreTrustBar />
        </div>
      </main>

      <StorePageFooter toast={toast} />
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
