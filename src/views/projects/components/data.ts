import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getProjects, deleteProject } from "@/services/projectService";
import { formatCurrency, formatDate } from "@/helpers/format";
import { hasPermission } from "@/helpers/permission";

const isCanApprove = hasPermission("project:approve");

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

// Helper untuk render tombol berdasarkan kondisi
const renderActionButtons = (item: {
  id: number;
  activity: string;
  claimed: number;
  acc: number;
  sisaDana: number;
  tfMitra: number;
}) => {
  const kurangFunding = item.acc - item.claimed;
  const belumCair = item.claimed - item.tfMitra;

  let html = '<div class="d-flex flex-column gap-2">';

  // Funding Section
  if (isCanApprove && item.activity === "active open") {
    html += `
      <div class="d-flex align-items-center gap-2 p-2 bg-light rounded">
        <button class="btn btn-sm btn-soft-success funding-btn flex-shrink-0"
          data-action="funding" data-id="${item.id}"
          title="Tambah Funding">
          <i class="bx bx-dollar-circle fs-16"></i>
        </button>
        <div class="small flex-grow-1 text-truncate">
          <div class="text-muted">Kurang Funding</div>
          <div class="fw-semibold text-warning">${formatCurrency(kurangFunding)}</div>
        </div>
      </div>
    `;
  }

  // Ajuan Section
  if (
    isCanApprove
    // &&
    // item.claimed > 0 &&
    // (item.activity === "active open" || item.activity === "active close")
  ) {
    html += `
      <div class="d-flex align-items-center gap-2 p-2 bg-light rounded">
        <button class="btn btn-sm btn-soft-info ajuan-btn flex-shrink-0"
          data-action="ajuan" data-id="${item.id}"
          title="Ajuan Dana">
          <i class="bx bx-receipt fs-16"></i>
        </button>
        <div class="small flex-grow-1 text-truncate">
          <div class="text-muted">Belum Cair</div>
          <div class="fw-semibold text-primary">${formatCurrency(belumCair)}</div>
        </div>
      </div>
    `;
  }

  // Keuangan Section
  if (isCanApprove && item.activity === "active open" && item.sisaDana) {
    html += `
      <div class="d-flex align-items-center gap-2 p-2 bg-light rounded">
        <button class="btn btn-sm btn-soft-secondary keuangan-btn flex-shrink-0"
          data-action="keuangan" data-id="${item.id}"
          title="Laporan Keuangan">
          <i class="bx bx-money fs-16"></i>
        </button>
        <div class="small flex-grow-1 text-truncate">
          <div class="text-muted">Sisa Dana</div>
          <div class="fw-semibold text-success">${formatCurrency(item.sisaDana)}</div>
        </div>
      </div>
    `;
  }

  // Refund Section
  if (
    isCanApprove &&
    item.sisaDana > 0 &&
    (item.activity === "active open" ||
      item.activity === "active close" ||
      item.activity === "selesai")
  ) {
    html += `
      <div class="d-flex align-items-center gap-2 p-2 bg-light rounded">
        <button class="btn btn-sm btn-soft-danger refund-btn flex-shrink-0"
          data-action="refund" data-id="${item.id}"
          title="Refund Dana">
          <i class="bx bx-revision fs-16"></i>
        </button>
        <div class="small flex-grow-1 text-truncate">
          <div class="text-muted">Sisa Dana</div>
          <div class="fw-semibold text-danger">${formatCurrency(item.sisaDana)}</div>
        </div>
      </div>
    `;
  }

  html += "</div>";

  return html.includes("btn-soft-")
    ? html
    : '<span class="text-muted small text-center d-block">—</span>';
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
        name: "Proyek",
        width: "280px",
        formatter: (item: {
          id: number;
          judul: string;
          status: string;
          activity: string;
          pelaksanaan: string;
        }) => {
          const badgeStatus = STATUS_BADGE[item.status] ?? "bg-secondary";
          const badgeActivity = ACTIVITY_BADGE[item.activity] ?? "bg-secondary";
          return html(`
            <div class="fw-semibold">${item.judul}</div>
            <div class="d-flex justify-content-between align-items-center mt-1">
              <div class="d-flex gap-1">
                <span class="badge ${badgeStatus}">${item.status}</span>
                <span class="badge ${badgeActivity}">${item.activity ?? "-"}</span>
              </div>
            </div>
            <small class="text-muted d-block mt-2">${formatDate(item.pelaksanaan) ?? "-"}</small>
            <div class="d-flex gap-1 mt-3">
              <button class="btn btn-sm btn-soft-primary detail-btn flex-fill"
                data-action="detail" data-id="${item.id}" title="Lihat Detail">
                <i class="bx bx-show me-1"></i>Detail
              </button>
              <button class="btn btn-sm btn-soft-warning kegiatan-btn flex-fill"
                data-action="kegiatan" data-id="${item.id}" title="Progres Proyek">
                <i class="bx bx-task me-1"></i>Progres
              </button>
            </div>
            `);
        },
      },
      {
        name: "Keuangan",
        width: "280px",
        formatter: (item: {
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
          <span class="text-muted">Disetujui</span>
          <span class="fw-semibold text-success">${formatCurrency(item.acc)}</span>
        </div>
        <div class="d-flex justify-content-between mt-1">
          <span class="text-muted">Terklaim</span>
          <span class="fw-semibold">${formatCurrency(item.claimed)}</span>
        </div>
        <div class="d-flex justify-content-between mt-1">
          <span class="text-muted">Kurang Funding</span>
          <span class="fw-semibold text-warning">${formatCurrency(item.acc - item.claimed)}</span>
        </div>
        <div class="d-flex justify-content-between mt-1">
          <span class="text-muted">TF Mitra</span>
          <span class="fw-semibold">${formatCurrency(item.tfMitra)}</span>
        </div>
        <div class="d-flex justify-content-between mt-1">
          <span class="text-muted">Saldo belum cair</span>
          <span class="fw-semibold">${formatCurrency(item.claimed - item.tfMitra)}</span>
        </div>
        <div class="d-flex justify-content-between mt-1">
          <span class="text-muted">Pakai Mitra</span>
          <span class="fw-semibold">${formatCurrency(item.pakaiMitra)}</span>
        </div>
        <div class="d-flex justify-content-between mt-1">
          <span class="text-muted">Refund</span>
          <span class="fw-semibold text-danger">${formatCurrency(item.refundMitra)}</span>
        </div>
        <hr class="my-2"/>
        <div class="d-flex justify-content-between">
          <span class="fw-semibold">Sisa Dana</span>
          <span class="fw-bold text-primary">${formatCurrency(item.sisaDana)}</span>
        </div>
      </div>
    `),
      },
      {
        name: "Aksi",
        width: "220px",
        sort: false,
        formatter: (actionsData: string) => {
          const data = JSON.parse(actionsData);
          return html(renderActionButtons(data));
        },
      },
    ],

    rowMapper: (project: any, index: number) => [
      index,
      {
        id: project.id,
        judul: project.judul,
        status: project.status,
        activity: project.activity,
        pelaksanaan: project.waktu_pelaksanaan,
      },
      {
        acc: project.nominal_acc,
        claimed: project.claimed_donasi,
        alokasi: project.total_alokasi,
        tfMitra: project.total_tf_ke_mitra,
        pakaiMitra: project.total_pakai_mitra,
        refundMitra: project.total_refund_mitra,
        sisaDana: project.sisa_dana_mitra,
      },
      JSON.stringify({
        id: project.id,
        activity: project.activity,
        claimed: project.claimed_donasi,
        acc: project.nominal_acc,
        sisaDana: project.sisa_dana_mitra,
        tfMitra: project.total_tf_ke_mitra,
      }),
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
