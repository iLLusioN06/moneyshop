// =============================================
// MoneyShop - Fatura Tipleri Sabitleri
// =============================================

export const BILL_TYPES = [
  { id: "electric", label: "Elektrik", icon: "Zap" },
  { id: "water", label: "Su", icon: "Droplets" },
  { id: "gas", label: "Doğalgaz", icon: "Flame" },
  { id: "internet", label: "İnternet", icon: "Wifi" },
  { id: "phone", label: "Telefon", icon: "Phone" },
  { id: "insurance", label: "Sigorta", icon: "Shield" },
  { id: "subscription", label: "Abonelik", icon: "Repeat" },
  { id: "other", label: "Diğer", icon: "Receipt" },
] as const;

export type BillType = (typeof BILL_TYPES)[number]["id"];

export const BILL_TYPE_LABELS: Record<BillType, string> = {
  electric: "Elektrik Faturası",
  water: "Su Faturası",
  gas: "Doğalgaz Faturası",
  internet: "İnternet Faturası",
  phone: "Telefon Faturası",
  insurance: "Sigorta Ödemesi",
  subscription: "Abonelik Ödemesi",
  other: "Fatura Ödemesi",
};
