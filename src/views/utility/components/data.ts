import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import {
    getAllThirdPartyLogs,
    deleteThirdPartyLog,
} from "@/services/thirdPartyLogService";
import { hasPermission } from "@/helpers/permission";

const isCanDelete = hasPermission("utility:delete");
const isCanResend = hasPermission("utility:manage");

function formatDate(value: string) {
    if (!value) return "-";
    return new Date(value).toLocaleString("id-ID", {
        dateStyle: "short",
        timeStyle: "medium",
    });
}

export function useThirdPartyLogTable() {
    const selectedService = ref<string>("");
    const selectedIsSuccess = ref<string>("");

    const extraFilters = computed(() => ({
        ...(selectedService.value ? { service: selectedService.value } : {}),
        ...(selectedIsSuccess.value !== ""
            ? { is_success: selectedIsSuccess.value }
            : {}),
    }));

    const table = useDataTable({
        queryKey: "third-party-logs",
        fetchFn: getAllThirdPartyLogs,
        deleteFn: deleteThirdPartyLog,
        defaultSort: "created_at",
        extraFilters,
        deleteMessages: {
            text: "Log third party ini tidak bisa dikembalikan!",
            successText: "Log berhasil dihapus.",
            cancelText: "Log aman :)",
        },
        columns: [
            {
                name: "No",
                width: "40px",
                formatter: (cell: number) =>
                    html(`<span class="text-muted small">${cell}</span>`),
            },
            {
                name: "Waktu",
                width: "150px",
                formatter: (cell: string) =>
                    html(`<span class="small">${formatDate(cell)}</span>`),
            },
            {
                name: "Service",
                width: "110px",
                formatter: (cell: string) =>
                    html(`<span class="fw-semibold">${cell}</span>`),
            },
            {
                name: "Endpoint",
                width: "220px",
                formatter: (cell: string) =>
                    html(
                        `<span class="text-muted small text-truncate d-inline-block" style="max-width:220px" title="${cell ?? ""}">${cell ?? "-"}</span>`,
                    ),
            },
            {
                name: "Method",
                width: "80px",
                formatter: (cell: string) =>
                    html(`<span class="badge bg-info-subtle text-info">${cell}</span>`),
            },
            {
                name: "Status",
                width: "90px",
                formatter: (cell: number | null) =>
                    html(
                        `<span class="badge ${cell && cell < 400 ? "bg-success" : "bg-danger"}">${cell ?? "-"}</span>`,
                    ),
            },
            {
                name: "Sukses",
                width: "90px",
                formatter: (cell: boolean) =>
                    html(
                        cell
                            ? `<span class="badge bg-success">Sukses</span>`
                            : `<span class="badge bg-danger">Gagal</span>`,
                    ),
            },
            {
                name: "Durasi",
                width: "80px",
                formatter: (cell: number | null) =>
                    html(
                        `<span class="text-muted small">${cell != null ? cell + " ms" : "-"}</span>`,
                    ),
            },
            {
                name: "Actions",
                width: "130px",
                sort: false,
                formatter: (log: { id: number }) =>
                    html(`
            <div class="d-flex gap-2 justify-content-center">
              <button class="btn btn-sm btn-soft-info detail-btn" data-action="detail" data-id="${log.id}" title="Detail">
                <i class="bx bx-show fs-16"></i>
              </button>
              ${isCanResend
                            ? `<button class="btn btn-sm btn-soft-primary resend-btn" data-action="resend" data-id="${log.id}" title="Resend">
                      <i class="bx bx-repost fs-16"></i>
                    </button>`
                            : ""
                        }
              ${isCanDelete
                            ? `<button class="btn btn-sm btn-soft-danger delete-btn" data-action="delete" data-id="${log.id}" title="Hapus">
                      <i class="bx bx-trash fs-16"></i>
                    </button>`
                            : ""
                        }
            </div>
          `),
            },
        ],

        rowMapper: (l: any, index: number) => [
            index,
            l.created_at,
            l.service,
            l.endpoint,
            l.method,
            l.response_status,
            !!l.is_success,
            l.duration_ms,
            { id: l.id },
        ],
    });

    return {
        ...table,
        selectedService,
        selectedIsSuccess,
    };
}