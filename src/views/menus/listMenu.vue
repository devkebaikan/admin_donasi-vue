<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard id="menus-table" title="Daftar Menu">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <b-button-group>
                <b-button
                  :variant="
                    viewFormat === 'tree' ? 'primary' : 'outline-secondary'
                  "
                  size="sm"
                  @click="viewFormat = 'tree'"
                >
                  <i class="bx bx-sitemap me-1"></i>Struktur
                </b-button>
                <b-button
                  :variant="
                    viewFormat === 'list' ? 'primary' : 'outline-secondary'
                  "
                  size="sm"
                  @click="viewFormat = 'list'"
                >
                  <i class="bx bx-list-ul me-1"></i>Daftar
                </b-button>
              </b-button-group>
            </div>
            <b-button variant="primary" @click="router.push('/menus/create')">
              <i class="bx bx-plus fs-16 me-1"></i>Buat Menu
            </b-button>
          </div>

          <div v-if="isLoading" class="text-center p-4">
            <b-spinner />
            <p class="mt-2">Memuat...</p>
          </div>
          <div v-else-if="isError" class="alert alert-danger">
            {{ error?.message }}
          </div>
          <div v-else>
            <!-- List View -->
            <div v-if="viewFormat === 'list'">
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
            </div>

            <!-- Tree View -->
            <div v-else class="menu-tree">
              <MenuItem
                v-for="item in treeData"
                :key="item.id"
                :item="item"
                @edit="editItem"
                @delete="deleteItem"
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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useQuery } from "@tanstack/vue-query";
import { getAll, deleteMenu } from "@/services/rbacMenuService";
import { useMenuTable } from "./components/data";
import MenuItem from "./components/MenuItem.vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/dist/sweetalert2.css";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const router = useRouter();
const viewFormat = ref<"list" | "tree">("tree");

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

const { data: treeDataRes } = useQuery({
  queryKey: computed(() => ["rbac-menus-tree", viewFormat.value]),
  queryFn: () => getAll({ format: "tree" }),
  enabled: computed(() => viewFormat.value === "tree" && !isLoading.value),
});

const treeData = computed(() => treeDataRes.value?.data || []);

const editItem = (id: number) => {
  router.push({
    name: "menu.edit",
    params: { id },
  });
};

const deleteItem = async (id: number) => {
  const result = await Swal.fire({
    title: "Hapus Menu?",
    text: "Tidak bisa dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
    confirmButtonColor: "#dc3545",
  });

  if (!result.isConfirmed) return;

  try {
    await deleteMenu(id);
    toast("Menu berhasil dihapus.", {
      type: "success",
      position: "top-center",
    });
  } catch (err: any) {
    toast(err?.response?.data?.message ?? "Gagal menghapus", {
      type: "error",
      position: "top-center",
    });
  }
};

const handleGlobalClick = (event: Event) => {
  if (viewFormat.value !== "list") return;

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

<style scoped>
.menu-tree {
  padding: 1.5rem;
  border-radius: 0.5rem;
}
</style>
