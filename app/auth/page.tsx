"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Boxes,
  CheckCircle2,
  Cloud,
  Headphones,
  LockKeyhole,
  LogIn,
  MapPin,
  Pill,
  PlugZap,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Store,
  Utensils,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import {
  clearAuthError,
  login,
  register,
  type BusinessType,
} from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import Image from "next/image";

type Mode = "register" | "login";

const CATEGORIES: {
  id: string;
  label: string;
  icon: LucideIcon;
  businessType: BusinessType;
}[] = [
  {
    id: "grocery",
    label: "মুদি / গ্রোসারি",
    icon: ShoppingBag,
    businessType: "GROCERY",
  },
  {
    id: "pharmacy",
    label: "ফার্মেসি",
    icon: Pill,
    businessType: "PHARMACY",
  },
  {
    id: "tailor",
    label: "কাপড় / দর্জি",
    icon: Shirt,
    businessType: "CLOTHING_TAILORING",
  },
  {
    id: "electronics",
    label: "ইলেকট্রনিক্স",
    icon: PlugZap,
    businessType: "ELECTRONICS",
  },
  {
    id: "restaurant",
    label: "রেস্তোরাঁ / ক্যাফে",
    icon: Utensils,
    businessType: "RESTAURANT_CAFE",
  },
  {
    id: "wholesale",
    label: "অন্যান্য ব্যবসা",
    icon: Boxes,
    businessType: "OTHER",
  },
];

