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
  date: string
  note: string
  sent: boolean
}

export type ChatMessageItem = {
  text: string
  isSender: boolean
  timeStamp?: string
}

export type PlanCardStats = {
  totalDonasi: string
  donasiKe: string
  terakhir: string
  progressValue: number
  progressTarget: string
}

export type PlanCardType = {
  id: number
  initials: string
  colorVariant: string
  name: string
  nickname?: string
  phone: string
  city?: string
  occupation?: string
  amount: string
  days: number
  isUrgent?: boolean
  stage: string
  tags: TagType[]
  hardRules?: string[]
  stats: PlanCardStats
  project: string | null
  projectNote?: string
  donationHistory: DonationHistoryItem[]
  followUps: FollowUpItem[]
  waAccount: string
  quickTemplates: string[]
  chatMessages: ChatMessageItem[]
}
