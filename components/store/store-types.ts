export type TxType = "due" | "paid";
export type Tx = {
  id: string;
  date: string;
  type: TxType;
  desc: string;
  amount: number;
  pendingSync?: boolean;
  syncError?: string;
};
export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  creditLimit: number;
  totalDue: number;
  totalCredit?: number;
  totalPaid?: number;
  dueSince: string | null;
  tone: number;
  notes: string;
  history: Tx[];
};
export type Filter = "all" | "due" | "urgent" | "paid";
export type Mode = "new_customer" | "add_due" | "add_paid";
export type View = "details" | "form" | "ai";
export type FormState = {
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
