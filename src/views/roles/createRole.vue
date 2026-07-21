<template>
  <VerticalLayout>
    <b-row>
      <b-col cols="12" lg="12">
        <UIComponentCard title="Tambah Role">
          <form @submit.prevent="handleSubmit">
            <!-- Nama Role -->
            <div class="mb-3">
              <label class="form-label fw-semibold required">Nama Role</label>
              <b-form-input
                v-model="formState.role_name"
                type="text"
                placeholder="Masukkan nama role"
                :state="v$.role_name.$dirty ? !v$.role_name.$error : null"
              />
              <div v-if="v$.role_name.$error" class="invalid-feedback d-block">
                {{ v$.role_name.$errors[0]?.$message }}
              </div>
            </div>

            <!-- Guard Name -->
            <div class="mb-3">
              <label class="form-label fw-semibold required">Guard Name</label>
              <b-form-select
                v-model="formState.guard_name"
                :state="v$.guard_name.$dirty ? !v$.guard_name.$error : null"
              >
                <template #first>
                  <b-form-select-option value="" disabled
                    >Pilih guard</b-form-select-option
                  >
                </template>
                <b-form-select-option value="api">api</b-form-select-option>
                <b-form-select-option value="web">web</b-form-select-option>
              </b-form-select>
              <div v-if="v$.guard_name.$error" class="invalid-feedback d-block">
                {{ v$.guard_name.$errors[0]?.$message }}
              </div>
            </div>

            <hr class="my-4" />

            <!-- Menus Section -->
            <div class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-semibold mb-0">
                  <i class="bx bx-menu me-2"></i>Menus
                </h6>
                <div class="d-flex gap-2">
                  <b-button
                    v-if="selectedMenus.length > 0"
                    size="sm"
                    variant="outline-secondary"
                    @click="clearAllMenus"
                  >
                    <i class="bx bx-x me-1"></i>Hapus Semua
                  </b-button>
                  <b-button
                    size="sm"
                    variant="outline-primary"
                    @click="selectAllMenus"
                  >
                    <i class="bx bx-check me-1"></i>Pilih Semua
                  </b-button>
                </div>
              </div>

              <div v-if="isLoadingPermissions" class="text-center p-4">
                <b-spinner small class="me-2" />
                <span class="text-muted">Memuat menus...</span>
              </div>

              <div v-else-if="availableMenus.length === 0" class="alert alert-warning">
                Tidak ada menus yang tersedia.
              </div>

              <div v-else class="menus-list">
                <div class="d-flex flex-wrap gap-3">
                  <div
                    v-for="menu in availableMenus"
                    :key="`menu-${menu.id}`"
                    class="form-check"
                  >
                    <input
                      :id="`menu-${menu.id}`"
                      type="checkbox"
                      class="form-check-input"
                      :checked="selectedMenus.includes(menu.id)"
                      @change="toggleMenu(menu.id)"
                    />
                    <label
                      :for="`menu-${menu.id}`"
                      class="form-check-label text-muted small"
                    >
                      {{ menu.name }}
                    </label>
                  </div>
                </div>
              </div>

              <div v-if="selectedMenus.length > 0" class="mt-3 pt-3 border-top">
                <small class="text-muted">
                  {{ selectedMenus.length }} menu dipilih
                </small>
              </div>
            </div>

            <!-- Permissions Section -->
            <div class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-semibold mb-0">
                  <i class="bx bx-lock-open me-2"></i>Permissions
                </h6>
                <div class="d-flex gap-2">
                  <b-button
                    v-if="selectedPermissions.length > 0"
                    size="sm"
                    variant="outline-secondary"
                    @click="clearAllPermissions"
                  >
                    <i class="bx bx-x me-1"></i>Hapus Semua
                  </b-button>
                  <b-button
                    size="sm"
                    variant="outline-primary"
                    @click="selectAllPermissions"
                  >
                    <i class="bx bx-check me-1"></i>Pilih Semua
                  </b-button>
                </div>
              </div>

              <div v-if="isLoadingPermissions" class="text-center p-4">
                <b-spinner small class="me-2" />
                <span class="text-muted">Memuat permissions...</span>
              </div>

              <div v-else-if="standalonePermissions.length === 0" class="alert alert-info">
                Tidak ada standalone permissions.
              </div>

              <div v-else class="permissions-list">
                <div class="d-flex flex-wrap gap-3">
                  <div
                    v-for="perm in standalonePermissions"
                    :key="`perm-${perm.id}`"
                    class="form-check"
                  >
                    <input
                      :id="`perm-${perm.id}`"
                      type="checkbox"
                      class="form-check-input"
                      :checked="selectedPermissions.includes(perm.id)"
                      @change="togglePermission(perm.id)"
                    />
                    <label
                      :for="`perm-${perm.id}`"
                      class="form-check-label text-muted small"
                    >
                      {{ perm.name }}
                    </label>
                  </div>
                </div>
              </div>

              <div v-if="selectedPermissions.length > 0" class="mt-3 pt-3 border-top">
                <small class="text-muted">
                  {{ selectedPermissions.length }} permission dipilih
                </small>
              </div>
            </div>

            <!-- Actions -->
            <div class="d-flex gap-2">
              <b-button
                type="submit"
                variant="primary"
                :disabled="isPending"
              >
                <b-spinner v-if="isPending" small class="me-1" />
                {{ isPending ? "Menyimpan..." : "Simpan" }}
              </b-button>
              <b-button
                variant="outline-secondary"
                @click="router.push('/roles')"
              >
                Batal
              </b-button>
            </div>
          </form>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from "vue";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { toast } from "vue3-toastify";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { createRole, getPermissionsReference } from "@/services/roleService";
