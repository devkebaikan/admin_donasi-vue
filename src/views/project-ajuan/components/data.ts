import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllAjuan, deleteAjuan } from "@/services/ajuanService";

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val ?? 0);

const TYPE_BADGE: Record<string, string> = {
  ajuan: "bg-primary",
  refund: "bg-warning",
  more: "bg-info",
};

const STATUS_BADGE: Record<string, string> = {
  proposed: "bg-secondary",
  accepted: "bg-success",
  rejected: "bg-danger",
};

const ACTIVITY_BADGE: Record<string, string> = {
  proposed: "bg-secondary",
  pending: "bg-warning",
  accepted: "bg-success",
  claimed: "bg-info",
};

export function useAjuanTable() {
  const selectedMitraId = ref<number | "">("");
  const selectedStatus = ref<string>("");
  const selectedActivity = ref<string>("");
  const selectedType = ref<string>("");
  const dateRange = ref<string>("");

  const selectedDateFrom = computed(() => {
    if (!dateRange.value || !dateRange.value.includes(" to ")) return "";
    return dateRange.value.split(" to ")[0]?.trim() ?? "";
  });

  const selectedDateTo = computed(() => {
    if (!dateRange.value || !dateRange.value.includes(" to ")) return "";
    return dateRange.value.split(" to ")[1]?.trim() ?? "";
  });

  const extraFilters = computed(() => ({
    ...(selectedMitraId.value !== ""
      ? { mitra_id: selectedMitraId.value }
      : {}),
    ...(selectedStatus.value ? { status: selectedStatus.value } : {}),
    ...(selectedActivity.value ? { activity: selectedActivity.value } : {}),
    ...(selectedType.value ? { type: selectedType.value } : {}),
    ...(selectedDateFrom.value ? { date_from: selectedDateFrom.value } : {}),
    ...(selectedDateTo.value ? { date_to: selectedDateTo.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "project-ajuans",
    fetchFn: getAllAjuan,
    deleteFn: deleteAjuan,
    defaultSort: "id",
    defaultSortDir: "desc",
    defaultPerPage: 10,
    extraFilters,
    deleteMessages: {
      text: "Data ajuan tidak bisa dikembalikan setelah dihapus!",
      successText: "Data ajuan berhasil dihapus.",
      cancelText: "Data aman :)",
    },
    columns: [
      {
        name: "No",
        width: "50px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Rekening",
        width: "180px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold small">${cell ?? "-"}</span>`),
      },
      {
        name: "Nominal",
        width: "150px",
        formatter: (cell: number) =>
          html(
            `<span class="small text-success fw-semibold">${formatRupiah(cell)}</span>`,
          ),
      },
      {
        name: "Tipe",
        width: "80px",
        sort: false,
        formatter: (cell: string) => {
          const cls = TYPE_BADGE[cell] ?? "bg-secondary";
          return html(`<span class="badge ${cls}">${cell ?? "-"}</span>`);
        },
      },
      {
        name: "Status",
        width: "100px",
        sort: false,
        formatter: (cell: string) => {
          const cls = STATUS_BADGE[cell] ?? "bg-secondary";
          return html(`<span class="badge ${cls}">${cell ?? "-"}</span>`);
        },
      },
      {
        name: "Activity",
        width: "100px",
        sort: false,
        formatter: (cell: string) => {
          const cls = ACTIVITY_BADGE[cell] ?? "bg-secondary";
          return html(`<span class="badge ${cls}">${cell ?? "-"}</span>`);
        },
      },
      {
        name: "Mitra",
        width: "130px",
        formatter: (cell: string) =>
          html(`<span class="small">${cell ?? "-"}</span>`),
      },
      {
        name: "Aksi",
        width: "120px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
              <button class="btn btn-sm btn-soft-primary detail-btn" data-action="detail" data-id="${id}" title="Lihat Detail">
                <i class="bx bx-show fs-16"></i>
              </button>
              <button class="btn btn-sm btn-soft-warning edit-btn" data-action="edit" data-id="${id}" title="Edit">
                <i class="bx bx-edit fs-16"></i>
              </button>
              <button class="btn btn-sm btn-soft-danger delete-btn" data-action="delete" data-id="${id}" title="Hapus">
                <i class="bx bx-trash fs-16"></i>
              </button>
            </div>
          `),
      },
    ],
    rowMapper: (item: any, index: number) => [
      index,
      item.account_behalf,
      item.nominal_ajuan,
      item.type,
      item.status,
      item.activity,
      item.mitra?.nama ?? "-",
      item.id,
    ],
  });

  return {
    ...table,
    selectedMitraId,
    selectedStatus,
    selectedActivity,
    selectedType,
    selectedDateFrom,
    selectedDateTo,
    dateRange,
  };
}
