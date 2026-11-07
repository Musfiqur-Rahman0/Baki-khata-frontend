import { toast as sonnerToast } from "sonner";
import { retryQueuedTransaction } from "@/lib/offline";
import { Icon } from "./store-icon";
import type { Customer, Mode } from "./store-types";
import { dueText, esc, fmtDate, initialOf, intlPhone, money, reminderText, todayISO, toBn, TONES } from "./store-utils";

export function DetailsPanel({
  cust,
  shopName,
  ownerName,
  isDemo,
  isOnline,
  flash,
  onOpenForm,
  notify,
}: {
  cust: Customer;
  shopName: string;
  ownerName: string;
  isDemo: boolean;
  isOnline: boolean;
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
                  {h.pendingSync && (
                    <div className="text-[11px]">
                      <p
                        className={h.syncError ? "text-error" : "text-tertiary"}
                        role={h.syncError ? "alert" : undefined}
                      >
                        {h.syncError
                          ? `সিঙ্ক ব্যর্থ: ${h.syncError}`
                          : "ইন্টারনেট এলে সিঙ্ক হবে"}
                      </p>
                      {h.syncError && (
                        <button
                          type="button"
                          disabled={!isOnline}
                          className="font-semibold text-primary underline disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => retryQueuedTransaction(h.id)}
                        >
                          আবার চেষ্টা করুন
                        </button>
                      )}
                    </div>
                  )}
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