import router from "@/router";

interface Permission {
  id: number;
  name: string;
}

interface Menu {
  id: number;
  name: string;
}

const formState = reactive({
  role_name: "",
  guard_name: "",
});

const selectedMenus = ref<number[]>([]);
const selectedPermissions = ref<number[]>([]);

const { data: permissionsRef, isLoading: isLoadingPermissions } = useQuery({
  queryKey: ["permissions-reference"],
  queryFn: getPermissionsReference,
});

const availableMenus = computed((): Menu[] => {
  return (permissionsRef.value?.menus ?? []);
});

const standalonePermissions = computed((): Permission[] => {
  return (permissionsRef.value?.permissions ?? []);
});

const allMenuIds = computed(() => {
  return availableMenus.value.map((m) => m.id);
});

const allPermissionIds = computed(() => {
  return standalonePermissions.value.map((p) => p.id);
});

const rules = {
  role_name: { required: helpers.withMessage("Nama role wajib diisi.", required) },
  guard_name: {
    required: helpers.withMessage("Guard name wajib dipilih.", required),
  },
};

const v$ = useVuelidate(rules, formState);

const toggleMenu = (menuId: number) => {
  const index = selectedMenus.value.indexOf(menuId);
  if (index > -1) {
    selectedMenus.value.splice(index, 1);
  } else {
    selectedMenus.value.push(menuId);
  }
};

const togglePermission = (permId: number) => {
  const index = selectedPermissions.value.indexOf(permId);
  if (index > -1) {
    selectedPermissions.value.splice(index, 1);
  } else {
    selectedPermissions.value.push(permId);
  }
};

const selectAllMenus = () => {
  selectedMenus.value = [...allMenuIds.value];
};

const clearAllMenus = () => {
  selectedMenus.value = [];
};

const selectAllPermissions = () => {
  selectedPermissions.value = [...allPermissionIds.value];
};

const clearAllPermissions = () => {
  selectedPermissions.value = [];
};

const { mutate, isPending } = useMutation({
  mutationFn: (payload: {
    guard_name: string;
    role_name: string;
    menu_ids: number[];
    permission_ids: number[];
  }) => createRole(payload),
  onSuccess: () => {
    toast.success("Role berhasil ditambahkan.");
    router.push("/roles");
  },
  onError: (err: any) => {
    toast.error(err?.response?.data?.message ?? "Gagal menambahkan role. Coba lagi.");
  },
});

const handleSubmit = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  mutate({
    role_name: formState.role_name,
    guard_name: formState.guard_name,
    menu_ids: selectedMenus.value,
    permission_ids: selectedPermissions.value,
  });
};
</script>
