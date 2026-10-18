export const site = {
  name: "Baki Khata",
  nameBn: "বাকি খাতা",
  tagline: "সহজ ও নির্ভরযোগ্য ডিজিটাল খাতা",
  subTagline: "বাংলাদেশের মুদি দোকান, ফার্মেসি ও টেইলার্সের জন্য তৈরি",
};

export const navLinks = [
  { href: "#how-it-works", label: "কীভাবে কাজ করে" },
  { href: "#desk-preview", label: "ডেস্ক প্রিভিউ" },
  { href: "#features", label: "সুবিধাসমূহ" },
  { href: "#privacy", label: "নিরাপত্তা" },
  { href: "#faq", label: "সাধারণ জিজ্ঞাসা" },
] as const;

export const heroData = {
  statusPill: "বাংলাদেশের মুদি দোকান, ফার্মেসি ও টেইলার্সের জন্য তৈরি",
  headline: "কার কাছে কত বাকি— আর ভুলে যাওয়ার ভয় নেই।",
  subheading:
    "বাকি খাতা হলো স্থানীয় ব্যবসায়ীদের জন্য সহজ ও ডিজিটাল লেজার। দুই ক্লিকেই বাকির হিসাব ও জমা তুলুন, সময়মতো তাগাদা দিন এবং হিসেবের গড়মিল চিরতরে বন্ধ করুন।",
  primaryCta: {
    label: "আপনার খাতা খুলুন",
    href: "#desk-preview",
  },
  secondaryCta: {
    label: "লাইভ ডেমো দেখুন",
    href: "#desk-preview",
  },
  trustPoints: [
    "কোনো অ্যাপ ডাউনলোড করার ঝামেলা নেই",
    "বাংলা ও ইংরেজি উভয় ভাষায় ব্যবহারযোগ্য",
    "আপনার দোকানের হিসাব সম্পূর্ণ গোপন ও সুরক্ষিত",
  ],
  heroCard: {
    shopBadge: "রহিম স্টোর • মুদির দোকান",
    title: "বাংলাদেশের হাজারো মুদি দোকানি, ফার্মেসি ও টেইলার্সের বিশ্বস্ত ডিজিটাল খাতা",
    description:
      "কাগজের খাতা হারিয়ে যাওয়া বা হিসেব গরমিলের দিন শেষ। নির্ভুল ও সহজে রাখুন প্রতিটি পাই-পয়সার হিসাব।",
    guaranteeBadge: "১০০% স্থানীয় ব্যবসায়ীদের জন্য",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBC_qAIM9nX-jtJ_uQauXtl3cgu5JGJIJqbHrVGvE22EOXsdbQtUQvFVM8oIALOBC-SgML2640LOiEvfW4PthU55rOSe4ODqAgGcnXcFjVlCyShJ4jLOkMUrFiQcsRcXB-LNtrJFw-fggttrpEniOnP96YEfkHPU0DcPootsb5e6cNn_UCKS3ExLyLQEaLatHR85HMfvN64LDzwDDa3lKvJ6Kr7V1B41yO2H_RKe8p433F96MieepmI",
  },
};

export const painPointsData = {
  eyebrow: "পুরোনো কাগুজে খাতার ঝামেলা শেষ",
  title: "দোকানিরা কেন পুরোনো খাতা ছেড়ে ডিজিটাল হচ্ছেন?",
  items: [
    {
      id: "forgotten-dues",
      title: "ভুলে যাওয়া বাকি",
      description:
        "সাদা কাগজের কোনায় লিখে রাখা নাম ভিড়ের সময় চোখ এড়িয়ে যায়। মাস শেষে না-দেখা ছোট ছোট বাকিগুলো নীরবে লোকসান ঘটায়।",
      solution: "স্বয়ংক্রিয় বকেয়া ট্র্যাকিং, যা নিষ্পত্তি না হওয়া পর্যন্ত দৃশ্যমান থাকে।",
      tone: "amber" as const,
    },
    {
      id: "calculation-mistakes",
      title: "হিসেবে ভুল ও বিভ্রান্তি",
      description:
        "হাতে যোগ-বিয়োগ করতে গিয়ে হিসাবের গরমিল হয় এবং দোকানে ক্রেতার সামনে অপ্রস্তুত হতে হয়।",
      solution: "প্রতিটি লেনদেনের সাথে সাথে তাৎক্ষণিক নির্ভুল হিসাব আপডেট।",
      tone: "rose" as const,
    },
    {
      id: "awkward-reminders",
      title: "তাগাদা দেওয়ার ইতস্তত ভাব",
      description:
        "সম্মানিত ক্রেতার কাছে সরাসরি মুখের ওপর টাকার কথা বলতে সংকোচ লাগে।",
      solution: "সম্মানজনক ও ভদ্র ভাষায় প্রস্তুত করা WhatsApp/SMS মেসেজের খসড়া, যা আপনি দেখে পাঠাবেন।",
      tone: "emerald" as const,
    },
  ],
};

