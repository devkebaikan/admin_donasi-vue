import { computed, ref } from "vue";
import { html } from "gridjs";
import { useDataTable } from "@/composables/useDataTable";
import { getCrmChatTemplates, deleteCrmChatTemplate } from "@/services/crmService";
import { hasPermission } from "@/helpers/permission";

/**
 * Daftar variable yang bisa dipakai pada isi template WA type "crm".
 * Ditampilkan sebagai keterangan bantuan di form create/edit.
 */
export const CRM_TEMPLATE_VARIABLES = [
  { code: "XnamaX", description: "Nama lengkap donatur" },
  { code: "XwaX", description: "Nomor WhatsApp donatur" },
  { code: "XemailX", description: "Alamat email donatur" },
  { code: "XinvoiceX", description: "Nomor invoice / kode transaksi donasi" },
  { code: "XprogramX", description: "Nama program donasi" },
  { code: "XprogramLinkX", description: "Link halaman program donasi" },
  { code: "XnominalX", description: "Nominal donasi (format rupiah)" },
  { code: "XpaymentX", description: "Metode / channel pembayaran yang digunakan" },
  { code: "XpanggilanX", description: "Sapaan donatur (Bapak/Ibu/Kak)" },
  { code: "XbankAtasNamaX", description: "Nama pemilik rekening bank tujuan transfer" },
  { code: "XnorekX", description: "Nomor rekening tujuan transfer" },
  { code: "XlokasiPenyaluranX", description: "Lokasi penyaluran donasi" },
  { code: "XprojectX", description: "Nama project / kegiatan penyaluran" },
  { code: "XprojectEksekusiX", description: "Nama project eksekusi / pelaksanaan penyaluran" },
  { code: "XlinkTrackingX", description: "Link tracking status penyaluran donasi" },
];

const TYPE_BADGE: Record<string, string> = {
  system: "bg-secondary",
  crm: "bg-primary",
};

export const typeBadgeClass = (type: string) => TYPE_BADGE[type] ?? "bg-secondary";

export const typeLabel = (type: string) =>
  type === "crm" ? "CRM" : type === "system" ? "System" : type;

const isCanEdit = hasPermission("crm:whatsapp_template");
const isCanDelete = hasPermission("crm:whatsapp_template");

const truncate = (text: string, length = 60) =>
  text && text.length > length ? `${text.slice(0, length)}...` : text ?? "-";

export function useCrmTemplateTable() {
  const selectedType = ref<string>("");
  const extraFilters = computed(() => ({
    ...(selectedType.value ? { type: selectedType.value } : {}),
  }));

  const table = useDataTable({
    queryKey: "crm-wa-templates",
    fetchFn: getCrmChatTemplates,
    deleteFn: deleteCrmChatTemplate,
    defaultSort: "id",
    defaultSortDir: "desc",
    extraFilters,
    deleteMessages: {
      text: "Template tidak bisa dikembalikan setelah dihapus!",
      successText: "Template berhasil dihapus.",
      cancelText: "Template aman :)",
    },
    columns: [
      {
        name: "No",
        width: "50px",
        formatter: (cell: number) =>
          html(`<span class="text-muted small">${cell}</span>`),
      },
      {
        name: "Nama",
        width: "200px",
        formatter: (cell: string) => {
          const { name, slug } = JSON.parse(cell);
          return html(`
            <span class="fw-semibold d-block">${name}</span>
            <span class="text-muted small font-monospace">${slug}</span>
          `);
        },
      },
      {
        name: "Tipe",
        width: "90px",
        formatter: (cell: string) =>
          html(`<span class="badge ${typeBadgeClass(cell)}">${typeLabel(cell)}</span>`),
      },
      {
        name: "Isi",
        formatter: (cell: string) =>
          html(`<span class="small text-muted">${truncate(cell)}</span>`),
      },
      {
        name: "Aksi",
        width: "130px",
        sort: false,
        formatter: (id: number) => html(`
          <div class="d-flex gap-1 justify-content-center">
            <button class="btn btn-sm btn-soft-primary detail-btn" data-action="detail" data-id="${id}" title="Detail"><i class="bx bx-show fs-16"></i></button>
            ${
              isCanEdit
                ? `<button class="btn btn-sm btn-soft-warning edit-btn" data-action="edit" data-id="${id}" title="Edit"><i class="bx bx-edit fs-16"></i></button>`
                : ""
            }
            ${
              isCanDelete
                ? `<button class="btn btn-sm btn-soft-danger delete-btn" data-action="delete" data-id="${id}" title="Hapus"><i class="bx bx-trash fs-16"></i></button>`
                : ""
            }
          </div>`),
      },
    ],
    rowMapper: (item: any, index: number) => [
      index,
      JSON.stringify({ name: item.name, slug: item.slug }),
      item.type,
      item.isi,
      item.id,
    ],
  });

  return { ...table, selectedType };
}
