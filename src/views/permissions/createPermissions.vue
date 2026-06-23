<template>
  <VerticalLayout>
    <b-row>
      <b-col cols="12">
        <UIComponentCard title="Tambah Permission">
          <form @submit.prevent="handleSubmit">
            <!-- Nama Permission -->
            <div class="mb-3">
              <label class="form-label fw-semibold required">Nama</label>
              <b-form-input
                v-model="formState.name"
                type="text"
                placeholder="Contoh: bank:create"
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

            <!-- Type -->
            <div class="mb-3">
              <label class="form-label fw-semibold required">Type</label>
              <b-form-input
                v-model="formState.type"
                type="text"
                placeholder="Contoh: bank"
                :state="v$.type.$dirty ? !v$.type.$error : null"
              />
              <div v-if="v$.type.$error" class="invalid-feedback d-block">
                {{ v$.type.$errors[0]?.$message }}
              </div>
            </div>

            <!-- Main -->
            <div class="mb-4">
              <label class="form-label fw-semibold">Status</label>
              <div class="form-check form-switch mt-1">
                <input
                  id="main-switch"
                  v-model="isMain"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  :aria-checked="isMain"
                />
                <label class="form-check-label" for="main-switch">
                  {{ isMain ? "Utama" : "Tambahan" }}
                </label>
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
                @click="router.push('/permissions')"
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
import { reactive, ref } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, minLength, maxLength } from "@vuelidate/validators";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { createPermission } from "@/services/permissionService";
import router from "@/router";

const formState = reactive({
  name: "",
  guard_name: "",
  type: "",
});

const isMain = ref<boolean>(false);

const rules = {
  name: {
    required: helpers.withMessage("Nama permission wajib diisi.", required),
    minLength: helpers.withMessage("Minimal 2 karakter.", minLength(2)),
    maxLength: helpers.withMessage("Maksimal 255 karakter.", maxLength(255)),
  },
  guard_name: {
    required: helpers.withMessage("Guard name wajib dipilih.", required),
  },
  type: {
    required: helpers.withMessage("Type wajib diisi.", required),
    minLength: helpers.withMessage("Minimal 2 karakter.", minLength(2)),
    maxLength: helpers.withMessage("Maksimal 100 karakter.", maxLength(100)),
  },
};

const v$ = useVuelidate(rules, formState);

const { mutate, isPending } = useMutation({
  mutationFn: createPermission,
  onSuccess: () => {
    toast.success("Permission berhasil ditambahkan.");
    router.push("/permissions");
  },
  onError: () => {
    toast.error("Gagal menambahkan permission. Coba lagi.");
  },
});

const handleSubmit = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  mutate({
    name: formState.name,
    guard_name: formState.guard_name,
    type: formState.type,
    main: isMain.value ? 1 : 0,
  });
};
</script>
