import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import {
  getAllInfluencers,
  deleteInfluencer,
  type InfluencerProfile,
} from "@/services/influencerService";
import { hasPermission } from "@/helpers/permission";

const isCanEdit = hasPermission("influencer:update");
const isCanDelete = hasPermission("influencer:delete");

export function useInfluencerTable() {
  const selectedStatus = ref<string>("");
  const selectedEntityType = ref<string>("");

  const extraFilters = computed(() => ({
    ...(selectedStatus.value ? { status: selectedStatus.value } : {}),
    ...(selectedEntityType.value ? { entity_type: selectedEntityType.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "influencers",
    fetchFn: getAllInfluencers,
    deleteFn: deleteInfluencer,
    defaultSort: "id",
    extraFilters,
    deleteMessages: {
      text: "Data influencer tidak dapat dikembalikan!",
      successText: "Data influencer berhasil dihapus.",
      cancelText: "Data influencer aman :)",
    },
    columns: [
      {
        name: "No",
        width: "50px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Influencer",
        width: "220px",
        formatter: (item: { name: string; display_name: string; email: string }) => {
          return html(`
            <div>
              <div class="fw-semibold text-dark">${item.display_name || item.name}</div>
              <small class="text-muted">${item.email || "-"}</small>
            </div>
          `);
        },
      },
      {
        name: "Kontak & Lokasi",
        width: "180px",
        formatter: (item: { phone: string; city: string; country: string }) => {
          const loc = [item.city, item.country].filter(Boolean).join(", ");
          return html(`
            <div>
              <div class="small">${item.phone || "-"}</div>
              <small class="text-muted">${loc || "-"}</small>
            </div>
          `);
        },
      },
      {
        name: "Tipe",
        width: "120px",
        formatter: (cell: string) => {
          const isIndividual = cell === "individual";
          const badgeClass = isIndividual ? "bg-info-subtle text-info" : "bg-primary-subtle text-primary";
          return html(`<span class="badge ${badgeClass} text-capitalize">${cell || "-"}</span>`);
        },
      },
      {
        name: "Niche",
        width: "130px",
        formatter: (cell: string) =>
          html(`<span class="text-muted small">${cell || "-"}</span>`),
      },
      {
        name: "Status",
        width: "110px",
        formatter: (cell: string) => {
          let badgeClass = "bg-secondary";
          if (cell === "active") badgeClass = "bg-success";
          else if (cell === "prospect") badgeClass = "bg-warning text-dark";
          else if (cell === "inactive") badgeClass = "bg-danger";

          return html(`<span class="badge ${badgeClass} text-capitalize">${cell || "-"}</span>`);
        },
      },
      {
        name: "Aksi",
        width: "140px",
        sort: false,
        formatter: (item: { id: number }) =>
          html(`
            <div class="d-flex gap-2 justify-content-center">
              <button
                class="btn btn-sm btn-soft-info detail-btn"
                data-action="detail"
                data-id="${item.id}"
                title="Lihat Detail & Akun Sosial">
                <i class="bx bx-show fs-16"></i>
              </button>
              ${
                isCanEdit
                  ? `<button
                      class="btn btn-sm btn-soft-warning edit-btn"
                      data-action="edit"
                      data-id="${item.id}"
                      title="Edit Influencer">
                      <i class="bx bx-edit fs-16"></i>
                    </button>`
                  : ""
              }
              ${
                isCanDelete
                  ? `<button
                      class="btn btn-sm btn-soft-danger delete-btn"
                      data-action="delete"
                      data-id="${item.id}"
                      title="Hapus Influencer">
                      <i class="bx bx-trash fs-16"></i>
                    </button>`
                  : ""
              }
            </div>
          `),
      },
    ],
    rowMapper: (item: InfluencerProfile, index: number) => [
      index,
      { name: item.name, display_name: item.display_name, email: item.email },
      { phone: item.phone, city: item.city, country: item.country },
      item.entity_type,
      item.niche,
      item.status,
      { id: item.id },
    ],
  });

  return {
    ...table,
    selectedStatus,
    selectedEntityType,
  };
}

