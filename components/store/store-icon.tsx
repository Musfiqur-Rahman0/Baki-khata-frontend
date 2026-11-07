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

export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
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
