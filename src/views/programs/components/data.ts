// components/data.ts
import { computed, ref } from "vue";
import { html } from "gridjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";

import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/dist/sweetalert2.css";
import { getAllPrograms, deleteProgram } from "@/services/programService";
import { formatCurrency } from "@/helpers/format";

export function useBasicTableOptions() {
  const selectedCategory = ref("");
  const selectedTipe = ref("");
  const searchQuery = ref("");
  const currentPage = ref(1);
  const perPageItem = ref(10);
  const sortOrder = ref("id");
  const sortDir = ref("asc");
  const tableKey = ref(0);

  const queryClient = useQueryClient();

  const queryKey = computed(() => [
    "programs",
    selectedCategory.value,
    selectedTipe.value,
    searchQuery.value,
    currentPage.value,
    sortOrder.value,
    sortDir.value,
  ]);

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () => {
      const params: any = {
        limit: perPageItem.value,
        mode: "pagination",
        page: currentPage.value,
        order: sortOrder.value,
        sort: sortDir.value,
      };

      if (selectedCategory.value) params.category = selectedCategory.value;
      if (searchQuery.value) params.search = searchQuery.value;

      return getAllPrograms(params);
    },
  });

  const tableData = computed(() => {
    return data.value?.data || [];
  });

  const totalRows = computed(() => {
    return data.value?.meta?.total || 0;
  });

  const totalPages = computed(() => {
    return data.value?.meta?.last_page || 1;
  });

  const formattedTableData = computed(() => {
    return tableData.value.map((program: any) => [
      program.id,
      program.title,
      program.link,
      program.category?.name || "-",
      program.tipe?.name || "-",
      program.mitra?.name || "-",
      program.nominal_target,
      program.nominal_achieved,
      // program.progress_achieved,
      program.remaining_days,
      program.id,
    ]);
  });

  // DELETE MUTATION
  const { mutate: removeProgram, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteProgram(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["programs"],
        exact: false,
      });
      tableKey.value++;
    },
    onError: (err: any) => {
      console.log(err?.message ?? "Failed to delete program");
    },
  });

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      confirmButtonColor: "#ff6c2f",
      cancelButtonColor: "#ef5f5f",
    }).then((result: any) => {
      if (result.isConfirmed) {
        removeProgram(id);
        Swal.fire({
          title: "Deleted!",
          text: "Program has been deleted.",
          icon: "success",
          confirmButtonColor: "#ff6c2f",
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Cancelled",
          text: "Your data is safe :)",
          icon: "error",
          confirmButtonColor: "#ff6c2f",
        });
      }
    });
  };

  // TABLE OPTIONS
  const basicTableOptions = computed(() => ({
    columns: [
      {
        name: "No",
        width: "60px",
        formatter: (cell: number) => {
          return html(`<span class="text-muted small">${cell}</span>`);
        },
      },
      {
        name: "Title",
        width: "360px",
        formatter: (cell: string) => {
          return html(`<span class="fw-semibold">${cell}</span>`);
        },
      },
      {
        name: "Link",
        width: "80px",
        sort: false,
        formatter: (cell: string) => {
          return html(
            `<a href="https://aksiberbagi.com/donasi/detail/${cell}" target="_blank" rel="noopener noreferrer" >${cell}</a>`,
          );
        },
      },
      {
        name: "Category",
        width: "140px",
        formatter: (cell: string) => {
          return html(`<span class="badge bg-info text-dark">${cell}</span>`);
        },
      },
      {
        name: "Tipe",
        width: "100px",
        formatter: (cell: string) => {
          return html(
            `<span class="badge bg-warning text-dark">${cell}</span>`,
          );
        },
      },
      {
        name: "Mitra",
        width: "160px",
        formatter: (cell: string) => {
          return html(`<span class="text-muted small">${cell}</span>`);
        },
      },
      {
        name: "Target",
        width: "160px",
        formatter: (cell: number) => {
          return html(
            `<span class="font-monospace small">${formatCurrency(cell)}</span>`,
          );
        },
      },
      {
        name: "Achieved",
        width: "160px",
        formatter: (cell: string) => {
          return html(
            `<span class="font-monospace small">${formatCurrency(Number(cell))}</span>`,
          );
        },
      },
      // {
      //   name: "Progress",
      //   width: "120px",
      //   formatter: (cell: string) => {
      //     const pct = parseFloat(cell) || 0;
      //     const color =
      //       pct >= 100
      //         ? "bg-success"
      //         : pct >= 50
      //           ? "bg-primary"
      //           : pct >= 10
      //             ? "bg-warning"
      //             : "bg-danger";
      //     return html(`
      //       <div>
      //         <div class="progress" style="height:6px;">
      //           <div class="progress-bar ${color}" style="width:${Math.min(pct, 100)}%"></div>
      //         </div>
      //         <small class="text-muted">${pct}%</small>
      //       </div>
      //     `);
      //   },
      // },
      {
        name: "Remaining Days",
        width: "120px",
        formatter: (cell: number | null) => {
          if (cell === null) return html(`<span class="text-muted">∞</span>`);
          const color =
            cell <= 7 ? "bg-danger" : cell <= 30 ? "bg-warning" : "bg-success";
          return html(`<span class="badge ${color}">${cell} days</span>`);
        },
      },
      {
        name: "Actions",
        width: "100px",
        sort: false,
        formatter: (id: number) => {
          return html(`
           <div class="d-flex gap-2 justify-content-center">
              <a href="/programs/${id}/edit"
                type="button"
                class="btn btn-sm btn-soft-warning"
                title="Edit Program">
                <i class="bx bx-edit fs-16"></i>
              </a>
            </div>

            <div class="d-flex gap-2 justify-content-center">
              <a href="/programs/${id}/projects"
                type="button"
                class="btn btn-sm btn-soft-success"
                title="Projects">
                <i class="bx bx-folder-open fs-16"></i>
              </a>
            </div>

            <div class="d-flex gap-2 justify-content-center">
              <a href="/programs/${id}/news"
                type="button"
                class="btn btn-sm btn-soft-info"
                title="News">
                <i class="bx bx-news fs-16"></i>
              </a>
            </div>
              `);
        },
      },
    ],
    // <button
    //   data-id="${id}"
    //   data-action="delete"
    //   type="button"
    //   class="delete-btn btn btn-sm btn-soft-danger"
    //   title="Delete Program">
    //   <i class="bx bx-trash fs-16"></i>
    // </button>
    pagination: false,
    sort: true,
    search: false,
    data: formattedTableData.value,
    autoWidth: true,
    fixedHeader: true,
  }));

  const resetPage = () => {
    currentPage.value = 1;
  };

  return {
    basicTableOptions,
    data,
    isLoading,
    isFetching,
    isDeleting,
    isError: !!error.value,
    error,
    selectedCategory,
    selectedTipe,
    searchQuery,
    currentPage,
    perPageItem,
    totalRows,
    totalPages,
    sortOrder,
    sortDir,
    resetPage,
    handleDelete,
    tableKey,
  };
}
