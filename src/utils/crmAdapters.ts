import { formatCurrency } from "@/helpers/format";
import type { CrmBoardItem, CrmCaseCard } from "../types/crm";

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

export const toCaseCard = (item: CrmBoardItem): CrmCaseCard => {
  const name =
    item.donor?.name || ("task" in item ? item.task : undefined) || "Donatur";
  const tags = [];

  if (item.donor?.level) {
    tags.push({ label: item.donor.level, variant: "secondary" });
  }
  if (item.donor?.cycle_status) {
    tags.push({
      label: item.donor.cycle_status,
      variant: cycleStatusVariant(item.donor.cycle_status),
    });
  }
  const stageLabel =
    item.pipeline_stage?.label ??
    ("source_stage" in item ? item.source_stage : undefined);
  if (stageLabel) {
    tags.push({
      label: stageLabel,
      variant: stageColorVariant(item.pipeline_stage?.color),
    });
  }

  return {
    id: item.id,
    initials: initialsOf(name),
    colorVariant: colorTagVariant(item.donor?.color_tag),
    color_tag: item.donor?.color_tag,
    name,
    nickname: item.donor?.nick,
    phone: item.donor?.phone ?? "",
    amount: item.transaction ? formatCurrency(item.transaction.total) : undefined,
    stage: stageLabel,
    tags,
  };
};
