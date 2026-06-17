import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import {
  getProgramShows,
  deleteProgramShow,
} from "@/services/programShowService";

export function useProgramShowsTable(programId?: number) {
  const selectedType = ref<string>("");

  const extraFilters = computed(() => ({
    ...(programId ? { program_id: programId } : {}),
    ...(selectedType.value ? { type: selectedType.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "program-shows",
    fetchFn: getProgramShows,
    deleteFn: deleteProgramShow,
    defaultSort: "id",
    extraFilters,
    deleteMessages: {
      text: "You won't be able to revert this!",
      successText: "Program show has been deleted.",
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
        name: "Program",
        width: "100px",
        formatter: (cell) => {
          return cell
            ? html(
                `<img src="${cell}" alt="image" style="width:80px;height:52px;object-fit:cover;border-radius:4px;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
                 <div style="display:none;width:80px;height:52px;background:#f8f9fa;border-radius:4px;align-items:center;justify-content:center;">
                   <i class="bx bx-image text-muted fs-4"></i>
                 </div>`,
              )
            : html(
                `<div style="width:80px;height:52px;background:#f8f9fa;border-radius:4px;display:flex;align-items:center;justify-content:center;">
                   <i class="bx bx-image text-muted fs-4"></i>
                 </div>`,
              );
        },
      },
      {
        name: "Program",
        width: "340px",
        formatter: (cell) =>
          html(`
            <div class="d-flex align-items-center gap-2">
              <span class="fw-semibold small">${cell}</span>
            </div>
          `),
      },
      {
        name: "Slug",
        width: "160px",
        formatter: (cell: string) =>
          html(
            `<a href="https://don.aksiberbagi.com/donasi/${cell}" target="_blank" rel="noopener noreferrer" class="small">${cell}</a>`,
          ),
      },
      {
        name: "Type",
        width: "100px",
        formatter: (cell: string) => {
          const colorMap: Record<string, string> = {
            darurat: "bg-danger",
            home: "bg-primary",
            featured: "bg-warning text-dark",
            latest: "bg-info text-dark",
            popular: "bg-success",
            trending: "bg-purple",
            special: "bg-secondary",
            recommend: "bg-dark",
          };
          const cls = colorMap[cell] ?? "bg-secondary";
          return html(`<span class="badge ${cls}">${cell}</span>`);
        },
      },
      {
        name: "Created At",
        width: "140px",
        formatter: (cell: string) => {
          const date = new Date(cell);
          const formatted = date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          return html(`<span class="text-muted small">${formatted}</span>`);
        },
      },
      {
        name: "Actions",
        width: "70px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex gap-1 justify-content-center">
              <button
                class="btn btn-sm btn-soft-danger delete-btn"
                data-action="delete"
                data-id="${id}"
                title="Delete">
                <i class="bx bx-trash fs-16"></i>
              </button>
            </div>
          `),
      },
    ],

    rowMapper: (item: any, index: number) => [
      index,
      item.program?.image,
      item.program?.name,
      item.program?.slug ?? "-",
      item.type,
      item.created_at,
      item.id,
    ],
  });

  return {
    ...table,
    selectedType,
  };
}
