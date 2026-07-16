<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard title="Buat Menu">
          <b-row class="g-3">
            <b-col md="6">
              <b-form-group label="Nama Menu*" label-for="name">
                <b-form-input
                  id="name"
                  v-model="v$.name.$model"
                  :state="v$.name.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.name.$error">
                  {{ v$.name.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>
            <b-col md="6">
              <b-form-group label="Route" label-for="route">
                <b-form-input
                  id="route"
                  v-model="formState.route"
                  maxlength="255"
                  placeholder="e.g., programs.list"
                />
                <small class="text-muted"
                  >Opsional - nama route untuk navigasi</small
                >
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Icon" label-for="icon">
                <b-form-input
                  id="icon"
                  v-model="formState.icon"
                  maxlength="100"
                  placeholder="e.g., bx bx-home"
                />
                <small class="text-muted">Opsional - icon class</small>
              </b-form-group>
            </b-col>
            <b-col md="6">
              <b-form-group label="Parent Menu" label-for="parent_id">
                <ChoicesSelect
                  id="parent_id"
                  :model-value="String(formState.parent_id || 0)"
                  @update:model-value="
                    (val: any) => {
                      formState.parent_id = val === '0' ? null : Number(val);
                    }
                  "
                  :options="parentMenuOptions"
                  :key="parentMenuOptions.length"
                />
                <small class="text-muted"
                  >Opsional - biarkan kosong jika menu utama</small
                >
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Urutan" label-for="order_index">
                <b-form-input
                  id="order_index"
                  v-model.number="formState.order_index"
                  type="number"
                  min="1"
                />
                <small class="text-muted">Nomor urut tampilan menu</small>
              </b-form-group>
            </b-col>
            <b-col md="6">
              <b-form-group label="Guard Name" label-for="guard_name">
                <ChoicesSelect
                  id="guard_name"
                  v-model="formState.guard_name"
                  :options="guardOptions"
                />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Izin Akses" label-for="permissions">
                <ChoicesSelect
                  id="permissions"
                  :model-value="formState.permission_ids.map(String)"
                  @update:model-value="
                    (val: any) => {
                      formState.permission_ids = Array.isArray(val)
                        ? val.map(Number)
                        : [Number(val)];
                    }
                  "
                  :options="permissionOptions"
                  :is-loading="isPermissionLoading"
                  :key="permissionOptions.length"
                />
                <small class="text-muted"
                  >Opsional - pilih izin yang diperlukan</small
                >
              </b-form-group>
            </b-col>
            <b-col md="6">
              <b-form-group label="Status">
                <b-form-checkbox
                  id="reg_only"
                  v-model="formState.is_active"
                  switch
                >
                  {{ formState.is_active ? "Aktif" : "Nonaktif" }}
                </b-form-checkbox>
              </b-form-group>
            </b-col>

            <b-col v-if="isPending" cols="12" class="text-center">
              <b-spinner variant="primary" class="me-2" />
              <span class="text-muted">Menyimpan...</span>
            </b-col>
            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end">
                <b-button
                  variant="outline-secondary"
                  :disabled="isPending"
                  @click="router.push('/menus')"
                >
                  Batal
                </b-button>
                <b-button
                  variant="primary"
                  :disabled="isPending"
                  @click="handleSubmit"
                >
                  <b-spinner v-if="isPending" small class="me-1" />Buat Menu
                </b-button>
              </div>
            </b-col>
          </b-row>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { createMenu, getAll } from "@/services/rbacMenuService";
import { getAllPermissions } from "@/services/permissionService";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import ChoicesSelect from "@/components/ChoicesSelect.vue";

const router = useRouter();
const queryClient = useQueryClient();

const formState = reactive({
  name: "",
  route: "",
  icon: "",
  parent_id: null as number | null,
  order_index: 1,
  guard_name: "web",
  permission_ids: [] as number[],
  is_active: true,
});

const rules = {
  name: {
    required: helpers.withMessage("Nama wajib diisi", required),
  },
};

const v$ = useVuelidate(rules, formState);

const guardOptions = [
  { value: "web", text: "Web" },
  { value: "api", text: "API" },
];

const { data: allMenus } = useQuery({
  queryKey: ["rbac-menus-for-parent"],
  queryFn: () => getAll({ format: "list" }),
});

const { data: allPermissions, isLoading: isPermissionLoading } = useQuery({
  queryKey: ["permissions-select"],
  queryFn: () => getAllPermissions(),
});

const parentMenuOptions = computed(() => {
  const menus = allMenus.value?.data || allMenus.value || [];
  return menus
    .filter((m: any) => m.parent_id === null || m.parent_id === undefined)
    .map((m: any) => ({
      value: m.id.toString(),
      text: m.name,
    }));
});

const permissionOptions = computed(() => {
  const perms = allPermissions.value || [];
  return perms
    .filter((p: any) => p.name)
    .map((p: any) => ({
      value: p.id.toString(),
      text: p.name,
    }));
});

const { mutate, isPending } = useMutation({
  mutationFn: () => createMenu(formState),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["rbac-menus"] });
    toast("Menu berhasil dibuat", { type: "success", position: "top-center" });
    setTimeout(() => router.push("/menus"), 1500);
  },
  onError: (err: any) => {
    toast(err?.response?.data?.message ?? "Gagal membuat menu", {
      type: "error",
      position: "top-center",
    });
  },
});

const handleSubmit = async () => {
  if (isPending.value) return;
  if (!(await v$.value.$validate())) {
    toast("Lengkapi field wajib", { type: "warning", position: "top-center" });
    return;
  }
  mutate();
};
</script>