function PinInput({
  name,
  label,
  focusClass,
}: {
  name: string;
  label: string;
  focusClass: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = event.target.value.replace(/\D/g, "").slice(-1);
    event.target.value = value;
    if (value) refs.current[index + 1]?.focus();
  };

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "Backspace" && !event.currentTarget.value) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <div
      className="grid w-full grid-cols-6 gap-3"
      role="group"
      aria-label={label}
    >
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          name={`${name}-${index + 1}`}
          type="password"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          pattern="[0-9]"
          required
          aria-label={`${label}, ${index + 1}`}
          onChange={(event) => onChange(event, index)}
          onKeyDown={(event) => onKeyDown(event, index)}
          className={`h-12 w-full rounded-xl border border-border bg-background text-center text-lg font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${focusClass}`}
        />
      ))}
    </div>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-foreground-muted"
        />
        <input
          id={id}
          {...props}
          className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-foreground-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [mode, setMode] = useState<Mode>("register");
  const [shopName, setShopName] = useState("রহমান জেনারেল স্টোর");
  const [category, setCategory] = useState(CATEGORIES[0].id);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    dispatch(clearAuthError());
  };

  const handleRegistration = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedCategory = CATEGORIES.find((item) => item.id === category);

    if (!selectedCategory) {
      return;
    }

    const result = await dispatch(
      register({
        name: String(formData.get("merchantName")),
        shopName: String(formData.get("shopName")),
        businessType: selectedCategory.businessType,
        phone: String(formData.get("phone")),
        pin: Array.from({ length: 6 }, (_, index) =>
          String(formData.get(`reg-pin-${index + 1}`)),
        ).join(""),
      }),
    );

    if (register.fulfilled.match(result)) {
      router.replace("/onbording");
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await dispatch(
      login({
        phone: String(formData.get("phone")),
        pin: Array.from({ length: 6 }, (_, index) =>
          String(formData.get(`login-pin-${index + 1}`)),
        ).join(""),
      }),
    );

    if (login.fulfilled.match(result)) {
      router.replace("/onbording");
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <header className="border-b border-border/80 bg-surface/80">
        <div className="bg-[#BFEBD3] px-4 py-2 text-[#143628] ">
          <div className="mx-auto flex justify-between max-w-6xl items-center gap-2 text-[11px] font-medium sm:px-2">
            <p className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="size-4 shrink-0" />
              বাংলাদেশ ক্যাশলেস ও নির্ভুল হিসাবায়ন উদ্যোগ ২০২৫ • ১০০%
              ব্যাংক-গ্রেড নিরাপত্তা
            </p>
            <div className="hidden items-center gap-5 text-xs font-medium text-foreground-muted sm:flex">
              <span className="flex items-center gap-1.5">
                <Cloud aria-hidden="true" className="size-4 text-secondary" />
                ক্লাউড ব্যাকআপ সচল
              </span>
              <span className="flex items-center gap-1.5">
                <Headphones
                  aria-hidden="true"
                  className="size-4 text-secondary"
                />
                হেল্পলাইন: ১৬২৬০
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <section className="mb-7 flex flex-col items-center text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-due-bg px-3 py-1.5 text-xs font-semibold text-due-fg">
            <BookOpen aria-hidden="true" className="size-4" />
            ডিজিটাল বাকি খাতা ডেক্স সিস্টেম
          </div>
          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            খাতা-কলমের হিসাবের দিন শেষ, শুরু হোক আধুনিক ব্যবসা
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-foreground-muted">
            মুহূর্তেই আপনার দোকানের জন্য স্বয়ংক্রিয় ডিজিটাল খাতা তৈরি করুন
            অথবা আগের অ্যাকাউন্টে লগইন করে সরাসরি ডেস্কে প্রবেশ করুন।
          </p>
          <nav
            aria-label="Portal modes"
            className="mt-5 flex w-full max-w-sm items-center gap-1 rounded-full bg-surface-muted p-1.5"
          >
            <button
              type="button"
              aria-pressed={mode === "register"}
              onClick={() => switchMode("register")}
              className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full px-3 text-xs font-semibold transition ${
                mode === "register"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <Store aria-hidden="true" className="size-4" />
              নতুন দোকান খুলুন
            </button>
            <button
              type="button"
              aria-pressed={mode === "login"}
              onClick={() => switchMode("login")}
              className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full px-3 text-xs font-semibold transition ${
                mode === "login"
                  ? "bg-secondary text-on-secondary shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <LogIn aria-hidden="true" className="size-4" />
              খাতায় লগইন
            </button>
          </nav>
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="flex flex-col gap-4">
            <article className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
              <div
                aria-hidden="true"
                className="h-44 bg-surface-muted sm:h-70 relative"
              >
                <Image
                  src={"/screen.png"}
                  alt="login image"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="bg-secondary px-4 py-3 text-on-secondary">
                <p className="text-xs italic leading-5 text-white/90">
                  “খাতার পাতার চেয়ে মোবাইলে বাকি রাখার পর থেকে আর ১ টাকার
                  হিসাবও ভুল হয়নি।”
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-semibold">
                  <span>— আবদুর রহমান, স্বত্বাধিকারী</span>
                  <span className="flex items-center gap-1 text-white/80">
                    <MapPin aria-hidden="true" className="size-3" />
                    চকবাজার, ঢাকা
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-border bg-surface py-3 text-center">
                <div>
                  <p className="font-display text-lg font-bold text-primary">
                    ৫০,০০০+
                  </p>
                  <p className="text-[10px] text-foreground-muted">
                    সক্রিয় দোকানি
                  </p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-secondary">
                    ১০০%
                  </p>
                  <p className="text-[10px] text-foreground-muted">
                    নিরাপদ হিসাব
                  </p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-tertiary">
                    ০ ৳
                  </p>
                  <p className="text-[10px] text-foreground-muted">
                    লুকানো চার্জ নেই
                  </p>
                </div>
              </div>
            </article>

            <section className="rounded-3xl border border-border bg-surface p-4 shadow-card">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-due-bg text-due-fg">
                    <BookOpen aria-hidden="true" className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">
                      তাত্ক্ষণিক স্টোর প্রিভিউ
                    </h2>
                    <p className="text-[10px] text-foreground-muted">
                      নিবন্ধন করলেই এই ড্যাশবোর্ড তৈরি হবে
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-settled-bg px-2 py-1 text-[10px] font-semibold text-settled-fg">
                  অটো-জেনারেটেড
                </span>
              </div>
              <div className="rounded-2xl bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-foreground-muted">
                      দোকানের নাম
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {shopName.trim() || "আপনার দোকানের নাম"}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 border-t border-border pt-2 text-xs text-foreground-muted">
                  {(() => {
                    const CategoryIcon =
                      CATEGORIES.find((item) => item.id === category)?.icon ??
                      ShoppingBag;
                    return (
                      <CategoryIcon
                        aria-hidden="true"
                        className="size-4 text-primary"
                      />
                    );
                  })()}
                  {CATEGORIES.find((item) => item.id === category)?.label}
                </div>
                <ul className="mt-2 space-y-1 text-[10px] text-foreground-muted">
                  {[
                    "আনলিমিটেড কাস্টমার রিমাইন্ডার",
                    "বাংলা ভয়েস এন্ট্রি ও অটো-হিসাব",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <CheckCircle2
                        aria-hidden="true"
                        className="size-3 shrink-0 text-secondary"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <aside className="flex items-center justify-between gap-3 rounded-3xl bg-secondary px-4 py-3 text-on-secondary">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <BadgeCheck aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold">
                    হাতে-কলমে প্রশিক্ষণ চান?
                  </p>
                  <p className="text-[10px] text-white/75">
                    আমাদের প্রতিনিধি আপনাকে বুঝিয়ে দেবে
                  </p>
                </div>
              </div>
              <a
                href="tel:16260"
                className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-semibold hover:bg-white/25"
              >
                কল করুন
              </a>
            </aside>
          </aside>

          <section
            aria-labelledby="form-heading"
            className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-7"
          >
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-secondary">
                <LockKeyhole aria-hidden="true" className="size-4" />
                {mode === "login"
                  ? "নিরাপদ মার্চেন্ট লগইন"
                  : "নতুন মার্চেন্ট নিবন্ধন"}
              </div>
              <h2
                id="form-heading"
                className="font-display text-2xl font-bold tracking-tight text-foreground"
              >
                {mode === "login"
                  ? "আপনার খাতায় প্রবেশ করুন"
                  : "আপনার দোকানের খাতা তৈরি করুন"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-foreground-muted">
                {mode === "login"
                  ? "মোবাইল নম্বর ও ৪-সংখ্যার পিন দিয়ে আপনার হিসাব খুলুন।"
                  : "দোকানের তথ্য দিন—আপনার ডিজিটাল খাতা তৈরি শুরু হবে।"}
              </p>
            </div>

            {mode === "register" ? (
              <form className="space-y-5" onSubmit={handleRegistration}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="merchantName"
                    name="merchantName"
                    label="দোকানদারের পুরো নাম"
                    icon={UserRound}
                    type="text"
                    autoComplete="name"
                    placeholder="মোঃ আব্দুর রহমান"
                    required
                  />
                  <Field
                    id="shopNameInput"
                    name="shopName"
                    label="দোকানের নাম"
                    icon={Store}
                    type="text"
                    value={shopName}
                    onChange={(event) => setShopName(event.target.value)}
                    placeholder="রহমান জেনারেল স্টোর"
                    required
                  />
                </div>

                <fieldset>
                  <legend className="mb-2.5 text-sm font-semibold text-foreground">
                    দোকানের ধরন নির্বাচন করুন
                  </legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {CATEGORIES.map(({ id, label, icon: CategoryIcon }) => {
                      const selected = category === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setCategory(id)}
                          className={`flex min-h-[54px] items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                            selected
                              ? "border-primary/30 bg-primary/5 text-primary"
                              : "border-border bg-background text-foreground-muted hover:border-border-strong hover:bg-surface-hover"
                          }`}
                        >
                          <CategoryIcon
                            aria-hidden="true"
                            className="size-4 shrink-0"
                          />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div>
                  <label
                    htmlFor="merchantPhone"
                    className="mb-2 block text-sm font-semibold text-foreground"
                  >
                    দোকানের মোবাইল নম্বর
                  </label>
                  <div className="flex gap-2">
                    <div className="flex h-12 shrink-0 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground">
                      <span aria-hidden="true">🇧🇩</span>
                      +৮৮০
                    </div>
                    <input
                      id="merchantPhone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      maxLength={11}
                      required
                      placeholder="০১XXXXXXXXX"
                      className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-foreground-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">
                    ৬-সংখ্যার গোপন পিন তৈরি করুন
                  </p>
                  <PinInput
                    name="reg-pin"
                    label="নতুন পিন"
                    focusClass="focus:border-primary focus:ring-primary/20"
                  />
                  <p className="mt-2 text-xs text-foreground-muted">
                    প্রতিবার খাতায় প্রবেশ করতে এই পিন ব্যবহার করুন।
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-settled-bg/70 p-4 text-sm leading-6 text-settled-fg">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0"
                  />
                  <p>
                    আপনার তথ্য নিরাপদে সংরক্ষিত থাকবে। নিবন্ধনের পর আপনি সরাসরি
                    আপনার খাতায় প্রবেশ করতে পারবেন।
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-sm transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {status === "loading" ? "তৈরি হচ্ছে..." : "দোকান তৈরি করুন"}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </button>

                <p className="text-center text-sm text-foreground-muted">
                  আগে থেকেই খাতা আছে?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-semibold text-secondary hover:underline"
                  >
                    লগইন করুন
                  </button>
                </p>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <label
                    htmlFor="loginPhone"
                    className="mb-2 block text-sm font-semibold text-foreground"
                  >
                    রেজিস্টার্ড মোবাইল নম্বর
                  </label>
                  <div className="flex gap-2">
                    <div className="flex h-12 shrink-0 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground">
                      <span aria-hidden="true">🇧🇩</span>
                      +৮৮০
                    </div>
                    <input
                      id="loginPhone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      maxLength={11}
                      required
                      placeholder="০১XXXXXXXXX"
                      className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-foreground-muted/70 focus:border-secondary focus:ring-2 focus:ring-secondary/15"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      ৬-সংখ্যার গোপন পিন
                    </p>
                  </div>
                  <PinInput
                    name="login-pin"
                    label="লগইন পিন"
                    focusClass="focus:border-secondary focus:ring-secondary/20"
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground-muted">
                  <input
                    type="checkbox"
                    name="remember"
                    defaultChecked
                    className="mt-0.5 size-4 accent-secondary"
                  />
                  এই ডিভাইসে লগইন মনে রাখুন
                </label>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-bold text-on-secondary shadow-sm transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                >
                  <LogIn aria-hidden="true" className="size-4" />
                  {status === "loading" ? "প্রবেশ করা হচ্ছে..." : "খাতায় প্রবেশ করুন"}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </button>

                <p className="text-center text-sm text-foreground-muted">
                  নতুন দোকান খুলতে চান?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="font-semibold text-primary hover:underline"
                  >
                    বিনামূল্যে নিবন্ধন করুন
                  </button>
                </p>
              </form>
            )}

            {error && (
              <div
                role="alert"
                className="mt-6 flex items-center gap-3 rounded-2xl bg-due-bg p-4 text-sm font-semibold text-due-fg"
              >
                {error}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-5 text-xs text-foreground-muted sm:px-6 lg:px-8">
        <p className="flex items-center gap-2">
          <LockKeyhole aria-hidden="true" className="size-4 text-secondary" />
          আপনার তথ্য সুরক্ষিত ও এনক্রিপ্টেড
        </p>
        <p>বাকি খাতা © ২০২৫ • সর্বস্বত্ব সংরক্ষিত</p>
      </footer>
    </div>
  );
}
