<template>
  <VerticalLayout>
    <!-- Filter -->
    <b-card class="mb-3">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="bx bx-filter-alt me-1"></i>Filter</h5>
          <b-button
            v-if="hasActiveFilters"
            size="sm"
            variant="outline-danger"
            @click="clearFilters"
          >
            <i class="bx bx-reset me-1"></i>Reset Filter
          </b-button>
        </div>
      </template>

      <b-row class="g-3">
        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Cari</label>
          <b-input-group>
            <span class="input-group-text"><i class="bx bx-search"></i></span>
            <b-form-input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama, telepon, email..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Role</label>
          <!-- <b-form-input
            v-model="selectedRoleId"
            type="number"
            placeholder="e.g. 7"
            min="1"
            @update:model-value="resetPage"
          /> -->
          <ChoicesSelect
            id="role"
            :modelValue="selectedRoleId"
            @update:modelValue="
              (val: any) => {
                selectedRoleId = val;
                resetPage();
              }
            "
            :options="roleOptions"
            :isLoading="loadingRoleData"
            :key="roleOptions.length"
          />
        </b-col>

        <!-- <b-col cols="12" md="2">
          <label class="form-label fw-semibold">Status Verified</label>
          <b-form-select v-model="selectedVerified" @change="resetPage">
            <option value="">Semua</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </b-form-select>
        </b-col> -->

        <b-col cols="12" md="2">
          <label class="form-label fw-semibold">Punya Donatur</label>
          <b-form-select v-model="selectedHasDonatur" @change="resetPage">
            <option value="">Semua</option>
            <option value="true">Ya</option>
            <option value="false">Tidak</option>
          </b-form-select>
        </b-col>
      </b-row>

      <div
        v-if="hasActiveFilters"
        class="d-flex flex-wrap gap-2 align-items-center mt-3"
      >
        <span class="text-muted small">Filter aktif:</span>
        <b-badge
          v-if="searchQuery"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Cari: "{{ searchQuery }}"
          <i class="bx bx-x cursor-pointer" @click="searchQuery = ''"></i>
        </b-badge>
        <b-badge
          v-if="selectedRoleId"
          variant="info"
          class="d-flex align-items-center gap-1"
        >
          Role: {{ selectedRoleId }}
          <i class="bx bx-x cursor-pointer" @click="selectedRoleId = ''"></i>
        </b-badge>
        <b-badge
          v-if="selectedVerified"
          variant="warning"
          class="d-flex align-items-center gap-1"
        >
          Verified: {{ selectedVerified }}
          <i class="bx bx-x cursor-pointer" @click="selectedVerified = ''"></i>
        </b-badge>
        <b-badge
          v-if="selectedHasDonatur"
          variant="secondary"
          class="d-flex align-items-center gap-1"
        >
          Donatur: {{ selectedHasDonatur === "true" ? "Ya" : "Tidak" }}
          <i
            class="bx bx-x cursor-pointer"
            @click="selectedHasDonatur = ''"
          ></i>
        </b-badge>
      </div>
    </b-card>

    <!-- ----------------------------------------------- Detail Offcanvas ----------------------------------------------- -->
    <b-offcanvas
      v-model="showDetailOffcanvas"
      placement="end"
      :bodyScrolling="true"
      :backdrop="true"
      style="--bs-offcanvas-width: 480px"
      @hide="selectedUserId = 0"
    >
      <template #header="{ hide }">
        <div
          class="d-flex align-items-center justify-content-between w-100 gap-2"
        >
          <h5 class="mb-0 fw-semibold text-truncate">
            <i class="bx bx-user me-1 text-primary"></i>Detail User
          </h5>
          <b-button size="sm" variant="outline-secondary" @click="hide">
            <i class="bx bx-x fs-18"></i>
          </b-button>
        </div>
      </template>

      <div v-if="isDetailLoading" class="text-center py-5">
        <b-spinner variant="primary" />
        <p class="mt-2 text-muted">Memuat detail user...</p>
      </div>

      <div v-else-if="isDetailError" class="alert alert-danger m-0">
        Gagal memuat detail user. Silakan coba lagi.
      </div>

      <div v-else-if="userDetail" class="pb-4">
        <!-- Avatar + Name -->
        <div class="d-flex align-items-center gap-3 mb-3">
          <div
            class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold fs-4"
            style="width: 56px; height: 56px; flex-shrink: 0"
          >
            {{ userDetail.name?.charAt(0)?.toUpperCase() ?? "?" }}
          </div>
          <div>
            <h5 class="mb-1 fw-bold">{{ userDetail.name ?? "-" }}</h5>
            <span class="badge bg-primary"
              >Role ID: {{ userDetail.role_id }}</span
            >
          </div>
        </div>

        <hr class="my-3" />

        <!-- Kontak -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-phone me-1"></i>Kontak
        </h6>
        <div class="bg-light rounded p-2 mb-3">
          <small class="text-muted d-block">Nomor Telepon</small>
          <a
            v-if="userDetail.phone"
            :href="`https://wa.me/${userDetail.phone}`"
            target="_blank"
            rel="noopener noreferrer"
            class="fw-semibold"
          >
            <i class="bx bxl-whatsapp text-success me-1"></i
            >{{ userDetail.phone }}
          </a>
          <span v-else class="fw-semibold text-muted">-</span>
        </div>

        <hr class="my-3" />

        <!-- Info -->
        <h6
          class="fw-semibold text-muted mb-2 text-uppercase"
          style="font-size: 11px; letter-spacing: 0.5px"
        >
          <i class="bx bx-info-circle me-1"></i>Informasi Akun
        </h6>
        <b-row class="g-2 mb-3">
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Referral Code</small>
              <span class="fw-semibold small font-monospace">
                {{ userDetail.referral_code || "-" }}
              </span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Public Code</small>
              <span class="fw-semibold small font-monospace">
                {{ userDetail.public_code || "-" }}
              </span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Status Verified</small>
              <span v-if="userDetail.verified" class="badge bg-success">{{
                userDetail.verified == "1" ? "Verified" : "Belum Verified"
              }}</span>
              <span v-else class="badge bg-secondary">Belum Verified</span>
            </div>
          </b-col>
          <b-col cols="6">
            <div class="bg-light rounded p-2">
              <small class="text-muted d-block">Role ID</small>
              <span class="fw-semibold small font-monospace"
                >#{{ userDetail.role_id }}</span
              >
            </div>
          </b-col>
        </b-row>

        <!-- Catatan -->
        <div v-if="userDetail.note" class="mb-3">
          <div class="bg-light rounded p-2">
            <small class="text-muted d-block">Catatan</small>
            <span class="small">{{ userDetail.note }}</span>
          </div>
        </div>

        <hr class="my-3" />

        <!-- Tanggal -->
        <div class="mb-4">
          <small class="text-muted d-block">Terakhir Diperbarui</small>
          <small class="fw-semibold">{{
            formatDateTime(userDetail.updated_at)
          }}</small>
        </div>
      </div>
    </b-offcanvas>

    <!-- Tabel -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar User">
          <div v-if="isCanCreate" class="d-flex justify-content-end mb-3">
            <b-button variant="primary" :to="{ name: 'user.create' }">
              <i class="bx bx-plus fs-16 me-1"></i>Tambah User
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data user...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error memuat data: {{ error?.message || "Coba lagi." }}
          </div>

          <div v-else>
            <GridJsTable
              id="table-gridjs"
              :key="tableKeyString"
              :options="tableOptions"
            />

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted">
                Halaman {{ currentPage }} dari {{ totalPages }} (Total:
                {{ totalRows }} user)
              </div>
              <b-pagination
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPageItem"
                prev-text="Sebelumnya"
                next-text="Selanjutnya"
                align="right"
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
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import { useUsersTable } from "./components/data";
import router from "@/router";
import { useQuery } from "@tanstack/vue-query";
import { getAllRoles } from "@/services/roleService";
import { getUserById } from "@/services/userService";
import { formatDateTime } from "@/helpers/format";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import { hasPermission } from "@/helpers/permission";