export const howItWorksData = {
  eyebrow: "সহজ ৩টি ধাপ",
  title: "কীভাবে কাজ করে বাকি খাতা?",
  description:
    "জটিল কোনো অ্যাকাউন্টিং নয়। আপনি যদি এসএমএস পাঠাতে পারেন, তবে বাকি খাতাও সহজে চালাতে পারবেন।",
  steps: [
    {
      step: "০১",
      stepBadge: "ধাপ ০১",
      title: "গ্রাহকের নাম যোগ করুন",
      description:
        "ক্রেতার নাম ও ফোন নম্বর একবার যুক্ত করুন। কোনো অ্যাকাউন্টের প্রয়োজন নেই। কন্টাক্ট সম্পূর্ণ আপনার খাতাতেই সুরক্ষিত থাকবে।",
      snippet: "+ রহিম মিয়া (০১৭১২-***)",
    },
    {
      step: "০২",
      stepBadge: "ধাপ ০২",
      title: "বাকি ও জমা হিসাব রাখুন",
      description:
        "মাত্র ২ ট্যাপে নতুন বাকি বা জমা টাকা রেকর্ড করুন। মুখে বাংলায় বলুন বা লিখুন এবং যাচাই করে নিশ্চিত করুন।",
      snippet: "৳ ৩০০ বাকি • ৳ ১৫০ জমা",
    },
    {
      step: "০৩",
      stepBadge: "ধাপ ০৩",
      title: "কে কত বাকি রেখেছে দেখুন",
      description:
        "এক নজরে মোট বাকি, কার ৩০ দিনের বেশি বকেয়া এবং কার হিসাব পুরোপুরি ক্লিয়ার তা দেখে নিন।",
      snippet: "মোট বাকি: ৳ ৪,২৯০ (২ জন বকেয়া)",
    },
  ],
};

export type LedgerRowStatus = "overdue" | "rolling" | "settled";
export type LedgerStatus = LedgerRowStatus;

export interface DeskLedgerEntry {
  id: string;
  name: string;
  phone: string;
  statusText: string;
  statusType: LedgerRowStatus;
  amount: string;
  isSettled?: boolean;
}

export const deskPreviewData = {
  badge: "লাইভ ইন্টারঅ্যাক্টিভ প্রিভিউ",
  title: "এক নজরে আপনার ডিজিটাল ডেস্ক",
  description:
    "দোকানের কাউন্টারে ফোন, ট্যাবলেট বা কম্পিউটারে ব্যবহারের উপযোগী অত্যন্ত পরিষ্কার ও দ্রুতগতির ইন্টারফেস।",
  shopName: "রহমান ব্রাদার্স গ্রোসারি",
  branch: "ধানমন্ডি শাখা • সক্রিয় খাতা",
  metrics: [
    {
      label: "মোট অনাদায়ী বাকি",
      amount: "৳ ৪,২৯০",
      unit: "টাকা",
      tone: "forest" as const,
    },
    {
      label: "বাকি গ্রাহকের সংখ্যা",
      amount: "৬ জন",
      unit: "সক্রিয় ক্রেতা",
      tone: "charcoal" as const,
    },
    {
      label: "অতিজরুরি বকেয়া (>৩০ দিন)",
      amount: "২ জন",
      unit: "তাগাদা প্রয়োজন",
      tone: "rose" as const,
    },
  ],
  quickEntryHint: 'রহিম মিয়া ২ কেজি চাল নিল, ৩০০ টাকা বাকি',
  entries: [
    {
      id: "rahim",
      name: "রহিম মিয়া",
      phone: "০১৭১২-***",
      statusText: "বকেয়া (৩৮ দিন)",
      statusType: "overdue" as const,
      amount: "৳ ৬৫০",
    },
    {
      id: "jamal",
      name: "জামাল হোসেন",
      phone: "০১৮২৪-***",
      statusText: "বকেয়া (৩২ দিন)",
      statusType: "overdue" as const,
      amount: "৳ ১,৭০০",
    },
    {
      id: "fatema",
      name: "ফাতেমা বেগম",
      phone: "০১৯১১-***",
      statusText: "চলতি বাকি (১৪ দিন)",
      statusType: "rolling" as const,
      amount: "৳ ৪২০",
    },
    {
      id: "tarek",
      name: "তারেক হাসান",
      phone: "০১৬৪০-***",
      statusText: "পরিশোধিত",
      statusType: "settled" as const,
      amount: "৳ ০",
      isSettled: true,
    },
  ],
};

