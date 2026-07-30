import { formatCurrency, formatDate } from "@/helpers/format";
import type { CrmCaseCard, CrmDonorDetail, CrmPipelineCase } from "./types";

const COLOR_TAG_VARIANT: Record<string, string> = {
  blue: "info",
  amber: "warning",
  green: "success",
  teal: "teal",
  purple: "purple",
  red: "danger",
  gray: "secondary",
};

// Kode warna 2-huruf dari backend (ta/tg/tb/tt/tp/tr) belum ada kamus resminya —
// dipetakan mendekati makna tiap stage sampai tersedia daftar warna dari BE.
const STAGE_COLOR_VARIANT: Record<string, string> = {
  ta: "warning",
  tg: "success",
  tb: "info",
  tt: "purple",
  tp: "primary",
  tr: "danger",
};

const CYCLE_STATUS_VARIANT: Record<string, string> = {
  Aktif: "success",
  "Non Aktif": "secondary",
  "Dorman 1": "warning",
  "Dorman 2": "danger",
  "Respon Kembali": "info",
};

export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

export const colorTagVariant = (colorTag?: string) =>
  COLOR_TAG_VARIANT[colorTag ?? ""] ?? "secondary";

export const stageColorVariant = (color?: string) =>
  STAGE_COLOR_VARIANT[color ?? ""] ?? "secondary";

export const cycleStatusVariant = (status?: string) =>
  CYCLE_STATUS_VARIANT[status ?? ""] ?? "secondary";

// Data seed sering berisi timestamp kosong ("0001-01-01..."), jangan ditampilkan sebagai tanggal.
const safeFormatDate = (value?: string) => {
  if (!value || new Date(value).getFullYear() <= 1900) return "-";
  return formatDate(value);
};

export const toCaseCard = (item: CrmPipelineCase): CrmCaseCard => ({
  id: item.id,
  initials: initialsOf(item.donor.name),
  colorVariant: colorTagVariant(item.donor.color_tag),
  name: item.donor.name,
  nickname: item.donor.nick,
  phone: item.donor.phone,
  amount: formatCurrency(item.transaction.total),
  stage: item.pipeline_stage.label,
  note: item.keterangan,
  tags: [
    { label: item.donor.level, variant: "secondary" },
    { label: item.donor.cycle_status, variant: cycleStatusVariant(item.donor.cycle_status) },
    { label: item.pipeline_stage.label, variant: stageColorVariant(item.pipeline_stage.color) },
  ],
  stats: [
    { label: "Level", value: item.donor.level },
    { label: "Status Siklus", value: item.donor.cycle_status },
    { label: "Invoice", value: item.transaction.invoice },
  ],
  donationHistory: [
    {
      amount: formatCurrency(item.transaction.total),
      bank: "-",
      project: item.pipeline_stage.label,
      date: safeFormatDate(item.created_at),
      status: item.transaction.status === "Paid" ? "sukses" : "pending",
    },
  ],
});

export const mergeDonorDetail = (
  base: CrmCaseCard,
  detail: CrmDonorDetail,
): CrmCaseCard => ({
  ...base,
  nickname: detail.nick ?? base.nickname,
  stats: [
    ...(base.stats ?? []),
    { label: "Poin", value: String(detail.poin) },
    { label: "Hari Tidak Aktif", value: `${detail.hari_tidak_aktif} hari` },
  ],
  followUps: detail.follow_ups ?? [],
  chatMessages: detail.chat_messages ?? [],
  waAccount: base.waAccount ?? "Official WA",
});
