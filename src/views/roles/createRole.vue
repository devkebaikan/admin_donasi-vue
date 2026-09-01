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

            <!-- Menus Section (Tree) -->
            <div class="mb-4">
              <div
                class="d-flex justify-content-between align-items-center mb-3"
              >
                <h6 class="fw-semibold mb-0">
                  <i class="bx bx-menu me-2"></i>Menus
                </h6>
                <div class="d-flex gap-2">
                  <b-button
                    v-if="selectedMenus.length > 0"
                    type="button"
                    size="sm"
                    variant="outline-secondary"
                    @click="clearAllMenus"
                  >
                    <i class="bx bx-x me-1"></i>Hapus Semua
                  </b-button>
                  <b-button
                    type="button"
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

              <div
                v-else-if="menuTree.length === 0"
                class="alert alert-warning"
              >
                Tidak ada menus yang tersedia.
              </div>

              <div v-else class="menus-tree border rounded p-3">
                <MenuTreeNode
                  v-for="node in menuTree"
                  :key="node.id"
                  :node="node"
                  :selected="selectedMenus"
                  @toggle="toggleMenu"
                />
              </div>

              <div v-if="selectedMenus.length > 0" class="mt-3 pt-3 border-top">
                <small class="text-muted">
                  {{ selectedMenus.length }} menu dipilih
                </small>
              </div>
            </div>

            <!-- Permissions Section (Grouped Cards) -->
            <div class="mb-4">
              <div
                class="d-flex justify-content-between align-items-center mb-3"
              >
                <h6 class="fw-semibold mb-0">
                  <i class="bx bx-lock-open me-2"></i>Permissions
                </h6>
                <div class="d-flex gap-2">
                  <b-button
                    v-if="selectedPermissions.length > 0"
                    type="button"
                    size="sm"
                    variant="outline-secondary"
                    @click="clearAllPermissions"
                  >
                    <i class="bx bx-x me-1"></i>Hapus Semua
                  </b-button>
                  <b-button
                    type="button"
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

              <div
                v-else-if="standalonePermissions.length === 0"
                class="alert alert-info"
              >
                Tidak ada standalone permissions.
              </div>

              <b-row v-else>
                <b-col
                  v-for="groupItem in groupedPermissions"
                  :key="groupItem.group"
                  cols="12"
                  md="6"
                  lg="4"
                  class="mb-3"
                >
                  <b-card no-body class="h-100">
                    <template #header>
                      <div
                        class="d-flex justify-content-between align-items-center"
                      >
                        <span class="fw-semibold text-capitalize small">{{
                          groupItem.group
                        }}</span>
                        <b-button
                          type="button"
                          size="sm"
                          variant="link"
                          class="p-0"
                          @click="
                            isGroupFullySelected(groupItem.permissions)
                              ? clearAllInGroup(groupItem.permissions)
                              : selectAllInGroup(groupItem.permissions)
                          "
                        >
                          {{
                            isGroupFullySelected(groupItem.permissions)
                              ? "Hapus Semua"
                              : "Pilih Semua"
                          }}
                        </b-button>
                      </div>
                    </template>
                    <b-card-body class="d-flex flex-column gap-2 py-2">
                      <div
                        v-for="perm in groupItem.permissions"
                        :key="`perm-${perm.id}`"
                        class="form-check mb-0"
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
                    </b-card-body>
                  </b-card>
                </b-col>
              </b-row>

              <div
                v-if="selectedPermissions.length > 0"
                class="mt-3 pt-3 border-top"
              >
                <small class="text-muted">
                  {{ selectedPermissions.length }} permission dipilih
                </small>
              </div>
            </div>

            <!-- Actions -->
            <div class="d-flex gap-2">
              <b-button type="submit" variant="primary" :disabled="isPending">
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
import MenuTreeNode, { type MenuNode } from "./components/MenuTreeNode.vue";
import { createRole, getPermissionsReference } from "@/services/roleService";
import router from "@/router";