export const featuresData = {
  eyebrow: "সহজ ও কার্যকরী সমাধান",
  title: "যা যা সুবিধা আপনি পাচ্ছেন",
  description:
    "কোনো জটিল অপ্রয়োজনীয় ফিচার নেই। শুধুমাত্র প্রয়োজনীয় ও নির্ভুল বাকি ট্র্যাকিং।",
  items: [
    {
      id: "auto-status",
      title: "স্বয়ংক্রিয় ব্যালেন্স ও স্ট্যাটাস ফ্ল্যাগ",
      description:
        "প্রতিটি বাকি স্বয়ংক্রিয়ভাবে ক্লিয়ার, চলতি বা বকেয়া স্ট্যাটাস দেখায়। দিন গুনতে হবে না।",
      iconType: "clock" as const,
    },
    {
      id: "shop-summary",
      title: "এক নজরে দোকানের সারাংশ",
      description:
        "দোকান খোলার সাথে সাথে মোট পাওনা এবং সর্বাধিক বাকি থাকা ক্রেতাদের তালিকা দেখুন।",
      iconType: "chart" as const,
    },
    {
      id: "smart-entry",
      title: "স্মার্ট কুইক এন্ট্রি ও যাচাই",
      description:
        "কোনো ড্রপডাউন খোঁজাখুঁজি ছাড়াই দ্রুত লিখুন। সেভ করার আগে স্ক্রিনে স্পষ্ট নিশ্চিতকরণ দেখে নিন।",
      iconType: "zap" as const,
    },
    {
      id: "dignified-reminders",
      title: "ভদ্র ও সম্মানজনক তাগাদা ড্রাফট",
      description:
        "সম্মানিত কাস্টমারদের কাছে নিজে থেকে কোনো মেসেজ যাবে না। আপনি ক্লিক করে কপি করে WhatsApp বা SMS-এ পাঠাতে পারবেন।",
      iconType: "message" as const,
    },
  ],
};

export const privacyData = {
  badge: "আপনার খাতার তথ্য সম্পূর্ণ আপনার নিয়ন্ত্রণে",
  title: "আপনার দোকানের হিসাবের গোপনীয়তা আমরা কীভাবে রক্ষা করি",
  description:
    "কাগুজে খাতা যে কেউ দোকানে ঢুকে দেখে ফেলতে পারে। কিন্তু বাকি খাতা আপনার ব্যবসায়ের তথ্য সুরক্ষিত রাখে।",
  points: [
    {
      title: "সম্পূর্ণ স্বতন্ত্র দোকান ডেটা",
      description:
        "প্রতিটি দোকান শুধু তার নিজের কাস্টমার ও লেনদেন দেখতে পারে। এক দোকানের ডেটা অন্য দোকান দেখতে পারে না।",
    },
    {
      title: "এনক্রিপ্ট করা উচ্চ নিরাপত্তা",
      description:
        "সকল পাসওয়ার্ড ও ডাটা ক্রিপ্টোগ্রাফিক্যালি হ্যাশ ও এনক্রিপ্ট করা, কখনোই সাধারণ টেক্সট হিসেবে থাকে না।",
    },
    {
      title: "আপনার অনুমোদন ছাড়া সেভ নয়",
      description:
        "প্রতিটি এন্ট্রি আপনার সামনে দেখানো হবে। আপনি 'কনফার্ম' না করা পর্যন্ত সিস্টেমে যুক্ত হয় না।",
    },
    {
      title: "সম্পূর্ণ ডেটা মুছে ফেলার নিয়ন্ত্রণ",
      description:
        "আপনি চাইলে যেকোনো গ্রাহক বা একক লেনদেন স্থায়ীভাবে মুছে ফেলতে পারেন।",
    },
  ],
};

