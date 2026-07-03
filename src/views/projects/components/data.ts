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
        formatter: (item: { activity: string; id: number }) =>
          html(`
            <div
              class="d-grid gap-0 justify-content-center"
              style="grid-template-columns: repeat(2, auto);"
            >
              <button
                  class="btn btn-sm btn-soft-primary detail-btn"
                  style='width:48px'
                  data-action="detail"
                  data-id="${item.id}"
                  title="Lihat Detail">
                  <i class="bx bx-show fs-16"></i>
                </button>             

                <button
                  class="btn btn-sm btn-soft-warning edit-btn"
                  style='width:48px'
                  data-action="edit"
                  data-id="${item.id}"
                  title="Edit Project">
                  <i class="bx bx-edit-alt fs-16"></i>
                </button>
                
                ${
                  item.activity === "active open"
                    ? `
                    <button
                      class="btn btn-sm btn-soft-success funding-btn"
                      style="width:48px"
                      data-action="funding"
                      data-id="${item.id}"
                      title="Funding Project"
                    >
                      <i class="bx bx-dollar-circle fs-16"></i>
                    </button>
                  `
                    : ""
                }

                <button
                  class="btn btn-sm btn-soft-info kegiatan-btn"
                  style='width:48px'
                  data-action="kegiatan"
                  data-id="${item.id}"
                  title="Kegiatan Project">
                  <!-- Mengubah ikon ke task/list yang lebih dinamis -->
                  <i class="bx bx-task fs-16"></i>
                </button>

                <button
                  class="btn btn-sm btn-soft-secondary manage-btn" 
                  style='width:48px'
                  data-action="manage"
                  data-id="${item.id}"
                  title="Manage Project">
                  <!-- Mengubah warna ke secondary/dark agar tidak kembar hijau dengan funding -->
                  <i class="bx bx-cog fs-16"></i>
                </button>

                <button
                  class="btn btn-sm btn-soft-danger report-btn"
                  style='width:48px'
                  data-action="report"
                  data-id="${item.id}"
                  title="Report Project">
                  <!-- Mengubah kelas warna menjadi danger (merah soft) agar stand out -->
                  <i class="bx bxs-report fs-16"></i>
                </button>
              </div>
              `),
      },
    ],

    // <button
    //   class="btn btn-sm btn-soft-danger delete-btn"
    //   data-action="delete"
    //   data-id="${item.id}"
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
      { activity: project.activity, id: project.id },
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
