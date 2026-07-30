import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getSettings, deleteSetting } from "@/services/settingService";

export function useSettingsTable() {
  const selectedType = ref<string>("");

  const extraFilters = computed(() => ({
    ...(selectedType.value ? { type: selectedType.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "settings",
    fetchFn: getSettings,
    defaultSort: "id",
    extraFilters,
    deleteFn: deleteSetting,
    deleteMessages: {
      text: "You won't be able to revert this!",
      successText: "Setting has been deleted.",
      cancelText: "Your data is safe :)",
    },
    columns: [
      {
        name: "No",
        width: "50px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Name",
        width: "200px",
        formatter: (cell: string) =>
          html(`<code class="text-primary">${cell}</code>`),
      },
      {
        name: "Value",
        width: "360px",
        formatter: (cell: string) => {
          try {
            const parsed = JSON.parse(cell);
            const pretty = JSON.stringify(parsed, null, 2);
            return html(
              `<pre class="mb-0 small text-muted" style="white-space:pre-wrap;word-break:break-all;max-width:340px">${pretty}</pre>`,
            );
          } catch {
            const truncated = cell.length > 80 ? cell.slice(0, 80) + "…" : cell;
            return html(
              `<span class="small text-muted" style="word-break:break-all">${truncated}</span>`,
            );
          }
        },
      },
      {
        name: "Type",
        width: "110px",
        formatter: (cell: string) => {
          const colorMap: Record<string, string> = {
            apiKey: "bg-danger",
            company: "bg-primary",
            default: "bg-success",
            migration: "bg-warning text-dark",
          };
          const cls = colorMap[cell] ?? "bg-secondary";
          return html(`<span class="badge ${cls}">${cell}</span>`);
        },
      },
      {
        name: "Updated At",
        width: "130px",
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
      // {
      //   name: "Actions",
      //   width: "100px",
      //   sort: false,
      //   formatter: (id: number) =>
      //     html(`
      //       <div class="d-flex gap-1 justify-content-center">
      //         <button
      //           class="btn btn-sm btn-soft-warning edit-btn"
      //           data-action="edit"
      //           data-id="${id}"
      //           title="Edit Setting">
      //           <i class="bx bx-edit fs-16"></i>
      //         </button>

      //       </div>
      //     `),
      // },
    ],
    // <button
    //   class="btn btn-sm btn-soft-danger delete-btn"
    //   data-action="delete"
    //   data-id="${id}"
    //   title="Delete Setting">
    //   <i class="bx bx-trash fs-16"></i>
    // </button>
    rowMapper: (item: any, index: number) => [
      index,
      item.name,
      item.value,
      item.type,
      item.updated_at,
      // item.id,
    ],
  });

  return {
    ...table,
    selectedType,
  };
}
