// ─── Generic UI types (reusable across any CRM stage/board page) ────────────

export type TagType = {
  label: string
  variant: string
}

export type ChatMessageItem = {
  text: string
  isSender: boolean
  timeStamp?: string
}

/**
 * Kartu ringkas untuk DonorList (list kiri) — hanya field yang tersedia dari
 * endpoint list (GET /crm/donors), bukan detail.
 */
export type CrmCaseCard = {
  id: number
  initials: string
  colorVariant: string
  name: string
  nickname?: string
  phone: string
  amount?: string
  days?: number
  isUrgent?: boolean
  stage?: string
  tags?: TagType[]
}

/**
 * Kartu minimal untuk DonorChat — dibangun langsung dari CrmDonorDetail di
 * DonorDetail.vue (lihat computed `chatCard`), bukan dari CrmCaseCard.
 */
export type CrmChatCard = {
  id: number
  initials: string
  colorVariant: string
  name: string
  nickname?: string
  phone: string
  waAccount?: string
  quickTemplates?: string[]
  chatMessages?: ChatMessageItem[]
}

// ─── CRM API types (see crmService.ts) ───────────────────────────────────────

export type PipelineStage = {
  id: number
  code: string
  label: string
  description: string
  sort_order: number
  color: string
  is_active: boolean
}

export type CrmDonorSummary = {
  donor_profile_id: number
  name: string
  phone: string
  nick?: string
  level: string
  cycle_status: string
  color_tag?: string
  assigned_cs_id?: number
}

export type CrmTransactionSummary = {
  id: number
  invoice: string
  total: number
  status: string
}

export type CrmPipelineCase = {
  id: number
  donor_profile_id: number
  transaction_id: number
  is_active: boolean
  keterangan?: string
  pipeline_stage: PipelineStage
  transaction: CrmTransactionSummary
  donor: CrmDonorSummary
  created_at?: string
  updated_at?: string
}

export type CrmAssignedCs = {
  id: number
  nama: string
}

export type CrmAssignedUser = {
  id: number
  name: string
}

export type CrmFollowUp = {
  id: number
  jenis: string
  scheduled_date: string
  waktu_slot: string
  channel: string
  status: string
  note?: string
  assigned_user?: CrmAssignedUser
  donor_profile_id: number
}

/**
 * Response asli GET /crm/donors/:id — dipakai langsung apa adanya di
 * DonorDetail.vue, tanpa di-merge dengan CrmCaseCard dari list.
 */
export type CrmDonorDetail = {
  id: number
  donatur_id: number
  name: string
  nick?: string
  phone: string
  level: string
  cycle_status: string
  poin: number
  hari_tidak_aktif: number
  color_tag?: string
  assigned_cs?: CrmAssignedCs
  follow_ups: CrmFollowUp[]
  chat_messages: ChatMessageItem[]
}
