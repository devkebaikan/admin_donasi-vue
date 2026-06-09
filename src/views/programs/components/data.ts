import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllPrograms, deleteProgram } from "@/services/programService";
import { formatCurrency } from "@/helpers/format";

export function useProgramsTable() {
  const selectedCategory = ref<string | number>("");
  const selectedTipe = ref<string | number>("");

  const extraFilters = computed(() => ({
    ...(selectedCategory.value ? { category: selectedCategory.value } : {}),
    ...(selectedTipe.value ? { tipe: selectedTipe.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "programs",
    fetchFn: getAllPrograms,
    deleteFn: deleteProgram,
    defaultSort: "id",
    // defaultSortDir: "asc",
    extraFilters,
    deleteMessages: {
      text: "You won't be able to revert this!",
      successText: "Program has been deleted.",
      cancelText: "Your data is safe :)",
    },
    columns: [
      {
        name: "No",
        width: "40px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Title",
        width: "360px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Link",
        width: "80px",
        sort: false,
        formatter: (cell: string) =>
          html(
            `<a href="https://don.aksiberbagi.com/donasi/${cell}" target="_blank" rel="noopener noreferrer">${cell}</a>`,
          ),
      },
      {
        name: "Category",
        width: "140px",
        formatter: (cell: string) =>
          html(`<span class="badge bg-info text-dark">${cell}</span>`),
      },
      {
        name: "Tipe",
        width: "100px",
        formatter: (cell: string) =>
          html(`<span class="badge bg-warning text-dark">${cell}</span>`),
      },
      {
        name: "Mitra",
        width: "160px",
        formatter: (cell: string) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Target",
        width: "160px",
        formatter: (cell: number) =>
          html(
            `<span class="font-monospace small fw-semibold">${formatCurrency(cell)}</span>`,
          ),
      },
      {
        name: "Achieved",
        width: "160px",
        formatter: (cell: string) =>
          html(
            `<span class="font-monospace small fw-semibold">${formatCurrency(Number(cell))}</span>`,
          ),
      },
      {
        name: "Remaining Days",
        width: "120px",
        formatter: (cell: number | null) => {
          if (cell === null) return html(`<span class="text-muted">∞</span>`);
          const color =
            cell <= 7 ? "bg-danger" : cell <= 30 ? "bg-warning" : "bg-success";
          return html(`<span class="badge ${color}">${cell} hari</span>`);
        },
      },
      {
        name: "Actions",
        width: "100px",
        sort: false,
        formatter: (program: { id: number; link: string }) =>
          html(`
            <div class="d-flex gap-2 justify-content-center">
              <a href="/programs/${program.link}/edit"
                class="btn btn-sm btn-soft-warning"
                title="Edit Program">
                <i class="bx bx-edit fs-16"></i>
              </a>
            </div>
            <div class="d-flex gap-2 justify-content-center">
              <a href="/programs/${program.id}/projects"
                class="btn btn-sm btn-soft-success"
                title="Projects">
                <i class="bx bx-folder-open fs-16"></i>
              </a>
            </div>
            <div class="d-flex gap-2 justify-content-center">
              <a href="/programs/${program.id}/news"
                class="btn btn-sm btn-soft-info"
                title="News">
                <i class="bx bx-news fs-16"></i>
              </a>
            </div>
          `),
      },
    ],

    rowMapper: (program: any, index: number) => [
      index,
      program.title,
      program.link,
      program.category?.name ?? "-",
      program.tipe?.name ?? "-",
      program.mitra?.name ?? "-",
      program.nominal_target,
      program.nominal_achieved,
      program.remaining_days,
      { id: program.id, link: program.link },
    ],
  });

  return {
    ...table,
    selectedCategory,
    selectedTipe,
  };
}
