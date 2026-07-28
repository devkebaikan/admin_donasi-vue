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

      <b-row class="g-3">
        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Search</label>
          <b-input-group>
            <span class="input-group-text"><i class="bx bx-search"></i></span>
            <b-form-input
              v-model="searchQuery"
              placeholder="Cari judul atau slug..."
              debounce="500"
              @update:model-value="resetPage"
            />
          </b-input-group>
        </b-col>

        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Event</label>
          <ChoicesSelect
            id="filter-event"
            :modelValue="String(selectedEventId || 0)"
            @update:modelValue="
              (val) => {
                selectedEventId = val === '0' ? '' : Number(val);
                resetPage();
              }
            "
            :options="eventOptions"
            :isLoading="isEventLoading"
            :key="eventOptions.length"
          />
        </b-col>

        <b-col cols="12" md="4">
          <label class="form-label fw-semibold">Tipe</label>
          <b-form-select v-model="selectedType" @change="resetPage">
            <template #first>
              <b-form-select-option value="">Semua Tipe</b-form-select-option>
            </template>
            <b-form-select-option value="text">Text</b-form-select-option>
            <b-form-select-option value="image">Image</b-form-select-option>
            <b-form-select-option value="video">Video</b-form-select-option>
            <b-form-select-option value="file">File</b-form-select-option>
          </b-form-select>
        </b-col>
      </b-row>

      <!-- Active Filters -->
      <div v-if="hasActiveFilters" class="d-flex flex-wrap gap-2 mt-3">
        <b-badge
          v-if="searchQuery"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Cari: "{{ searchQuery }}"
          <i
            class="bx bx-x cursor-pointer"
            @click="
              searchQuery = '';
              resetPage();
            "
          ></i>
        </b-badge>
        <b-badge
          v-if="selectedEventId"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Event: {{ selectedEventLabel }}
          <i
            class="bx bx-x cursor-pointer"
            @click="
              selectedEventId = '';
              resetPage();
            "
          ></i>
        </b-badge>
        <b-badge
          v-if="selectedType"
          variant="primary"
          class="d-flex align-items-center gap-1"
        >
          Tipe: {{ selectedType }}
          <i
            class="bx bx-x cursor-pointer"
            @click="
              selectedType = '';
              resetPage();
            "
          ></i>
        </b-badge>
      </div>
    </b-card>

    <!-- Table -->
    <b-row>
      <b-col>
        <UIComponentCard id="basic" title="Daftar Event Attribute">
          <div class="d-flex justify-content-end mb-3">
            <b-button variant="primary" :to="{ name: 'event-attribute.create' }">
              <i class="bx bx-plus fs-16 me-1"></i>Buat Event Attribute
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat...</p>
          </div>
          <div v-else-if="isError" class="alert alert-danger">
            {{ error?.message }}
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
                {{ totalRows }})
              </div>
              <b-pagination
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPageItem"
                prev-text="Sebelumnya"
                next-text="Selanjutnya"
              />
            </div>
            <div v-if="isFetching" class="text-center mt-2">
              <small><b-spinner small class="me-1" />Memperbarui...</small>
            </div>
          </div>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useQuery } from "@tanstack/vue-query";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import GridJsTable from "@/components/GridJsTable.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";
import { useEventAttributeTable } from "./components/data";
import { getEvents } from "@/services/eventService";
import router from "@/router";

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
  selectedEventId,
  selectedType,
} = useEventAttributeTable();

const hasActiveFilters = computed(
  () => !!(searchQuery.value || selectedEventId.value || selectedType.value),
);

const clearFilters = () => {
  searchQuery.value = "";
  selectedEventId.value = "";
  selectedType.value = "";
  resetPage();
};

const { data: eventData, isLoading: isEventLoading } = useQuery({
  queryKey: ["events-list"],
  queryFn: () => getEvents({ mode: "list" }),
});
const eventOptions = computed(() => {
  const list = Array.isArray(eventData.value) ? eventData.value : [];
  return [
    { value: 0, text: "Semua Event" },
    ...list.map((e: any) => ({ value: e.id, text: e.title })),
  ];
});
const selectedEventLabel = computed(
  () =>
    eventOptions.value.find((o) => o.value === selectedEventId.value)?.text ??
    "",
);

const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const editBtn = target.closest<HTMLElement>(
    '#table-gridjs .edit-btn[data-action="edit"]',
  );
  if (editBtn) {
    event.preventDefault();
    router.push(`/event-attribute/${editBtn.getAttribute("data-id")}/edit`);
    return;
  }
  const deleteBtn = target.closest<HTMLElement>(
    '#table-gridjs .delete-btn[data-action="delete"]',
  );
  if (deleteBtn) {
    event.preventDefault();
    handleDelete(Number(deleteBtn.getAttribute("data-id")));
  }
};

onMounted(() => document.addEventListener("click", handleGlobalClick));
onBeforeUnmount(() =>
  document.removeEventListener("click", handleGlobalClick),
);
</script>