export const faqData = {
  eyebrow: "স্পষ্ট উত্তর",
  title: "সাধারণ জিজ্ঞাসাসমূহ",
  items: [
    {
      question: "আমার দোকানের তথ্য কি নিরাপদ ও গোপন থাকবে?",
      answer:
        "হ্যাঁ। সকল তথ্য ও হিসাব শুধুমাত্র অনুমোদিত দোকানদারের জন্যই সংরক্ষিত। অন্য কেউ আপনার খাতা বা ব্যালেন্স অনুসন্ধান করতে পারবে না।",
    },
    {
      question: "কাস্টমারদের কি কোনো অ্যাকাউন্ট বা স্মার্টফোনের প্রয়োজন আছে?",
      answer:
        "না। কাস্টমারের কোনো অ্যাপ বা অ্যাকাউন্টের দরকার নেই। কাস্টমার শুধু আপনার খাতার তালিকায় থাকবেন।",
    },
    {
      question: "এটি কি বাংলায় কাজ করে?",
      answer:
        "অবশ্যই! পুরো ইন্টারফেস, দ্রুত এন্ট্রি এবং তাগাদা মেসেজ বাংলায় অত্যন্ত সাবলীলভাবে কাজ করে।",
    },
    {
      question: "এটি ব্যবহার করা কি সম্পূর্ণ ফ্রি?",
      answer:
        "হ্যাঁ, এই প্রিভিউ সংস্করণ ও ইন্টারঅ্যাক্টিভ ডেমো সম্পূর্ণ বিনামূল্যে ব্যবহারযোগ্য। কোনো লুকানো চার্জ বা ফি নেই।",
    },
  ],
};

export const ctaData = {
  title: "আজই আপনার ডিজিটাল খাতা শুরু করুন",
  description:
    "আপনার মুদি দোকান, ফার্মেসি কিংবা টেইলার্সের জন্য মাত্র ৩০ সেকেন্ডে হিসাব খোলা শুরু করুন।",
  primaryBtn: "বিনা খরচে খাতা তৈরি করুন",
  secondaryBtn: "ডেমো শপ ঘুরে দেখুন",
  disclaimer: "কোনো ক্রেডিট কার্ডের প্রয়োজন নেই • ফ্রি প্রিভিউ মোড",
};

// Legacy exports for compatibility
export const metrics = [
  {
    label: "Today’s cash-in",
    labelBn: "আজকের জমা",
    amount: 48250,
    hint: "Verified receipts",
    tone: "settled" as const,
  },
  {
    label: "Open credit",
    labelBn: "চলতি বাকি",
    amount: 126800,
    hint: "Rolling customer balances",
    tone: "rolling" as const,
  },
  {
    label: "Overdue",
    labelBn: "বকেয়া",
    amount: 18740,
    hint: "Ready for তাগাদা",
    tone: "overdue" as const,
  },
] as const;

export const steps = howItWorksData.steps.map((s) => ({
  step: s.step,
  title: s.title,
  description: s.description,
}));

export const features = featuresData.items.map((f) => ({
  title: f.title,
  titleBn: f.title,
  description: f.description,
}));

export const faqs = faqData.items;

export const ledgerRows = [
  {
    customer: "Rahim Store",
    note: "15 kg rice + oil",
    time: "10:24",
    amount: 2450,
    type: "credit" as const,
    status: "overdue" as LedgerStatus,
  },
  {
    customer: "Nusrat Apa",
    note: "Partial settlement",
    time: "11:02",
    amount: 1200,
    type: "cash" as const,
    status: "settled" as LedgerStatus,
  },
  {
    customer: "Karim Traders",
    note: "Weekly grocery line",
    time: "12:18",
    amount: 8600,
    type: "credit" as const,
    status: "rolling" as LedgerStatus,
  },
] as const;

export const customerDrawer = {
  name: "Karim Traders",
  since: "Customer since 2019",
  runningBalance: 8600,
  status: "rolling" as LedgerStatus,
  history: [
    { label: "Credit · grocery line", amount: 8600, when: "Today, 12:18" },
    { label: "জমা · previous week", amount: 4000, when: "Fri, 18:40" },
  ],
};
