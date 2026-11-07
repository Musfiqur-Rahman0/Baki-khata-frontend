import { MessageCircle } from "lucide-react";

type CustomerCardAction = "sms" | "pay" | "statement" | "add-due";
type CustomerCardStatus = "paid" | "due" | "urgent";

type CustomerCardProps = {
  customer: {
    name: string;
    phone: string;
    address: string;
    totalDue: number;
  };
  initial: string;
  amount: string;
  dueLabel: string;
  status: CustomerCardStatus;
  tone: { bg: string; text: string };
  selected: boolean;
  isDemo: boolean;
  onSelect: () => void;
  onAction: (action: CustomerCardAction) => void;
};

export const CustomerCard = ({
  customer,
  initial,
  amount,
  dueLabel,
  status,
  tone,
  selected,
  isDemo,
  onSelect,
  onAction,
}: CustomerCardProps) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect();
      }}
      className={`px-3 py-3.5 hover:bg-background/70 cursor-pointer flex items-center justify-between transition-all border-l-4 ${
        selected
          ? "bg-due-bg/30 border-primary shadow-sm"
          : "border-transparent"
      }`}
    >
      <div className="w-5/12 flex items-center gap-2 min-w-0">
        <div
          className={`w-10 h-10 rounded-full ${tone.bg} ${tone.text} flex items-center justify-center font-bold font-semibold flex-shrink-0`}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-title-lg text-foreground font-semibold truncate leading-tight">
              {customer.name}
            </h4>
            {selected && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>
          <p className="font-semibold text-label-md text-foreground-muted truncate">
            {customer.phone} • {customer.address}
          </p>
        </div>
      </div>
      <div className="w-3/12 text-right">
        <span
          className={`font-semibold text-headline-md font-bold block leading-none ${customer.totalDue > 0 ? "text-primary" : "text-secondary"}`}
        >
          {amount}
        </span>
        <span
          className={`text-label-md inline-block mt-0.5 ${status === "urgent" ? "text-error font-bold" : status === "paid" ? "text-secondary font-semibold" : "text-foreground-muted"}`}
        >
          {dueLabel}
        </span>
      </div>
      <div
        className="w-4/12 flex items-center justify-end gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {customer.totalDue > 0 ? (
          <>
            <button
              onClick={() => onAction("sms")}
              title={
                isDemo ? "ডেমো মোডে বার্তা পাঠানো বন্ধ" : "SMS তাগাদা পাঠান"
              }
              className={`px-2 py-1 rounded-full bg-surface-muted text-settled-fg hover:bg-surface-muted text-label-md font-bold flex items-center gap-1 transition-all ${isDemo ? "opacity-70" : ""}`}
            >
              <MessageCircle
                aria-hidden="true"
                className="inline-block shrink-0 align-middle"
                size={14}
              />
              <span>তাগাদা</span>
            </button>
            <button
              onClick={() => onAction("pay")}
              className="px-2 py-1 rounded-full bg-settled-bg/60 text-secondary text-label-md font-bold hover:bg-settled-bg transition-all"
            >
              জমা
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onAction("statement")}
              className="px-2 py-1 rounded-full bg-surface-muted hover:bg-surface-muted text-foreground text-label-md font-semibold transition-all"
            >
              বিবরণী
            </button>
            <button
              onClick={() => onAction("add-due")}
              className="px-2 py-1 rounded-full bg-due-bg text-primary text-label-md font-bold hover:bg-due-bg transition-all"
            >
              + বাকি দিন
            </button>
          </>
        )}
      </div>
    </div>
  );
};
