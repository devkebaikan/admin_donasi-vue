import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import {
  getAllKeuangan,
  deleteKeuangan,
} from "@/services/projectKeuanganService";

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

export function useKeuanganTable() {
  const selectedKegiatanId = ref<number | "">("");
  const selectedMitraId = ref<number | "">("");

  const extraFilters = computed(() => ({
    ...(selectedKegiatanId.value !== ""
      ? { kegiatan_id: selectedKegiatanId.value }
      : {}),
    ...(selectedMitraId.value !== ""
      ? { mitra_id: selectedMitraId.value }
      : {}),
  }));

  const table = useDataTable({
    queryKey: "project-keuangans",
    fetchFn: getAllKeuangan,
    deleteFn: deleteKeuangan,
    defaultSort: "id",
    defaultSortDir: "desc",
    defaultPerPage: 10,
    extraFilters,
    deleteMessages: {
      text: "Data keuangan tidak bisa dikembalikan setelah dihapus!",
      successText: "Data keuangan berhasil dihapus.",
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
        name: "Items",
        width: "220px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell ?? "-"}</span>`),
      },
      {
        name: "Nominal",
        width: "160px",
        formatter: (cell: number) =>
          html(
            `<span class="small text-success fw-semibold">${formatRupiah(cell)}</span>`,
          ),
      },
      {
        name: "Kegiatan",
        width: "200px",
        formatter: (cell: string) =>
          html(`<span class="small">${cell ?? "-"}</span>`),
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
      item.items,
      item.nominal,
      item.kegiatan?.nama ?? "-",
      item.mitra?.nama ?? "-",
      item.id,
    ],
  });

  return { ...table, selectedKegiatanId, selectedMitraId };
}
