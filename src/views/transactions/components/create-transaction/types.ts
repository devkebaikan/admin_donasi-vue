export type DedicatedType = "donation" | "event" | "zakat" | "qurban";

export interface TransactionItem {
  program_id: number | null;
  gross_nominal: number;
  discount: number;
  event_id: number | null;
  quantity: number;
  zakat_id: number | null;
}

export interface FormState {
  date: string;
  time: string;
  status: string;
  source: string;
  doa: string;
  jurnal_id: number | null;
  payment_method_id: number | null;
}

export interface SelectOption {
  value: number | string;
  text: string;
}

