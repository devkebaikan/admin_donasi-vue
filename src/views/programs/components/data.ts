import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getAllPrograms, deleteProgram } from "@/services/programService";
import { formatCurrency } from "@/helpers/format";
import { hasPermission } from "@/helpers/permission";

const isCanEdit = hasPermission("program:update");

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
        width: "300px",
        formatter: (item: { title: string; link: string; mitra: string }) =>
          html(`
            <div style="max-width: 280px">
              <div class="fw-semibold text-dark text-truncate" title="${item.title}">${item.title}</div>
              <div class="text-muted text-truncate" style="font-size: 11px">
                ${item.mitra}
              </div>
              <div class="text-truncate" style="font-size: 11px">
                <i class="bx bx-link me-1"></i><a href="https://don.aksiberbagi.com/donasi/${item.link}" target="_blank" rel="noopener noreferrer">${item.link}</a>
              </div>
            </div>
          `),
      },
      {
        name: "Type & Category",
        width: "130px",
        formatter: (item: { category: string; tipe: string }) =>
          html(`
            <div class="d-flex flex-column gap-1 align-items-start">
              <div class="badge bg-warning text-dark">${item.tipe}</div>
              <div class="badge bg-info text-dark">${item.category}</div>
            </div>
            `),
      },
      {
        name: "Summary Project",
        width: "170px",
        formatter: (cell: { status: string; count: number }[]) =>
          html(`
            <div class="d-flex flex-wrap gap-1" style="max-width: 160px">
              ${cell
                .map(
                  (item) => `
                <span class="badge badge-outline-primary">
                  ${item.status}: ${item.count}
                </span>`,
                )
                .join("")}
            </div>
          `),
      },
      {
        name: "Progress Dana",
        width: "190px",
        formatter: (cell: { target: number; achieved: number }) => {
          const target = Number(cell.target) || 0;
          const achieved = Number(cell.achieved) || 0;
          const pct = target > 0 ? Math.min((achieved / target) * 100, 100) : 0;
          return html(`
            <div style="min-width: 170px">
              <div class="d-flex justify-content-between mb-1">
                <small class="text-muted" style="font-size: 10px">Target</small>
                <span class="font-monospace fw-semibold" style="font-size: 11px">${formatCurrency(target)}</span>
              </div>
              <div class="progress" style="height: 6px">
                <div class="progress-bar bg-success" style="width: ${pct}%"></div>
              </div>
              <div class="d-flex justify-content-between mt-1">
                <small class="font-monospace fw-semibold text-success" style="font-size: 11px">${formatCurrency(achieved)}</small>
                <small class="text-muted fw-semibold" style="font-size: 10px">${pct.toFixed(0)}%</small>
              </div>
            </div>
          `);
        },
      },
      {
        name: "Sisa hari",
        width: "100px",
        formatter: (cell: number | null) => {
          if (cell === null) return html(`<span class="text-muted">∞</span>`);
          const color =
            cell <= 7 ? "bg-danger" : cell <= 30 ? "bg-warning" : "bg-success";
          return html(`<span class="badge ${color}">${cell} hari</span>`);
        },
      },
      {
        name: "Actions",
        width: "120px",
        sort: false,
        formatter: (program: { id: number; link: string }) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
              <button
                class="btn btn-sm btn-soft-primary detail-btn"
                data-action="detail"
                data-link="${program.link}"
                title="Lihat Detail">
                <i class="bx bx-show fs-16"></i>
              </button>

              ${
                isCanEdit
                  ? `<button
                class="btn btn-sm btn-soft-warning edit-btn"
                data-action="edit"
                data-link="${program.link}"
                title="Edit Program">
                <i class="bx bx-edit fs-16"></i>
              </button>`
                  : ""
              }

              <button
                class="btn btn-sm btn-soft-success projects-btn"
                data-action="projects"
                data-id="${program.id}"
                title="Projects">
                <i class="bx bx-folder-open fs-16"></i>
              </button>
            </div>
          `),
      },
    ],

    rowMapper: (program: any, index: number) => [
      index,
      {
        title: program.title,
        link: program.link,
        mitra: program.mitra?.name ?? "-",
      },
      {
        category: program.category?.name ?? "-",
        tipe: program.tipe?.name ?? "-",
      },
      program.project_summary,
      {
        target: program.nominal_target,
        achieved: program.nominal_achieved,
      },
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
