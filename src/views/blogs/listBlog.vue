<template>
  <VerticalLayout>
    <!-- Filter Section -->
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

      <b-row>
        <!-- Search -->
        <b-col cols="12" md="4" class="mb-3">
          <label class="form-label fw-semibold">Search</label>
          <b-input-group>
            <span class="input-group-text">
              <i class="bx bx-search"></i>
            </span>
            <b-form-input
              v-model="searchQuery"
              type="text"
              placeholder="Cari judul atau deskripsi..."
              debounce="500"
              @update:model-value="resetPage"
          /></b-input-group>
        </b-col>

        <!-- Category Filter -->
        <b-col cols="12" md="3" class="mb-3">
          <label class="form-label fw-semibold">Kategori</label>
          <b-form-select
            v-model="selectedCategoryId"
            :options="categoryOptions"
          >
            <template #first>
              <b-form-select-option value=""
                >All categories</b-form-select-option
              >
            </template>
          </b-form-select>
        </b-col>

        <!-- Is Active Filter -->
        <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Status</label>
          <b-form-select v-model="selectedIsActive" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua</b-form-select-option>
            </template>
            <b-form-select-option value="true">Aktif</b-form-select-option>
            <b-form-select-option value="false">Nonaktif</b-form-select-option>
          </b-form-select>
        </b-col>
      </b-row>
    </b-card>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar Blog">
          <div v-if="isCanCreate" class="d-flex justify-content-end mb-3">
            <b-button variant="primary" @click="router.push('/blog/create')">
              <i class="bx bx-plus fs-16 me-1"></i>Tambah Blog
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data blog...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error memuat data blog: {{ error?.message || "Coba lagi." }}
          </div>

          <div v-else>
            <!-- Active Filters -->
            <div
              v-if="hasActiveFilters"
              class="mb-3 d-flex flex-wrap gap-2 align-items-center"
            >
              <span class="text-muted small">Active filters:</span>

              <b-badge
                v-if="selectedCategoryId !== ''"
                variant="primary"
                class="d-flex align-items-center gap-1"
              >
                Kategori: {{ categoryLabel }}
                <i
                  class="bx bx-x cursor-pointer"
                  @click="selectedCategoryId = ''"
                ></i>
              </b-badge>

              <b-badge
                v-if="selectedIsActive !== ''"
                variant="primary"
                class="d-flex align-items-center gap-1"
              >
                Status: {{ selectedIsActive === "1" ? "Aktif" : "Nonaktif" }}
                <i
                  class="bx bx-x cursor-pointer"
                  @click="selectedIsActive = ''"
                ></i>
              </b-badge>

              <b-badge
                v-if="searchQuery"
                variant="primary"
                class="d-flex align-items-center gap-1"
              >
                Search: "{{ searchQuery }}"
                <i class="bx bx-x cursor-pointer" @click="searchQuery = ''"></i>
              </b-badge>
            </div>

            <GridJsTable
              id="table-gridjs"
              :key="tableKeyString"
              :options="tableOptions"
            />

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted">
                Halaman {{ currentPage }} dari {{ totalPages }} (Total:
                {{ totalRows }} blog)
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
import { computed, onBeforeUnmount, onMounted } from "vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import { useBlogTable } from "./components/data";
import { getBlogCategories } from "@/services/blogService";
import router from "@/router";
import { useQuery } from "@tanstack/vue-query";
import { hasPermission } from "@/helpers/permission";

const isCanCreate = hasPermission("blog:create");

onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick));

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  selectedIsActive,
  selectedCategoryId,
  searchQuery,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  resetPage,
  handleDelete,
} = useBlogTable();

const hasActiveFilters = computed(
  () =>
    !!(
      selectedIsActive.value !== "" ||
      selectedCategoryId.value !== "" ||
      searchQuery.value
    ),
);

const { data: categories } = useQuery({
  queryKey: ["blog-categories"],
  queryFn: getBlogCategories,
});

const categoryOptions = computed(() => {
  if (!categories) return [];
  return categories.value?.map((lead: any) => ({
    value: lead.id,
    text: lead.nama,
  }));
});

const categoryLabel = computed(() => {
  const cat = categories.value.find(
    (c: any) => String(c.id) === selectedCategoryId.value,
  );
  return cat?.name ?? selectedCategoryId.value;
});

const clearFilters = () => {
  selectedIsActive.value = "";
  selectedCategoryId.value = "";
  searchQuery.value = "";
  resetPage();
};

const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const editBtn = target.closest<HTMLElement>(
    '#table-gridjs .edit-btn[data-action="edit"]',
  );
  const deleteBtn = target.closest<HTMLElement>(
    '#table-gridjs .delete-btn[data-action="delete"]',
  );

  if (editBtn) {
    event.preventDefault();
    const id = editBtn.getAttribute("data-id");
    if (id) router.push(`/blog/${id}/edit`);
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