const isCanCreate = hasPermission("user:create");

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  searchQuery,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  resetPage,
  handleDelete,
  selectedRoleId,
  selectedVerified,
  selectedHasDonatur,
} = useUsersTable();

const hasActiveFilters = computed(
  () =>
    !!(
      searchQuery.value ||
      selectedRoleId.value ||
      selectedVerified.value ||
      selectedHasDonatur.value
    ),
);

const { data: roleData, isLoading: loadingRoleData } = useQuery({
  queryKey: ["role"],
  queryFn: () => getAllRoles({ mode: "list" }),
});

const roleOptions = computed(() => {
  if (!roleData.value) return [{ value: "", text: "Pilih Role..." }];
  const role = roleData.value ?? [];
  return [
    { value: "", text: "Pilih Role..." },
    ...role.map((item: any) => ({ value: item.id, text: item.name })),
  ];
});

const clearFilters = () => {
  searchQuery.value = "";
  selectedRoleId.value = "";
  selectedVerified.value = "";
  selectedHasDonatur.value = "";
  resetPage();
};

// --- Detail Offcanvas ---
const showDetailOffcanvas = ref(false);
const selectedUserId = ref(0);

const {
  data: userDetail,
  isLoading: isDetailLoading,
  isError: isDetailError,
} = useQuery({
  queryKey: computed(() => ["user-detail", selectedUserId.value]),
  queryFn: () => getUserById(selectedUserId.value),
  enabled: computed(() => selectedUserId.value > 0),
});

const openDetail = (id: number) => {
  selectedUserId.value = id;
  showDetailOffcanvas.value = true;
};

const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const detailBtn = target.closest<HTMLElement>(
    '#table-gridjs .detail-btn[data-action="detail"]',
  );
  const editBtn = target.closest<HTMLElement>(
    '#table-gridjs .edit-btn[data-action="edit"]',
  );
  const transactionsBtn = target.closest<HTMLElement>(
    '#table-gridjs .transactions-btn[data-action="transactions"]',
  );
  const deleteBtn = target.closest<HTMLElement>(
    '#table-gridjs .delete-btn[data-action="delete"]',
  );

  if (detailBtn) {
    event.preventDefault();
    const id = detailBtn.getAttribute("data-id");
    if (id) openDetail(Number(id));
    return;
  }
  if (editBtn) {
    event.preventDefault();
    const id = editBtn.getAttribute("data-id");
    if (id) router.push(`/users/${id}/edit`);
    return;
  }
  if (transactionsBtn) {
    event.preventDefault();
    const id = transactionsBtn.getAttribute("data-id");
    if (id) router.push(`/transactions?user_id=${id}`);
    return;
  }
  if (deleteBtn) {
    event.preventDefault();
    const id = deleteBtn.getAttribute("data-id");
    if (id) handleDelete(Number(id));
  }
};

onMounted(() => document.addEventListener("click", handleGlobalClick));
onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick));
</script>
