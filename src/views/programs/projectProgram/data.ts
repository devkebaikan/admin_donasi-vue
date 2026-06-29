import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getProjects, deleteProject } from "@/services/projectService";
import { formatCurrency, formatDate } from "@/helpers/format";

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-secondary",
  diajukan: "bg-warning text-dark",
  diterima: "bg-success",
  ditolak: "bg-danger",
};

const ACTIVITY_BADGE: Record<string, string> = {
  inactive: "bg-secondary",
  "active open": "bg-success",
  "active close": "bg-secondary",
  selesai: "bg-primary",
};

export function useProjectsTable() {
  const selectedStatus = ref<string>("");
  const selectedActivity = ref<string>("");
  const selectedMitraId = ref<string | number>("");
  const selectedProgramId = ref<string | number>("");

  const extraFilters = computed(() => ({
    ...(selectedStatus.value ? { status: selectedStatus.value } : {}),
    ...(selectedActivity.value ? { activity: selectedActivity.value } : {}),
    ...(selectedMitraId.value ? { mitra_id: selectedMitraId.value } : {}),
    ...(selectedProgramId.value ? { program_id: selectedProgramId.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "projects",
    fetchFn: getProjects,
    deleteFn: deleteProject,
    defaultSort: "id",
    defaultPerPage: 5,
    extraFilters,
    deleteMessages: {
      text: "You won't be able to revert this!",
      successText: "Project has been deleted.",
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
        name: "Judul",
        width: "300px",
        formatter: (cell: string) =>
          html(`<span class="fw-semibold">${cell}</span>`),
      },
      {
        name: "Status",
        width: "100px",
        formatter: (cell: string) => {
          const badge = STATUS_BADGE[cell] ?? "bg-secondary";
          return html(`<span class="badge ${badge}">${cell}</span>`);
        },
      },
      {
        name: "Activity",
        width: "100px",
        formatter: (cell: string) => {
          const badge = ACTIVITY_BADGE[cell] ?? "bg-secondary";
          return html(`<span class="badge ${badge}">${cell ?? "-"}</span>`);
        },
      },
      {
        name: "Nominal",
        width: "180px",
        formatter: (item: { ajuan: number; acc: number }) =>
          html(
            `<div class="small lh-sm">
              <div>
                <span class="text-muted">Diajukan</span>
                <span class="fw-semibold">
                  ${formatCurrency(item.ajuan)}
                </span>
              </div>

              <div class="mt-1">
                <span class="text-muted">Disetujui</span>
                <span class="fw-semibold text-success">
                  ${formatCurrency(item.acc)}
                </span>
              </div>
            </div>`,
          ),
      },
      {
        name: "Pelaksanaan",
        width: "100px",
        formatter: (cell: string) =>
          html(
            `<span class="text-muted small">${formatDate(cell) ?? "-"}</span>`,
          ),
      },
      {
        name: "Actions",
        width: "40px",
        sort: false,
        formatter: (id: number) =>
          html(`
            <div class="d-flex flex-column gap-1 justify-content-center align-items-center">
              <button
                class="btn btn-sm btn-soft-primary detail-btn"
                style='width:48px'
                data-action="detail"
                data-id="${id}"
                title="Lihat Detail">
                <i class="bx bx-show fs-16"></i>
              </button>
              <button
                class="btn btn-sm btn-soft-warning edit-btn"
                style='width:48px'
                data-action="edit"
                data-id="${id}"
                title="Edit Project">
                <i class="bx bx-edit fs-16"></i>
              </button>
              <button
                class="btn btn-sm btn-soft-success manage-btn"
                style='width:48px'
                data-action="manage"
                data-id="${id}"
                title="Manage Project">
                <i class="bx bx-cog fs-16"></i>
              </button>
              <button
                class="btn btn-sm btn-soft-green report-btn"
                style='width:48px'
                data-action="report"
                data-id="${id}"
                title="Report Project">
                <i class="bx bxs-report fs-16"></i>
              </button>
              </div>
              `),
      },
    ],

    // <button
    //   class="btn btn-sm btn-soft-danger delete-btn"
    //   data-action="delete"
    //   data-id="${id}"
    //   title="Hapus Project">
    //   <i class="bx bx-trash fs-16"></i>
    // </button>

    rowMapper: (project: any, index: number) => [
      index,
      project.judul,
      project.status,
      project.activity,
      { ajuan: project.nominal_ajuan, acc: project.nominal_acc },
      project.waktu_pelaksanaan,
      project.id,
    ],
  });

  return {
    ...table,
    selectedStatus,
    selectedActivity,
    selectedMitraId,
    selectedProgramId,
  };
}
