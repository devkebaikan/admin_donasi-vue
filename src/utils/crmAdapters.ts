import { formatCurrency } from "@/helpers/format";
import type { CrmCaseCard, CrmPipelineCase } from "../types/crm";

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
  tt: "cyan",
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

export const toCaseCard = (item: CrmPipelineCase): CrmCaseCard => ({
  id: item.id,
  initials: initialsOf(item.donor.name),
  colorVariant: colorTagVariant(item.donor.color_tag),
  color_tag: item.donor.color_tag,
  name: item.donor.name,
  nickname: item.donor.nick,
  phone: item.donor.phone,
  amount: formatCurrency(item.transaction.total),
  stage: item.pipeline_stage.label,
  tags: [
    { label: item.donor.level, variant: "secondary" },
    {
      label: item.donor.cycle_status,
      variant: cycleStatusVariant(item.donor.cycle_status),
    },
    {
      label: item.pipeline_stage.label,
      variant: stageColorVariant(item.pipeline_stage.color),
    },
  ],
});
