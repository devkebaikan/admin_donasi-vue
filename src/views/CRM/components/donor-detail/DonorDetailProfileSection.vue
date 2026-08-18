<template>
  <div class="rounded-3 p-3 mb-3" style="background-color: #eef1fd">
    <div class="d-flex align-items-start gap-3">
      <div
        class="avatar-title rounded-circle flex-shrink-0 fs-14 fw-semibold text-white"
        :style="`
          width: 42px;
          height: 42px;
          background-color: ${!detail.color_tag ? '#6c757d' : detail.color_tag === 'amber' ? '#f59e0b' : detail.color_tag};
          opacity: 0.5;
        `"
      >
        {{ initialsOf(detail.name) }}
      </div>

      <div class="flex-grow-1">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="mb-1 fw-semibold">
              {{ detail.name }}
              <span v-if="detail.nick" class="text-muted fw-normal fs-12">
                ({{ detail.nick }})
              </span>
            </h6>

            <div class="text-muted fs-12 d-flex align-items-center gap-1">
              <i class="bx bx-phone"></i>
              {{ detail.phone }}
            </div>
          </div>

          <div class="d-flex gap-1">
            <span
              class="badge"
              :class="`badge-soft-${cycleStatusVariant(detail.cycle_status)}`"
            >
              {{ detail.cycle_status }}
            </span>
            <span
              v-if="detail.color_tag"
              class="badge"
              :style="`
                background-color: ${detail.color_tag === 'amber' ? '#f59e0b' : detail.color_tag};
                opacity: 0.5;
              `"
            >
              {{ detail.color_tag }}
            </span>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-1 mt-2">
          <b-badge :variant="null" class="fw-medium fs-10 badge-soft-secondary">
            {{ detail.level }}
          </b-badge>

          <b-badge :variant="null" class="badge-soft-danger">
            <i class="bx bx-time me-1"></i>
            {{ detail.hari_tidak_aktif }} Hari Tidak Aktif
          </b-badge>

          <b-badge :variant="null" class="badge-soft-info">
            <i class="bx bx-task me-1"></i>
            {{ detail.follow_ups.length }} Follow Up
          </b-badge>

          <b-badge :variant="null" class="badge-soft-warning">
            <i class="bx bx-task me-1"></i>
            Donasi ke - {{ donorProfileDummy.donationCount }}
          </b-badge>

          <b-badge :variant="null" class="badge-soft-primary">
            <i class="bx bx-star me-1"></i>
            {{ detail.poin }} Poin
          </b-badge>
        </div>

        <div class="row g-2 mt-2">
          <div class="col-12 col-lg-6">
            <div class="profile-panel h-100">
              <h6 class="panel-title mb-2">
                <i class="bx bx-user-pin"></i>
                Profil Donatur
              </h6>

              <div class="profile-grid">
                <div class="profile-grid-item">
                  <small class="profile-label">Level</small>
                  <span class="profile-value">{{ detail.level }}</span>
                </div>
                <div class="profile-grid-item">
                  <small class="profile-label">Tgl Gabung</small>
                  <span class="profile-value">{{
                    formatShortDate(donorProfileDummy.joinedDate)
                  }}</span>
                </div>
                <div class="profile-grid-item">
                  <small class="profile-label">Terakhir Donasi</small>
                  <span class="profile-value"
                    >{{ donorProfileDummy.lastDonationDays }} hari lalu</span
                  >
                </div>
                <div class="profile-grid-item">
                  <small class="profile-label">Aktivitas</small>
                  <span class="profile-value">{{
                    donorProfileDummy.activity
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <div class="profile-panel h-100">
              <h6 class="panel-title mb-2">
                <i class="bx bx-target-lock"></i>
                Preferensi & Catatan
              </h6>

              <div class="d-flex flex-wrap gap-1 mb-2">
                <b-badge
                  v-for="tag in donorProfileDummy.tags"
                  :key="tag"
                  :variant="null"
                  class="badge-soft-info"
                >
                  #{{ tag }}
                </b-badge>
              </div>

              <div class="profile-grid">
                <div class="profile-grid-item">
                  <small class="profile-label">Kota</small>
                  <span class="profile-value">{{
                    donorProfileDummy.city
                  }}</span>
                </div>
                <div class="profile-grid-item">
                  <small class="profile-label">Usia</small>
                  <span class="profile-value"
                    >{{ donorProfileDummy.age }} tahun</span
                  >
                </div>
                <div class="profile-grid-item">
                  <small class="profile-label">Pekerjaan</small>
                  <span class="profile-value">{{ donorProfileDummy.job }}</span>
                </div>
                <div class="profile-grid-item">
                  <small class="profile-label">Komunitas</small>
                  <span class="profile-value">{{
                    donorProfileDummy.community
                  }}</span>
                </div>
                <div class="profile-grid-item profile-grid-item--full">
                  <small class="profile-label">Note</small>
                  <span class="profile-value text-muted">{{
                    donorProfileDummy.note
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="detail.assigned_cs"
      class="d-flex align-items-center gap-2 bg-white mt-2 rounded-2 py-1 px-3 fs-12"
    >
      <i class="bx bx-headphone fs-16 text-muted"></i>
      <span>
        CS:
        <span class="fw-semibold">{{ detail.assigned_cs.nama }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { cycleStatusVariant, initialsOf } from "@/utils/crmAdapters";
import type { CrmDonorDetail } from "@/types/crm";

const props = defineProps<{
  detail: CrmDonorDetail;
  userId?: number;
}>();

type DonorProfileDummy = {
  joinedDate: string;
  donationCount: number;
  lastDonationDays: number;
  activity: string;
  tags: string[];
  city: string;
  age: number;
  job: string;
  community: string;
  note: string;
  statusUser: "Aktif" | "Perlu Follow Up" | "Tidak Aktif";
};

const DUMMY_DONOR_PROFILES: DonorProfileDummy[] = [
  {
    joinedDate: "2024-01-12",
    donationCount: 0,
    lastDonationDays: 0,
    activity: "Baru masuk CRM",
    tags: ["baru", "potensial", "wa"],
    city: "Bandung",
    age: 27,
    job: "Karyawan Swasta",
    community: "Komunitas Masjid Al-Hikmah",
    note: "Perlu sapaan awal untuk perkenalan campaign rutin.",
    statusUser: "Aktif",
  },
  {
    joinedDate: "2023-08-23",
    donationCount: 3,
    lastDonationDays: 15,
    activity: "Respons cepat di WhatsApp",
    tags: ["repeat", "ramah", "rutin"],
    city: "Jakarta",
    age: 33,
    job: "Wirausaha",
    community: "Sahabat Sedekah Jakarta",
    note: "Minat ke program pendidikan dan santunan yatim.",
    statusUser: "Aktif",
  },
  {
    joinedDate: "2022-05-10",
    donationCount: 5,
    lastDonationDays: 42,
    activity: "Belum merespons follow up terakhir",
    tags: ["existing", "prioritas", "followup"],
    city: "Surabaya",
    age: 39,
    job: "Profesional",
    community: "Majelis Taklim Ar-Rahmah",
    note: "Ideal dihubungi malam hari setelah jam kerja.",
    statusUser: "Perlu Follow Up",
  },
];

const donorProfileDummy = computed<DonorProfileDummy>(() => {
  const index = props.detail.id % DUMMY_DONOR_PROFILES.length;
  const base = DUMMY_DONOR_PROFILES[index];

  return {
    ...base,
    donationCount: Math.max(base.donationCount, props.detail.follow_ups.length),
    lastDonationDays: Math.max(
      base.lastDonationDays,
      props.detail.hari_tidak_aktif,
    ),
  };
});

const formatShortDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusUserVariant = (status: DonorProfileDummy["statusUser"]) => {
  if (status === "Aktif") return "success";
  if (status === "Perlu Follow Up") return "warning";
  return "secondary";
};
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.kpi-chip {
  background: #ffffff;
  border: 1px solid #e9edf6;
  border-radius: 0.65rem;
  padding: 0.55rem 0.65rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.kpi-icon {
  width: 1.95rem;
  height: 1.95rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
}

.kpi-label {
  color: #7b8190;
  font-size: 0.68rem;
  line-height: 1.2;
}

.kpi-value {
  color: #344054;
  font-size: 0.76rem;
  line-height: 1.2;
}

.profile-panel {
  background: #ffffff;
  border: 1px solid #e9edf6;
  border-radius: 0.75rem;
  padding: 0.75rem;
}

.panel-title {
  color: #475467;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
}

.profile-grid-item {
  background: #f8f9fc;
  border-radius: 0.55rem;
  padding: 0.45rem 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.profile-grid-item--full {
  grid-column: 1 / -1;
}

.profile-label {
  color: #7b8190;
  font-size: 0.66rem;
  line-height: 1.2;
}

.profile-value {
  font-size: 0.74rem;
  font-weight: 600;
  line-height: 1.25;
  color: #344054;
}

@media (max-width: 575.98px) {
  .kpi-grid,
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
