import type { PlanCardType } from '@/views/plan/components/types'

const quickTemplates = ['Salam Hangat', 'Konfirmasi Niat', 'Bantu Proses', 'Tawaran Cicilan', 'Jadwal Ulang']

export const planCards: PlanCardType[] = [
  {
    id: 1,
    initials: 'RH',
    colorVariant: 'warning',
    name: 'Rudi Hermawan',
    nickname: 'Pak Rudi',
    phone: '08112223344',
    city: 'Bandung',
    occupation: 'Karyawan',
    amount: 'Rp 500.000',
    days: 8,
    stage: 'Plan',
    tags: [
      { label: 'Plan', variant: 'warning' },
      { label: 'Follow Up', variant: 'success' }
    ],
    stats: {
      totalDonasi: 'Rp 500.000',
      donasiKe: '1x',
      terakhir: '8 hari lalu',
      progressValue: 2,
      progressTarget: 'Rp 25.000.000'
    },
    project: null,
    projectNote: 'Harus ditentukan dalam 3 hari sejak donasi sukses',
    donationHistory: [
      { amount: 'Rp 500.000', bank: 'BCA', project: 'Belum ada project salur', date: '16 Jul 2026', status: 'sukses' }
    ],
    followUps: [
      { title: 'Follow Up Transfer', date: '17 Jul 2026 · Pagi · Official WA', note: 'FU 1 pekan — jika belum transfer', sent: false }
    ],
    waAccount: 'Official WA',
    quickTemplates,
    chatMessages: []
  },
  {
    id: 2,
    initials: 'NA',
    colorVariant: 'danger',
    name: 'Novi Andriani',
    nickname: 'Bu Novi',
    phone: '08556665544',
    city: 'Surabaya',
    occupation: 'Wiraswasta',
    amount: 'Rp 250.000',
    days: 12,
    isUrgent: true,
    stage: 'Plan',
    tags: [
      { label: 'Plan', variant: 'warning' },
      { label: 'Urgen', variant: 'danger' },
      { label: '-2p', variant: 'secondary' }
    ],
    stats: {
      totalDonasi: 'Rp 250.000',
      donasiKe: '1x',
      terakhir: '12 hari lalu',
      progressValue: 1,
      progressTarget: 'Rp 25.000.000'
    },
    project: null,
    projectNote: 'Harus ditentukan dalam 3 hari sejak donasi sukses',
    donationHistory: [],
    followUps: [],
    waAccount: 'Official WA',
    quickTemplates,
    chatMessages: [
      { text: 'Halo Bu Novi, ini dari tim Ziswaf. Mau bantu proses donasinya ya 🙏', isSender: true, timeStamp: '09:12' },
      { text: 'Baik kak, saya masih pertimbangkan dulu', isSender: false, timeStamp: '09:20' }
    ]
  },
  {
    id: 3,
    initials: 'ES',
    colorVariant: 'info',
    name: 'Eko Saputra',
    nickname: 'Pak Eko',
    phone: '08889990001',
    city: 'Semarang',
    occupation: 'Pedagang',
    amount: 'Rp 1.000.000',
    days: 6,
    stage: 'Plan',
    tags: [
      { label: 'Plan', variant: 'warning' },
      { label: 'Follow Up', variant: 'success' },
      { label: '+1p', variant: 'success' }
    ],
    stats: {
      totalDonasi: 'Rp 1.000.000',
      donasiKe: '1x',
      terakhir: '6 hari lalu',
      progressValue: 4,
      progressTarget: 'Rp 25.000.000'
    },
    project: null,
    projectNote: 'Harus ditentukan dalam 3 hari sejak donasi sukses',
    donationHistory: [],
    followUps: [],
    waAccount: 'Official WA',
    quickTemplates,
    chatMessages: []
  },
  {
    id: 4,
    initials: 'HW',
    colorVariant: 'warning',
    name: 'Hendra Wijaya',
    nickname: 'Pak Hendra',
    phone: '08678901234',
    city: 'Medan',
    occupation: 'Pedagang',
    amount: 'Rp 300.000',
    days: 7,
    stage: 'Kartu 5',
    tags: [
      { label: 'General', variant: 'secondary' },
      { label: 'Prioritas Retensi', variant: 'primary' },
      { label: 'General', variant: 'secondary' },
      { label: 'Aktif', variant: 'success' },
      { label: '+2 poin', variant: 'success' }
    ],
    hardRules: [
      'Jangan langsung tawaran program baru sebelum konfirmasi project lama selesai',
      'DILARANG menyebut jumlah donatur lain sebagai tekanan sosial',
      'Jika donatur menolak FU, beri jeda minimal 7 hari sebelum kontak ulang',
      'Jangan meremehkan nominal donasi — semua nominal bernilai sama di sisi Allah'
    ],
    stats: {
      totalDonasi: 'Rp 950.000',
      donasiKe: '3x',
      terakhir: '7 hari lalu',
      progressValue: 4,
      progressTarget: 'Rp 25.000.000'
    },
    project: null,
    projectNote: 'Harus ditentukan dalam 3 hari sejak donasi sukses',
    donationHistory: [
      { amount: 'Rp 300.000', bank: 'Permata', project: 'Belum ada project salur', date: '3 Jun 2026', status: 'sukses' },
      { amount: 'Rp 350.000', bank: 'Permata', project: 'Beasiswa Sem. 1 2024', date: '5 Feb 2026', status: 'sukses' }
    ],
    followUps: [
      { title: 'Tawaran Program Baru', date: '10 Jun 2026 · Pagi · Official WA', note: 'FU 1 pekan — Kamis pagi', sent: false }
    ],
    waAccount: 'Official WA',
    quickTemplates,
    chatMessages: []
  }
]
