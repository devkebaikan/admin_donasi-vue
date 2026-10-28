<template>
  <div class="rounded-3 p-3 mb-3" style="background-color: #eef1fd">
    <div class="d-flex align-items-start gap-3">
      <!-- <div
        class="avatar-title rounded-circle flex-shrink-0 fs-14 fw-semibold text-white"
        :style="`
          width: 42px;
          height: 42px;
          background-color: ${!detail.color_tag ? '#6c757d' : detail.color_tag === 'amber' ? '#f59e0b' : detail.color_tag};
          opacity: 0.5;
        `"
      >
        {{ initialsOf(detail.name) }}
      </div> -->

      <div class="flex-grow-1">
        <div class="d-flex justify-content-between align-items-start">
          <!-- <div>
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
          </div> -->

          <!-- <div class="d-flex gap-1">
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
          </div> -->
        </div>

        <div class="d-flex flex-wrap gap-1 mt-2" style="font-size: 14px">
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
            Donasi ke - {{ transactionDetail?.donation_number }}
          </b-badge>

          <b-badge :variant="null" class="badge-soft-primary">
            <i class="bx bx-star me-1"></i>
            {{ detail.poin }} Poin
          </b-badge>
        </div>

        <div class="d-flex justify-content-end mt-1">
          <button
            type="button"
            class="btn btn-link p-0 text-decoration-none fw-semibold fs-12 d-inline-flex align-items-center"
            :aria-expanded="detailProfileShow"
            @click="detailProfileShow = !detailProfileShow"
          >
            <span>{{
              detailProfileShow ? "Sembunyikan Detail" : "Tampilkan Detail"
            }}</span>
            <i
              class="bx bx-chevron-down ms-1"
              :style="{
                transition: 'transform 0.28s ease',
                transform: detailProfileShow
                  ? 'rotate(180deg)'
                  : 'rotate(0deg)',
              }"
            />
          </button>
        </div>
      </div>
    </div>

    <transition name="profile-expand">
      <div v-show="detailProfileShow" class="row g-2 mt-2">
        <div class="col-12 col-lg-6">
          <div class="bg-white border rounded-3 p-3 h-100">
            <h6
              class="mb-2 text-uppercase fw-bold d-flex align-items-center gap-1 text-muted"
              style="font-size: 0.72rem; letter-spacing: 0.03em"
            >
              <i class="bx bx-user-pin"></i>
              Profil Donatur
            </h6>

            <div class="row g-2">
              <div class="col-12 col-sm-6">
                <div
                  class="bg-light rounded-2 p-2 d-flex flex-column"
                  style="gap: 0.15rem"
                >
                  <small
                    class="text-muted"
                    style="font-size: 0.66rem; line-height: 1.2"
                    >Level</small
                  >
                  <span
                    class="fw-semibold text-dark"
                    style="font-size: 0.74rem; line-height: 1.25"
                    >{{ detail.level }}</span
                  >
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div
                  class="bg-light rounded-2 p-2 d-flex flex-column"
                  style="gap: 0.15rem"
                >
                  <small
                    class="text-muted"
                    style="font-size: 0.66rem; line-height: 1.2"
                    >Tgl Gabung</small
                  >
                  <span
                    class="fw-semibold text-dark"
                    style="font-size: 0.74rem; line-height: 1.25"
                    >{{ formatShortDate(detail.donatur?.joined_at) }}</span
                  >
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div
                  class="bg-light rounded-2 p-2 d-flex flex-column"
                  style="gap: 0.15rem"
                >
                  <small
                    class="text-muted"
                    style="font-size: 0.66rem; line-height: 1.2"
                    >Terakhir Donasi</small
                  >
                  <span
                    class="fw-semibold text-dark"
                    style="font-size: 0.74rem; line-height: 1.25"
                    >{{ detail.last_donation_at ? formatShortDate(detail.last_donation_at) : '-' }}</span
                  >
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div
                  class="bg-light rounded-2 p-2 d-flex flex-column"
                  style="gap: 0.15rem"
                >
                  <small
                    class="text-muted"
                    style="font-size: 0.66rem; line-height: 1.2"
                    >Cycle Status</small
                  >
                  <span
                    class="fw-semibold text-dark"
                    style="font-size: 0.74rem; line-height: 1.25"
                    >{{ detail.cycle_status ?? '-' }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <div class="bg-white border rounded-3 p-3 h-100">
            <h6
              class="mb-2 text-uppercase fw-bold d-flex align-items-center gap-1 text-muted"
              style="font-size: 0.72rem; letter-spacing: 0.03em"
            >
              <i class="bx bx-target-lock"></i>
              Preferensi & Catatan
            </h6>

            <div class="d-flex flex-wrap gap-1 mb-2">
              <span v-if="!detail.tags?.length" class="text-muted" style="font-size: 0.72rem">Belum ada tag</span>
              <b-badge
                v-for="tag in detail.tags"
                :key="tag.id ?? tag"
                :variant="null"
                class="badge-soft-info"
              >
                #{{ tag.name ?? tag }}
              </b-badge>
            </div>

            <div class="row g-2">
              <div class="col-12 col-sm-6">
                <div
                  class="bg-light rounded-2 p-2 d-flex flex-column"
                  style="gap: 0.15rem"
                >
                  <small
                    class="text-muted"
                    style="font-size: 0.66rem; line-height: 1.2"
                    >Kota</small
                  >
                  <span
                    class="fw-semibold text-dark"
                    style="font-size: 0.74rem; line-height: 1.25"
                    >{{ detail.kota ?? '-' }}</span
                  >
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div
                  class="bg-light rounded-2 p-2 d-flex flex-column"
                  style="gap: 0.15rem"
                >
                  <small
                    class="text-muted"
                    style="font-size: 0.66rem; line-height: 1.2"
                    >Usia</small
                  >
                  <span
                    class="fw-semibold text-dark"
                    style="font-size: 0.74rem; line-height: 1.25"
                    >{{ detail.usia_range ?? '-' }}</span
                  >
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div
                  class="bg-light rounded-2 p-2 d-flex flex-column"
                  style="gap: 0.15rem"
                >
                  <small
                    class="text-muted"
                    style="font-size: 0.66rem; line-height: 1.2"
                    >Pekerjaan</small
                  >
                  <span
                    class="fw-semibold text-dark"
                    style="font-size: 0.74rem; line-height: 1.25"
                    >{{ detail.pekerjaan ?? '-' }}</span
                  >
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div
                  class="bg-light rounded-2 p-2 d-flex flex-column"
                  style="gap: 0.15rem"
                >
                  <small
                    class="text-muted"
                    style="font-size: 0.66rem; line-height: 1.2"
                    >Komunitas</small
                  >
                  <span
                    class="fw-semibold text-dark"
                    style="font-size: 0.74rem; line-height: 1.25"
                    >{{ detail.komunitas ?? '-' }}</span
                  >
                </div>
              </div>
              <div class="col-12">
                <div
                  class="bg-light rounded-2 p-2 d-flex flex-column"
                  style="gap: 0.15rem"
                >
                  <small
                    class="text-muted"
                    style="font-size: 0.66rem; line-height: 1.2"
                    >Note</small
                  >
                  <span
                    class="fw-semibold text-muted"
                    style="font-size: 0.74rem; line-height: 1.25"
                    >{{ detail.note ?? '-' }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

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
import { ref } from "vue";
import { cycleStatusVariant } from "@/utils/crmAdapters";

const props = defineProps<{
  detail: Record<string, any>;
  transactionDetail: any;
  userId?: number;
}>();

const detailProfileShow = ref(false);

const formatShortDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
</script>

<style scoped>
.profile-expand-enter-active,
.profile-expand-leave-active {
  transition:
    max-height 0.28s ease,
    opacity 0.22s ease,
    transform 0.22s ease;
  overflow: hidden;
}

.profile-expand-enter-from,
.profile-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
}

.profile-expand-enter-to,
.profile-expand-leave-from {
  max-height: 650px;
  opacity: 1;
  transform: translateY(0);
}
</style>
