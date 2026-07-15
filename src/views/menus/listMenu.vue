<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard id="menus-table" title="Daftar Menu">
          <div v-if="isLoading" class="text-center p-4">
            <b-spinner />
            <p class="mt-2">Memuat...</p>
          </div>
          <div v-else-if="isError" class="alert alert-danger">
            {{ error?.message }}
          </div>
          <div v-else>
            <GridJsTable
              id="table-menus"
              :key="tableKeyString"
              :options="tableOptions"
            />
            <div class="d-flex justify-content-between mt-3">
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
              <small><b-spinner small />Memperbarui...</small>
            </div>
          </div>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useMenuTable } from "./components/data";
import VerticalLayout from "@/layouts/VerticalLayout.vue";

const router = useRouter();

const {
  tableOptions,
  tableKeyString,
  isLoading,
  isError,
  error,
  isFetching,
  currentPage,
  perPageItem,
  totalRows,
  totalPages,
  handleDelete,
} = useMenuTable();

const handleGlobalClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const editBtn = target.closest<HTMLElement>(
    '#table-menus .edit-btn[data-action="edit"]',
  );
  if (editBtn) {
    event.preventDefault();
    router.push({
      name: "menu.edit",
      params: { id: editBtn.getAttribute("data-id") },
    });
    return;
  }
  const deleteBtn = target.closest<HTMLElement>(
    '#table-menus .delete-btn[data-action="delete"]',
  );
  if (deleteBtn) {
    event.preventDefault();
    handleDelete(Number(deleteBtn.getAttribute("data-id")));
  }
};

onMounted(() => document.addEventListener("click", handleGlobalClick));
onBeforeUnmount(() => document.removeEventListener("click", handleGlobalClick));
</script>
