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
        width: "160px",
        formatter: (item: {
          ajuan: number;
          acc: number;
          claimed: number;
          alokasi: number;
          tfMitra: number;
          pakaiMitra: number;
          refundMitra: number;
          sisaDana: number;
        }) =>
          html(`
      <div class="small lh-sm">

        <div class="d-flex justify-content-between">
          <span class="text-muted">Diajukan</span>
          <span class="fw-semibold">
            ${formatCurrency(item.ajuan)}
          </span>
        </div>

        <div class="d-flex justify-content-between mt-1">
          <span class="text-muted">Disetujui</span>
          <span class="fw-semibold text-success">
            ${formatCurrency(item.acc)}
          </span>
        </div>

        <div class="d-flex justify-content-between mt-1">
          <span class="text-muted">Terklaim</span>
          <span class="fw-semibold">
            ${formatCurrency(item.claimed)}
          </span>
        </div>

        <div class="d-flex justify-content-between mt-1">
          <span class="text-muted">Alokasi</span>
          <span class="fw-semibold">
            ${formatCurrency(item.alokasi)}
          </span>
        </div>

        <div class="d-flex justify-content-between mt-1">
          <span class="text-muted">TF Mitra</span>
          <span class="fw-semibold">
            ${formatCurrency(item.tfMitra)}
          </span>
        </div>

        <div class="d-flex justify-content-between mt-1">
          <span class="text-muted">Pakai Mitra</span>
          <span class="fw-semibold">
            ${formatCurrency(item.pakaiMitra)}
          </span>
        </div>

        <div class="d-flex justify-content-between mt-1">
          <span class="text-muted">Refund</span>
          <span class="fw-semibold text-danger">
            ${formatCurrency(item.refundMitra)}
          </span>
        </div>

        <hr class="my-2"/>

        <div class="d-flex justify-content-between">
          <span class="fw-semibold">Sisa Dana</span>
          <span class="fw-bold text-primary">
            ${formatCurrency(item.sisaDana)}
          </span>
        </div>

      </div>
    `),
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
        formatter: (item: {
          activity: string;
          id: number;
          alokasi: number;
          refundMitra: number;
        }) =>
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
                    <button
                      class="btn btn-sm btn-soft-secondary keuangan-btn"
                      style="width:48px"
                      data-action="keuangan"
                      data-id="${item.id}"
                      title="Keuangan Project"
                    >
                      <i class="bx bx-money fs-16"></i>
                    </button>
                  `
                    : ""
                }
                
                ${
                  item.alokasi > 0 &&
                  (item.activity === "active open" ||
                    item.activity === "active close")
                    ? `
                    <button
                      class="btn btn-sm btn-soft-primary ajuan-btn"
                      style="width:48px"
                      data-action="ajuan"
                      data-id="${item.id}"
                      title="Ajuan Project"
                    >
                      <i class="bx bx-receipt fs-16"></i>
                    </button>
                  `
                    : ""
                }
                ${
                  item.refundMitra > 0 &&
                  (item.activity === "active open" ||
                    item.activity === "active close" ||
                    item.activity === "selesai")
                    ? `
                    <button
                      class="btn btn-sm btn-soft-danger refund-btn"
                      style="width:48px"
                      data-action="refund"
                      data-id="${item.id}"
                      title="Refund Project"
                    >
                     <i class="bx bx-revision fs-16"></i>
                    </button>
                  `
                    : ""
                }
              </div>
              `),
      },
    ],

    rowMapper: (project: any, index: number) => [
      index,
      project.judul,
      project.status,
      project.activity,
      {
        ajuan: project.nominal_ajuan,
        acc: project.nominal_acc,
        claimed: project.claimed_donasi,
        alokasi: project.total_alokasi,
        tfMitra: project.total_tf_ke_mitra,
        pakaiMitra: project.total_pakai_mitra,
        refundMitra: project.total_refund_mitra,
        sisaDana: project.sisa_dana_mitra,
      },
      project.waktu_pelaksanaan,
      {
        activity: project.activity,
        id: project.id,
        alokasi: project.total_alokasi,
        refundMitra: project.total_refund_mitra,
      },
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
