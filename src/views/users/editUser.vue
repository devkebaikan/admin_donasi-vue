<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard :title="`Edit User #${userId}`">
          <div v-if="isLoadingUser" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data user...</p>
          </div>

          <div v-else-if="!userData" class="alert alert-warning">
            Data user tidak ditemukan.
          </div>

          <b-row v-else class="g-3">
            <!-- Nama -->
            <b-col md="6">
              <b-form-group label="Nama Lengkap" label-for="name">
                <b-form-input
                  id="name"
                  v-model="v$.name.$model"
                  type="text"
                  placeholder="e.g., Ahmad Fauzi"
                  :state="v$.name.$error ? false : null"
                  maxlength="255"
                />
                <b-form-invalid-feedback v-if="v$.name.$error">
                  {{ v$.name.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Telepon -->
            <b-col md="6">
              <b-form-group label="Telepon" label-for="phone">
                <b-form-input
                  id="phone"
                  v-model="v$.phone.$model"
                  type="text"
                  placeholder="e.g., 08123456789"
                  :state="v$.phone.$error ? false : null"
                  maxlength="30"
                />
                <b-form-invalid-feedback v-if="v$.phone.$error">
                  {{ v$.phone.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Email -->
            <b-col md="6">
              <b-form-group label="Email" label-for="email">
                <b-form-input
                  id="email"
                  v-model="formState.email"
                  type="email"
                  placeholder="e.g., user@email.com"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Password -->
            <b-col md="6">
              <b-form-group label="Password Baru" label-for="password">
                <b-form-input
                  id="password"
                  v-model="formState.password"
                  type="password"
                  placeholder="Kosongkan jika tidak ingin mengubah"
                />
                <small class="text-muted">Opsional — minimal 6 karakter</small>
              </b-form-group>
            </b-col>

            <!-- Role ID -->
            <b-col md="4">
              <b-form-group label="Role ID" label-for="role-id">
                <b-form-input
                  id="role-id"
                  v-model.number="v$.role_id.$model"
                  type="number"
                  placeholder="e.g., 7"
                  min="1"
                  :state="v$.role_id.$error ? false : null"
                />
                <b-form-invalid-feedback v-if="v$.role_id.$error">
                  {{ v$.role_id.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Status Verified -->
            <b-col md="4">
              <b-form-group label="Status Verified" label-for="verified">
                <b-form-input
                  id="verified"
                  v-model="formState.verified"
                  type="text"
                  placeholder="e.g., verified"
                  maxlength="50"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Referral Code -->
            <b-col md="4">
              <b-form-group label="Kode Referral" label-for="referral-code">
                <b-form-input
                  id="referral-code"
                  v-model="formState.referral_code"
                  type="text"
                  placeholder="e.g., REF123"
                  maxlength="50"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Public Code -->
            <b-col md="4">
              <b-form-group label="Kode Publik" label-for="public-code">
                <b-form-input
                  id="public-code"
                  v-model="formState.public_code"
                  type="text"
                  placeholder="e.g., PUB123"
                  maxlength="50"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Catatan -->
            <b-col md="8">
              <b-form-group label="Catatan" label-for="note">
                <b-form-textarea
                  id="note"
                  v-model="formState.note"
                  placeholder="Catatan tambahan..."
                  rows="2"
                />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Seksi Donatur -->
            <b-col cols="12" class="mt-3">
              <hr class="my-3" />
              <h4 class="text-muted fw-semibold mb-3">
                Info Donatur
                <small class="fw-normal">(Opsional)</small>
              </h4>
            </b-col>

            <b-col md="4">
              <b-form-group label="Panggilan" label-for="panggilan">
                <b-form-input
                  id="panggilan"
                  v-model="formState.panggilan"
                  type="text"
                  placeholder="e.g., Bapak"
                />
              </b-form-group>
            </b-col>

            <b-col md="4">
              <b-form-group label="Nama Asli" label-for="real-name">
                <b-form-input
                  id="real-name"
                  v-model="formState.real_name"
                  type="text"
                  placeholder="e.g., Ahmad Fauzi"
                />
              </b-form-group>
            </b-col>

            <b-col md="4">
              <b-form-group label="CS ID" label-for="cs-id">
                <b-form-input
                  id="cs-id"
                  v-model.number="formState.cs_id"
                  type="number"
                  placeholder="ID CS yang handle"
                  min="1"
                />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Soft" label-for="soft">
                <b-form-input
                  id="soft"
                  v-model="formState.soft"
                  type="text"
                  placeholder="Info soft..."
                />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Soft Terakhir" label-for="soft-terakhir">
                <b-form-input
                  id="soft-terakhir"
                  v-model="formState.soft_terakhir"
                  type="text"
                  placeholder="Info soft terakhir..."
                />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Hard" label-for="hard">
                <b-form-input
                  id="hard"
                  v-model="formState.hard"
                  type="text"
                  placeholder="Info hard..."
                />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Hard Terakhir" label-for="hard-terakhir">
                <b-form-input
                  id="hard-terakhir"
                  v-model="formState.hard_terakhir"
                  type="text"
                  placeholder="Info hard terakhir..."
                />
              </b-form-group>
            </b-col>

            <b-col md="12">
              <b-form-group label="Exis" label-for="exis">
                <b-form-input
                  id="exis"
                  v-model="formState.exis"
                  type="text"
                  placeholder="Info exis..."
                />
              </b-form-group>
            </b-col>

            <!-- Loading -->
            <b-col cols="12" v-if="isPending" class="text-center">
              <b-spinner variant="primary" class="me-2" />
              <span class="text-muted">Menyimpan perubahan...</span>
            </b-col>

            <!-- Tombol -->
            <b-col cols="12">
              <div class="d-flex gap-2 justify-content-end">
                <b-button
                  variant="outline-secondary"
                  @click="router.push('/users')"
                  :disabled="isPending"
                >
                  Batal
                </b-button>
                <b-button
                  variant="primary"
                  @click="handleSubmit"
                  :disabled="isPending"
                >
                  <b-spinner v-if="isPending" small class="me-1" />
                  Simpan Perubahan
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
import { reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required, minLength, maxLength, helpers } from "@vuelidate/validators";
import { toast as showToast } from "vue3-toastify";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { getUserById, updateUser } from "@/services/userService";

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const userId = Number(route.params.id);

const formState = reactive({
  name: "",
  phone: "",
  email: "",
  password: "",
  role_id: null as number | null,
  verified: "",
  referral_code: "",
  public_code: "",
  note: "",
  panggilan: "",
  real_name: "",
  cs_id: null as number | null,
  soft: "",
  soft_terakhir: "",
  hard: "",
  hard_terakhir: "",
  exis: "",
});

const { data: userData, isLoading: isLoadingUser } = useQuery({
  queryKey: ["users", userId],
  queryFn: () => getUserById(userId),
  enabled: !!userId,
});

watch(userData, (user) => {
  if (!user) return;
  formState.name = user.name ?? "";
  formState.phone = user.phone ?? "";
  formState.email = user.email ?? "";
  formState.password = "";
  formState.role_id = user.role_id ?? null;
  formState.verified = user.verified ?? "";
  formState.referral_code = user.referral_code ?? "";
  formState.public_code = user.public_code ?? "";
  formState.note = user.note ?? "";
  const d = user.donatur;
  if (d) {
    formState.panggilan = d.panggilan ?? "";
    formState.real_name = d.real_name ?? "";
    formState.cs_id = d.cs_id ?? null;
    formState.soft = d.soft ?? "";
    formState.soft_terakhir = d.soft_terakhir ?? "";
    formState.hard = d.hard ?? "";
    formState.hard_terakhir = d.hard_terakhir ?? "";
    formState.exis = d.exis ?? "";
  }
});

const rules = {
  name: {
    required: helpers.withMessage("Nama wajib diisi", required),
    minLength: helpers.withMessage("Minimal 2 karakter", minLength(2)),
    maxLength: helpers.withMessage("Maksimal 255 karakter", maxLength(255)),
  },
  phone: {
    required: helpers.withMessage("Telepon wajib diisi", required),
    minLength: helpers.withMessage("Minimal 10 karakter", minLength(10)),
    maxLength: helpers.withMessage("Maksimal 30 karakter", maxLength(30)),
  },
  role_id: {
    required: helpers.withMessage("Role ID wajib diisi", required),
  },
};

const v$ = useVuelidate(rules, formState);

const { mutate, isPending } = useMutation({
  mutationFn: () => {
    const payload: Record<string, any> = {
      name: formState.name,
      phone: formState.phone,
      role_id: formState.role_id,
    };
    if (formState.email) payload.email = formState.email;
    if (formState.password) payload.password = formState.password;
    if (formState.verified) payload.verified = formState.verified;
    if (formState.referral_code)
      payload.referral_code = formState.referral_code;
    if (formState.public_code) payload.public_code = formState.public_code;
    if (formState.note) payload.note = formState.note;

    const donaturFields = [
      "panggilan",
      "real_name",
      "soft",
      "soft_terakhir",
      "hard",
      "hard_terakhir",
      "exis",
    ] as const;
    const donatur: Record<string, any> = {};
    donaturFields.forEach((k) => {
      if (formState[k]) donatur[k] = formState[k];
    });
    if (formState.cs_id) donatur.cs_id = formState.cs_id;
    if (Object.keys(donatur).length) payload.donatur = donatur;

    return updateUser(userId, payload);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    showToast("User berhasil diperbarui", {
      type: "success",
      position: "top-center",
    });
    setTimeout(() => router.push("/users"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui user";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmit = async () => {
  if (isPending.value) return;
  const isValid = await v$.value.$validate();
  if (!isValid) {
    showToast("Lengkapi semua field yang wajib diisi", {
      type: "warning",
      position: "top-center",
    });
    return;
  }
  mutate();
};
</script>
