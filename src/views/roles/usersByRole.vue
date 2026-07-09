<template>
  <VerticalLayout>
    <!-- Header -->
    <b-card class="mb-3">
      <div
        class="d-flex align-items-center justify-content-between flex-wrap gap-2"
      >
        <div>
          <h5 class="mb-1 fw-bold">
            Users in Role:
            <span class="text-primary">{{ roleInfo?.name ?? "..." }}</span>
          </h5>
          <p class="text-muted small mb-0">
            Total {{ meta?.total ?? 0 }} users
          </p>
        </div>
        <b-button
          variant="outline-secondary"
          size="sm"
          @click="router.push('/roles')"
        >
          <i class="bx bx-arrow-back me-1"></i>Kembali ke Role
        </b-button>
      </div>
    </b-card>

    <!-- Filter -->
    <b-card class="mb-3">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-0">
              <i class="bx bx-filter-alt me-1"></i>
              Filter
            </h5>
          </div>

          <b-button
            v-if="queryParams"
            size="sm"
            variant="outline-danger"
            @click="clearSearch"
          >
            <i class="bx bx-reset me-1"></i>
            Reset Filter
          </b-button>
        </div>
      </template>
      <b-row>
        <b-col cols="12" md="5" class="mb-3 mb-md-0">
          <label class="form-label fw-semibold">Search</label>
          <b-input-group>
            <span class="input-group-text">
              <i class="bx bx-search"></i>
            </span>
            <b-form-input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama, email, atau telepon..."
              debounce="500"
              @update:model-value="onSearch"
          /></b-input-group>
        </b-col>
      </b-row>
    </b-card>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard :title="`Daftar Users — ${roleInfo?.name ?? ''}`">
          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data users...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error memuat data: coba lagi.
          </div>

          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th style="width: 50px" class="text-muted small">No</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Telepon</th>
                    <th style="width: 110px">Verified</th>
                    <th style="width: 160px">Bergabung</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!users.length">
                    <td colspan="6" class="text-center text-muted py-4">
                      Tidak ada data users.
                    </td>
                  </tr>
                  <tr v-for="(user, idx) in users" :key="user.id">
                    <td class="text-muted small">{{ offset + (idx as number) + 1 }}</td>
                    <td>
                      <span class="fw-semibold">{{ user.name || "-" }}</span>
                    </td>
                    <td>
                      <span class="small">{{ user.email || "-" }}</span>
                    </td>
                    <td>
                      <span class="font-monospace small">{{
                        user.phone || "-"
                      }}</span>
                    </td>
                    <td>
                      <span
                        v-if="user.verified === '1' || user.verified === 1"
                        class="badge bg-success"
                        >Verified</span
                      >
                      <span v-else class="badge bg-light text-muted"
                        >Belum</span
                      >
                    </td>
                    <td class="small text-muted">
                      {{ formatDate(user.created_at) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div
              class="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2"
            >
              <div class="text-muted small">
                Halaman {{ currentPage }} dari {{ totalPages }} (Total:
                {{ meta?.total ?? 0 }} users)
              </div>
              <b-pagination
                v-model="currentPage"
                :total-rows="meta?.total ?? 0"
                :per-page="limit"
                prev-text="Sebelumnya"
                next-text="Selanjutnya"
                align="right"
                @update:model-value="onPageChange"
              />
            </div>

            <div v-if="isFetching" class="text-center mt-2">
              <small class="text-muted">
                <b-spinner small class="me-1" />Memperbarui...
              </small>
            </div>
          </div>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useQuery } from "@tanstack/vue-query";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { getUsersByRole } from "@/services/roleService";
import router from "@/router";

const route = useRoute();
const roleId = computed(() => Number(route.params.id));

const limit = 10;
const currentPage = ref(1);
const searchQuery = ref("");

const offset = computed(() => (currentPage.value - 1) * limit);

const queryParams = computed(() => {
  const p: Record<string, string | number> = {
    limit,
    offset: offset.value,
  };
  if (searchQuery.value) p.search = searchQuery.value;
  return p;
});

const { data, isLoading, isError, isFetching } = useQuery({
  queryKey: computed(() => ["role-users", roleId.value, queryParams.value]),
  queryFn: () => getUsersByRole(roleId.value, queryParams.value),
  enabled: computed(() => !!roleId.value),
});

const users = computed(() => data.value?.data?.data ?? []);
const meta = computed(() => data.value?.data?.meta ?? null);
const roleInfo = computed(() => data.value?.role ?? null);

const totalPages = computed(() => (meta.value ? meta.value.last_page : 1));

const onSearch = () => {
  currentPage.value = 1;
};

const onPageChange = () => {
  // currentPage is already updated by v-model, offset recomputes automatically
};

const clearSearch = () => {
  searchQuery.value = "";
  currentPage.value = 1;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
</script>
