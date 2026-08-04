// ─── Generic UI types (reusable across any CRM stage/board page) ────────────

export type TagType = {
  label: string;
  variant: string;
};

export type ChatMessageItem = {
  message: any;
  from_role: string;
  text: string;
  isSender: boolean;
  timeStamp?: string;
};

/**
 * Kartu ringkas untuk DonorList (list kiri) — hanya field yang tersedia dari
 * endpoint list (GET /crm/donors), bukan detail.
 */
export type CrmCaseCard = {
  id: number;
  initials: string;
  colorVariant: string;
  name: string;
  nickname?: string;
  phone: string;
  amount?: string;
  days?: number;
  isUrgent?: boolean;
  stage?: string;
  tags?: TagType[];
};

/**
 * Kartu minimal untuk DonorChat — dibangun langsung dari CrmDonorDetail di
 * DonorDetail.vue (lihat computed `chatCard`), bukan dari CrmCaseCard.
 */
export type CrmChatCard = {
  id: number;
  initials: string;
  colorVariant: string;
  name: string;
  nickname?: string;
  phone: string;
  waAccount?: string;
  quickTemplates?: string[];
  chatMessages?: ChatMessageItem[];
  pipelineStageId?: number;
  transactionId?: number;
};

/**
 * Ringkasan stage pipeline yang menempel pada template chat — subset dari
 * PipelineStage (lihat GET /crm/whatsapp-templates/by-pipeline/:stageId).
 */
export type CrmChatTemplateStage = {
  id: number;
  code: string;
  label: string;
  color: string;
  sort_order: number;
};

/**
 * Template pesan WA CRM — GET /crm/whatsapp-templates & by-pipeline/:stageId.
 */
export type CrmChatTemplate = {
  id: number;
  name: string;
  slug: string;
  isi: string;
  type: string;
  pipeline_stages?: CrmChatTemplateStage[];
};

/**
 * Response POST /crm/whatsapp-templates/:id/render.
 */
export type CrmChatTemplateRendered = {
  rendered_content: string;
};

// ─── CRM API types (see crmService.ts) ───────────────────────────────────────

export type PipelineStage = {
  id: number;
  code: string;
  label: string;
  description: string;
  sort_order: number;
  color: string;
  is_active: boolean;
};

export type CrmDonorSummary = {
  donor_profile_id: number;
  name: string;
  phone: string;
  nick?: string;
  level: string;
  cycle_status: string;
  color_tag?: string;
  assigned_cs_id?: number;
};

export type CrmTransactionSummary = {
  id: number;
  invoice: string;
  total: number;
  status: string;
};

export type CrmPipelineCase = {
  id: number;
  donor_profile_id: number;
  transaction_id: number;
  is_active: boolean;
  keterangan?: string;
  pipeline_stage: PipelineStage;
  transaction: CrmTransactionSummary;
  donor: CrmDonorSummary;
  created_at?: string;
  updated_at?: string;
};

export type CrmAssignedCs = {
  id: number;
  nama: string;
};

export type CrmAssignedUser = {
  id: number;
  name: string;
};

export type CrmFollowUp = {
  id: number;
  jenis: string;
  scheduled_date: string;
  waktu_slot: string;
  channel: string;
  status: string;
  note?: string;
  assigned_user?: CrmAssignedUser;
  donor_profile_id: number;
};

// ─── Transaksi (GET /admin/transactions & /admin/transactions/:id) ──────────

export type CrmTransactionUser = {
  id: number;
  name: string;
  phone: string;
};

export type CrmTransactionType = {
  id: number;
  name: string;
};

export type CrmPaymentMethod = {
  id: number;
  account_behalf: string;
  account_number: string;
  bank_provider: string;
  bank_name?: string;
};

export type CrmTransactionProgram = {
  id: number;
  name: string;
  slug: string;
};

/**
 * Project penyaluran yang terkait satu detail transaksi — dipakai untuk
 * section "Sudah Masuk Project" & sebagai sumber project_id GET /program/kegiatan.
 */
export type CrmTransactionProject = {
  id: number;
  judul: string;
  status: string;
};

export type CrmTransactionDetailItem = {
  id: number;
  transaction_id: number;
  program_id: number;
  project_id?: number;
  detail_type: string;
  quantity: number;
  gross_nominal: number;
  fee: number;
  discount: number;
  operasional: number;
  komisi: number;
  nominal: number;
  refund: number;
  activity: string;
  program?: CrmTransactionProgram;
  project?: CrmTransactionProject;
};

/**
 * Response asli GET /admin/transactions/:id — transaksi yang sedang berjalan
 * di kartu pipeline (dari CrmPipelineCase.transaction_id).
 */
export type CrmTransactionDetail = {
  id: number;
  source: string;
  user_id: number;
  transaction_type_id: number;
  payment_method_id: number;
  invoice: string;
  date: string;
  time: string;
  application_fee: number;
  discount: number;
  price: number;
  total: number;
  status: string;
  amin: number;
  anonim: number;
  updated_at?: string;
  user: CrmTransactionUser;
  transaction_type: CrmTransactionType;
  payment_method: CrmPaymentMethod;
  transaction_details?: CrmTransactionDetailItem[];
  donation_number?: number;
};

/**
 * Item GET /admin/transactions?user_id=... — riwayat transaksi donatur.
 */
export type CrmTransactionHistoryItem = CrmTransactionDetail & {
  notes?: string;
  created_at?: string;
};

/**
 * Item GET /program/kegiatan?project_id=... — update kegiatan penyaluran
 * project tempat donasi donatur ini masuk.
 */
export type CrmKegiatan = {
  id: number;
  mitra_id: number;
  mitra_name: string;
  project_id: number;
  judul: string;
  deskripsi: string;
  thumbnail?: string;
  thumbnail_url?: string;
  date: string;
  type: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Response asli GET /crm/donors/:id — dipakai langsung apa adanya di
 * DonorDetail.vue, tanpa di-merge dengan CrmCaseCard dari list.
 */
export type CrmDonorDetail = {
  id: number;
  donatur_id: number;
  name: string;
  nick?: string;
  phone: string;
  level: string;
  cycle_status: string;
  poin: number;
  hari_tidak_aktif: number;
  color_tag?: string;
  assigned_cs?: CrmAssignedCs;
  follow_ups: CrmFollowUp[];
  chat_messages: ChatMessageItem[];
};
