<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0">Detail User</h4>
          <div class="d-flex gap-2">
            <b-button
              variant="warning"
              size="sm"
              @click="router.push(`/users/${userId}/edit`)"
            >
              <i class="bx bx-edit me-1"></i>Edit
            </b-button>
            <b-button variant="secondary" size="sm" @click="router.push('/users')">
              <i class="bx bx-arrow-back me-1"></i>Kembali
            </b-button>
          </div>
        </div>

        <div v-if="isLoading" class="text-center p-5">
          <b-spinner variant="primary" />
          <p class="mt-2">Memuat data user...</p>
        </div>

        <div v-else-if="!userData" class="alert alert-warning">
          Data user tidak ditemukan.
        </div>

        <template v-else>
          <!-- Info Akun -->
          <UIComponentCard title="Info Akun" class="mb-3">
            <b-row class="g-3">
              <b-col md="6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">ID</span>
                  <span class="fw-bold fs-5">{{ userData.id }}</span>
                </div>
              </b-col>

              <b-col md="6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Nama</span>
                  <span>{{ userData.name ?? "-" }}</span>
                </div>
              </b-col>

              <b-col md="6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Telepon</span>
                  <span>{{ userData.phone ?? "-" }}</span>
                </div>
              </b-col>

              <b-col md="6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Email</span>
                  <span>{{ userData.email ?? "-" }}</span>
                </div>
              </b-col>

              <b-col md="4">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Role ID</span>
                  <span>
                    <b-badge variant="primary">{{ userData.role_id ?? "-" }}</b-badge>
                  </span>
                </div>
              </b-col>

              <b-col md="4">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Status Verified</span>
                  <span>
                    <b-badge
                      v-if="userData.verified"
                      :variant="userData.verified === 'verified' ? 'success' : 'warning'"
                    >
                      {{ userData.verified }}
                    </b-badge>
                    <span v-else class="text-muted">-</span>
                  </span>
                </div>
              </b-col>

              <b-col md="4">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Diperbarui</span>
                  <span class="small">{{ formatDate(userData.updated_at) }}</span>
                </div>
              </b-col>

              <b-col md="6" v-if="userData.referral_code">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Kode Referral</span>
                  <span class="font-monospace">{{ userData.referral_code || "-" }}</span>
                </div>
              </b-col>

              <b-col md="6" v-if="userData.public_code">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Kode Publik</span>
                  <span class="font-monospace">{{ userData.public_code || "-" }}</span>
                </div>
              </b-col>

              <b-col md="12" v-if="userData.note">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Catatan</span>
                  <span class="text-muted">{{ userData.note }}</span>
                </div>
              </b-col>
            </b-row>
          </UIComponentCard>

          <!-- Info Donatur -->
          <UIComponentCard v-if="userData.donatur" title="Info Donatur" class="mb-3">
            <b-row class="g-3">
              <b-col md="4">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Panggilan</span>
                  <span>{{ userData.donatur.panggilan ?? "-" }}</span>
                </div>
              </b-col>

              <b-col md="4">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Nama Asli</span>
                  <span>{{ userData.donatur.real_name ?? "-" }}</span>
                </div>
              </b-col>

              <b-col md="4">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">CS ID</span>
                  <span>{{ userData.donatur.cs_id ?? "-" }}</span>
                </div>
              </b-col>

              <b-col md="6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Soft</span>
                  <span>{{ userData.donatur.soft ?? "-" }}</span>
                </div>
              </b-col>

              <b-col md="6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Soft Terakhir</span>
                  <span>{{ userData.donatur.soft_terakhir ?? "-" }}</span>
                </div>
              </b-col>

              <b-col md="6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Hard</span>
                  <span>{{ userData.donatur.hard ?? "-" }}</span>
                </div>
              </b-col>

              <b-col md="6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Hard Terakhir</span>
                  <span>{{ userData.donatur.hard_terakhir ?? "-" }}</span>
                </div>
              </b-col>

              <b-col md="12" v-if="userData.donatur.exis">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Exis</span>
                  <span>{{ userData.donatur.exis }}</span>
                </div>
              </b-col>
            </b-row>
          </UIComponentCard>
        </template>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useQuery } from "@tanstack/vue-query";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { getUserById } from "@/services/userService";

const route = useRoute();
const router = useRouter();
const userId = Number(route.params.id);

const { data: userData, isLoading } = useQuery({
  queryKey: ["users", userId],
  queryFn: () => getUserById(userId),
  enabled: !!userId,
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
