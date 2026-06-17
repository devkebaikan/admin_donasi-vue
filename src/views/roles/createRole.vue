<template>
  <VerticalLayout>
    <b-row>
      <b-col cols="12" md="8" lg="6">
        <UIComponentCard title="Tambah Role">
          <form @submit.prevent="handleSubmit">
            <!-- Nama Role -->
            <div class="mb-3">
              <label class="form-label fw-semibold required">Nama Role</label>
              <b-form-input
                v-model="formState.name"
                type="text"
                placeholder="Masukkan nama role"
                :state="v$.name.$dirty ? !v$.name.$error : null"
              />
              <div v-if="v$.name.$error" class="invalid-feedback d-block">
                {{ v$.name.$errors[0]?.$message }}
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

            <!-- Permissions -->
            <div class="mb-4">
              <label class="form-label fw-semibold">Permissions</label>
              <p class="text-muted small mb-2">
                Masukkan nama permission satu per baris.
              </p>
              <b-form-textarea
                v-model="permissionsText"
                rows="5"
                placeholder="Contoh:&#10;view users&#10;create users&#10;edit users"
              />
              <div v-if="parsedPermissions.length" class="mt-2">
                <span
                  v-for="perm in parsedPermissions"
                  :key="perm"
                  class="badge bg-light text-dark me-1 mb-1 font-monospace"
                  >{{ perm }}</span
                >
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
import { useMutation } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { toast } from "vue3-toastify";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { createRole } from "@/services/roleService";
import router from "@/router";

const formState = reactive({
  name: "",
  guard_name: "",
});

const permissionsText = ref<string>("");

const parsedPermissions = computed(() =>
  permissionsText.value
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0),
);

const rules = {
  name: { required: helpers.withMessage("Nama role wajib diisi.", required) },
  guard_name: {
    required: helpers.withMessage("Guard name wajib dipilih.", required),
  },
};

const v$ = useVuelidate(rules, formState);

const { mutate, isPending } = useMutation({
  mutationFn: createRole,
  onSuccess: () => {
    toast.success("Role berhasil ditambahkan.");
    router.push("/roles");
  },
  onError: () => {
    toast.error("Gagal menambahkan role. Coba lagi.");
  },
});

const handleSubmit = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  mutate({
    name: formState.name,
    guard_name: formState.guard_name,
    permissions: parsedPermissions.value,
  });
};
</script>
