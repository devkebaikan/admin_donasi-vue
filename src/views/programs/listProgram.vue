<template>
  <VerticalLayout>
    <!-- Filter Section -->
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
            v-if="hasActiveFilters"
            size="sm"
            variant="outline-danger"
            @click="clearFilters"
          >
            <i class="bx bx-reset me-1"></i>
            Reset Filter
          </b-button>
        </div>
      </template>
      <b-row>
        <!-- Search -->
        <b-col cols="12" md="3" class="mb-3">
          <label class="form-label fw-semibold">Search</label>
          <b-input-group>
            <span class="input-group-text">
              <i class="bx bx-search"></i>
            </span>
            <b-form-input
              v-model="searchQuery"
              type="text"
              placeholder="Cari judul atau link..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <!-- Category Filter -->
        <b-col cols="12" md="3" class="mb-3">
          <label class="form-label fw-semibold">Category</label>
          <b-form-select v-model="selectedCategory" :options="categoryOptions">
            <template #first>
              <b-form-select-option value=""
                >All Categories</b-form-select-option
              >
            </template>
          </b-form-select>
        </b-col>

        <!-- Sort Order -->
        <!-- <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Sort By</label>
          <b-form-select
            v-model="sortOrder"
            :options="sortOrderOptions"
            @change="resetPage"
          />
        </b-col> -->

        <!-- Sort Direction -->
        <!-- <b-col cols="12" md="2" class="mb-3">
          <label class="form-label fw-semibold">Direction</label>
          <b-form-select
            v-model="sortDir"
            :options="sortDirOptions"
            @change="resetPage"
          />
        </b-col> -->
      </b-row>
      <!-- Active Filters -->
      <div
        v-if="hasActiveFilters"
        class="mb-3 d-flex flex-wrap gap-2 align-items-center"
      >
        <span class="text-muted small">Active filters:</span>

        <b-badge
          v-if="selectedCategory"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Category: {{ getCategoryName(selectedCategory) }}
          <i class="bx bx-x cursor-pointer" @click="selectedCategory = ''"></i>
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
    </b-card>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Programs List">
          <div class="d-flex justify-content-end mb-3">
            <b-button
              variant="primary"
              @click="router.push('/programs/create')"
            >
              <i class="bx bx-plus fs-16 me-1"></i>Create New Program
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Loading programs...</p>
          </div>

          <div v-else-if="isError" class="alert alert-danger">
            Error loading programs: {{ error?.message || "Please try again." }}
          </div>

          <div v-else>
            <GridJsTable
              id="table-gridjs"
              :key="tableKeyString"
              :options="tableOptions"
            />

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted">
                Showing page {{ currentPage }} of {{ totalPages }} (Total:
                {{ totalRows }} programs)
              </div>
              <b-pagination
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPageItem"
                prev-text="Previous"
                next-text="Next"
                align="right"
              />
            </div>

            <div v-if="isFetching" class="text-center mt-2">
              <small class="text-muted">
                <b-spinner small class="me-1" />Updating...
              </small>
            </div>
          </div>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import { useProgramsTable } from "./components/data";
import router from "@/router";
import { useQuery } from "@tanstack/vue-query";
import { getProgramCategories } from "@/services/programService";

const sortOrderOptions = [
  { value: "id", text: "ID" },
  { value: "judul", text: "Title" },
  { value: "created_at", text: "Created At" },
  { value: "saldo", text: "Saldo" },
];

// const sortDirOptions = [
//   { value: "desc", text: "Descending" },
//   { value: "asc", text: "Ascending" },
// ];

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  selectedCategory,
  searchQuery,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  // sortOrder,
  // sortDir,
  resetPage,
  handleDelete,
} = useProgramsTable();

const hasActiveFilters = computed(
  () => !!(selectedCategory.value || searchQuery.value),
);

const { data: dataCategories } = useQuery({
  queryKey: ["programCategories"],
  queryFn: getProgramCategories,
});

const categoryOptions = computed(() => {
  if (!dataCategories.value) return [];
  return dataCategories.value.map((category: any) => ({
    value: category.id,
    text: category.name,
  }));
});

const clearFilters = () => {
  selectedCategory.value = "";
  searchQuery.value = "";
  // sortOrder.value = "id";
  // sortDir.value = "asc";
  resetPage();
};

const getCategoryName = (value: string | number) =>
  categoryOptions.value.find(
    (c: { value: any; text: string }) => c.value === value,
  )?.text ?? String(value);

const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;

  const editBtn = target.closest<HTMLElement>(
    '#table-gridjs .edit-btn[data-action="edit"]',
  );

  const projectsBtn = target.closest<HTMLElement>(
    '#table-gridjs .projects-btn[data-action="projects"]',
  );

  const newsBtn = target.closest<HTMLElement>(
    '#table-gridjs .news-btn[data-action="news"]',
  );

  const deleteBtn = target.closest<HTMLElement>(
    '#table-gridjs .delete-btn[data-action="delete"]',
  );

  if (editBtn) {
    event.preventDefault();
    const link = editBtn.getAttribute("data-link");
    if (link) {
      router.push(`/programs/${link}/edit`);
    }
    return;
  }

  if (projectsBtn) {
    event.preventDefault();
    const id = projectsBtn.getAttribute("data-id");
    if (id) {
      router.push(`/programs/${id}/projects`);
    }
    return;
  }

  if (newsBtn) {
    event.preventDefault();
    const id = newsBtn.getAttribute("data-id");
    if (id) {
      router.push(`/programs/${id}/news`);
    }
    return;
  }

  if (deleteBtn) {
    event.preventDefault();
    const id = deleteBtn.getAttribute("data-id");
    if (id) {
      handleDelete(Number(id));
    }
  }
};

onMounted(() => document.addEventListener("click", handleGlobalClick));
onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick));
</script>
