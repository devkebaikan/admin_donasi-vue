import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllBenefits, deleteBenefit } from "@/services/benefitService";

export function useBenefitTable() {
  const publishedOnly = ref(false);
  const extraFilters = computed(() => ({
    ...(publishedOnly.value ? { published_only: 1 } : {}),
  }));

  const table = useDataTable({
    queryKey: "crm-benefits",
    fetchFn: getAllBenefits,
    deleteFn: deleteBenefit,
    defaultSort: "id",
    defaultSortDir: "desc",
    defaultPerPage: 10,
    extraFilters,
    deleteMessages: {
      text: "Benefit yang dihapus tidak bisa dikembalikan.",
      successText: "Benefit berhasil dihapus.",
      cancelText: "Benefit tetap aman.",
    },
    columns: [
      {
        name: "No",
        width: "50px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Judul",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Jenis",
        width: "110px",
        formatter: (cell: string) =>
          html(`<span class="text-capitalize">${cell}</span>`),
      },
      {
        name: "Periode",
        width: "140px",
        formatter: (cell: string) => html(`<span>${cell}</span>`),
      },
      {
        name: "Status",
        width: "120px",
        formatter: (cell: string) =>
          html(
            `<span class="badge ${cell === "published" ? "bg-success" : "bg-secondary"} text-uppercase">${cell}</span>`,
          ),
      },
      {
        name: "Target Levels",
        width: "100px",
        formatter: (cell: string[]) =>
          html(
            `<div class="d-flex flex-wrap gap-1">${cell
              .map(
                (level) =>
                  `<span class="badge bg-info-subtle text-info-emphasis">${level}</span>`,
              )
              .join("")}</div>`,
          ),
      },
      {
        name: "Dipakai",
        width: "90px",
        formatter: (cell: number) =>
          html(`<span class="text-muted">${cell}</span>`),
      },
      {
        name: "Aksi",
        width: "150px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-1 justify-content-center flex-wrap">
              <button class="btn btn-sm btn-soft-primary detail-btn" data-action="detail" data-id="${id}" title="Detail">
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
      item.judul,
      item.jenis,
      item.periode,
      item.status,
      item.target_levels,
      item.dipakai_count,
      item.id,
    ],
  });

  return {
    ...table,
    publishedOnly,
  };
}