interface Permission {
  id: number;
  name: string;
  group?: string;
}

interface RawMenu {
  id: number;
  name: string;
  parent_id?: number | null;
  children?: RawMenu[];
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

const normalizeMenuTree = (items: RawMenu[]): MenuNode[] => {
  if (!items || items.length === 0) return [];

  const alreadyNested = items.some((item) => Array.isArray(item.children));
  if (alreadyNested) {
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      children: item.children ? normalizeMenuTree(item.children) : [],
    }));
  }

  const byId = new Map<number, MenuNode>();
  items.forEach((item) => {
    byId.set(item.id, { id: item.id, name: item.name, children: [] });
  });

  const roots: MenuNode[] = [];
  items.forEach((item) => {
    const node = byId.get(item.id)!;
    if (item.parent_id && byId.has(item.parent_id)) {
      byId.get(item.parent_id)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const menuTree = computed<MenuNode[]>(() => {
  const nested = permissionsRef.value?.menu_tree;
  const flat = permissionsRef.value?.menus;
  return normalizeMenuTree((nested ?? flat ?? []) as RawMenu[]);
});

const flattenMenus = (nodes: MenuNode[]): MenuNode[] =>
  nodes.flatMap((n) => [n, ...(n.children ? flattenMenus(n.children) : [])]);

const findMenuNode = (nodes: MenuNode[], id: number): MenuNode | undefined => {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findMenuNode(n.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

const descendantIds = (node: MenuNode): number[] =>
  (node.children ?? []).flatMap((c) => [c.id, ...descendantIds(c)]);

const standalonePermissions = computed((): Permission[] => {
  return (
    permissionsRef.value?.standalone_permissions ??
    permissionsRef.value?.permissions ??
    []
  );
});

const groupedPermissions = computed(() => {
  const groups = new Map<string, Permission[]>();

  standalonePermissions.value.forEach((perm) => {
    const key =
      perm.group ??
      (perm.name.includes(":")
        ? perm.name.split(":")[0]
        : perm.name.includes(".")
          ? perm.name.split(".")[0]
          : perm.name.includes("-")
            ? perm.name.split("-")[0]
            : "Lainnya");

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(perm);
  });

  return Array.from(groups.entries()).map(([group, permissions]) => ({
    group,
    permissions,
  }));
});

const allMenuIds = computed(() => {
  return flattenMenus(menuTree.value).map((m) => m.id);
});

const allPermissionIds = computed(() => {
  return standalonePermissions.value.map((p) => p.id);
});

const rules = {
  role_name: {
    required: helpers.withMessage("Nama role wajib diisi.", required),
  },
  guard_name: {
    required: helpers.withMessage("Guard name wajib dipilih.", required),
  },
};

const v$ = useVuelidate(rules, formState);

const toggleMenu = (menuId: number) => {
  const node = findMenuNode(menuTree.value, menuId);
  const ids = node ? [menuId, ...descendantIds(node)] : [menuId];
  const isCurrentlySelected = selectedMenus.value.includes(menuId);

  if (isCurrentlySelected) {
    selectedMenus.value = selectedMenus.value.filter((id) => !ids.includes(id));
  } else {
    selectedMenus.value = [...new Set([...selectedMenus.value, ...ids])];
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

const isGroupFullySelected = (permissions: Permission[]) =>
  permissions.every((p) => selectedPermissions.value.includes(p.id));

const selectAllInGroup = (permissions: Permission[]) => {
  const ids = permissions.map((p) => p.id);
  selectedPermissions.value = [
    ...new Set([...selectedPermissions.value, ...ids]),
  ];
};

const clearAllInGroup = (permissions: Permission[]) => {
  const ids = permissions.map((p) => p.id);
  selectedPermissions.value = selectedPermissions.value.filter(
    (id) => !ids.includes(id),
  );
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
    toast.error(
      err?.response?.data?.message ?? "Gagal menambahkan role. Coba lagi.",
    );
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
