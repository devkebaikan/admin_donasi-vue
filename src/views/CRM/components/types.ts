// ─── Generic UI types (reusable across any CRM stage/board page) ────────────

export type TagType = {
  label: string
  variant: string
}

export type DonationHistoryItem = {
  amount: string
  bank: string
  project: string
  date: string
  status: 'sukses' | 'pending' | 'gagal'
}

export type FollowUpItem = {
  title: string
  date?: string
  note?: string
  sent?: boolean
}

export type ChatMessageItem = {
  text: string
  isSender: boolean
  timeStamp?: string
}

export type CardStatItem = {
  label: string
  value: string
}

/**
 * Normalized shape consumed by CardList / DetailTab / ChatTab.
 * Only `id`, `initials`, `colorVariant`, `name` and `phone` are guaranteed —
 * everything else is optional so the same components work for the static
 * demo board (index.vue) and real CRM API data (donors.vue).
 */
export type CrmCaseCard = {
  id: number
  initials: string
  colorVariant: string
  name: string
  nickname?: string
  phone: string
  city?: string
  occupation?: string
  amount?: string
  days?: number
  isUrgent?: boolean
  stage?: string
  tags?: TagType[]
  hardRules?: string[]
  note?: string
  stats?: CardStatItem[]
  project?: string | null
  projectNote?: string
  donationHistory?: DonationHistoryItem[]
  followUps?: FollowUpItem[]
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
  follow_ups: FollowUpItem[]
  chat_messages: ChatMessageItem[]
}
