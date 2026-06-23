<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <UIComponentCard :title="`Edit Ads Script #${scriptId}`">
          <div v-if="isLoadingScript" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-2">Memuat data...</p>
          </div>

          <div v-else-if="!scriptData" class="alert alert-warning">
            Data tidak ditemukan.
            <b-button variant="link" @click="router.push('/ads-scripts')">Kembali ke daftar</b-button>
          </div>

          <b-row v-else class="g-3">

            <!-- Nama -->
            <b-col md="6">
              <b-form-group label="Nama" label-for="name">
                <b-form-input
                  id="name"
                  v-model="v$.name.$model"
                  type="text"
                  placeholder="e.g., FB Pixel Beramal"
                  :state="v$.name.$error ? false : null"
                />
                <b-form-invalid-feedback v-if="v$.name.$error">
                  {{ v$.name.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Tipe -->
            <b-col md="6">
              <b-form-group label="Tipe" label-for="type">
                <b-form-select
                  id="type"
                  v-model="v$.type.$model"
                  :state="v$.type.$error ? false : null"
                >
                  <option value="" disabled>-- Pilih Tipe --</option>
                  <option value="google">Google</option>
                  <option value="meta">Meta</option>
                  <option value="tiktok">TikTok</option>
                </b-form-select>
                <b-form-invalid-feedback v-if="v$.type.$error">
                  {{ v$.type.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Script ID -->
            <b-col md="6">
              <b-form-group label="Script ID" label-for="script-id">
                <b-form-input
                  id="script-id"
                  v-model="v$.script_id.$model"
                  type="text"
                  placeholder="e.g., 1138938137800786"
                  :state="v$.script_id.$error ? false : null"
                />
                <b-form-invalid-feedback v-if="v$.script_id.$error">
                  {{ v$.script_id.$errors[0].$message }}
                </b-form-invalid-feedback>
              </b-form-group>
            </b-col>

            <!-- Web -->
            <b-col md="6">
              <b-form-group label="Web / Domain" label-for="web">
                <b-form-input id="web" v-model="formState.web" type="text" placeholder="e.g., aksiberbagi.com" />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Script Token -->
            <b-col md="12">
              <b-form-group label="Script Token" label-for="script-token">
                <b-form-textarea id="script-token" v-model="formState.script_token" placeholder="Token / access token..." rows="3" />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Test Code -->
            <b-col md="6">
              <b-form-group label="Test Code" label-for="test-code">
                <b-form-input id="test-code" v-model="formState.test_code" type="text" placeholder="e.g., TEST12345" />
                <small class="text-muted">Opsional</small>
              </b-form-group>
            </b-col>

            <!-- Google Ads -->
            <b-col cols="12">
              <hr class="my-1" />
              <h6 class="text-muted fw-semibold mb-3">
                Konfigurasi Google Ads
                <small class="fw-normal">(Opsional — isi jika tipe Google)</small>
              </h6>
            </b-col>

            <b-col md="6">
              <b-form-group label="Customer ID" label-for="google-customer-id">
                <b-form-input id="google-customer-id" v-model="formState.google_customer_id" type="text" placeholder="e.g., 1234567890" maxlength="20" />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Login Customer ID" label-for="google-login-customer-id">
                <b-form-input id="google-login-customer-id" v-model="formState.google_login_customer_id" type="text" placeholder="e.g., 1234567890" maxlength="20" />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Developer Token" label-for="google-developer-token">
                <b-form-input id="google-developer-token" v-model="formState.google_developer_token" type="text" placeholder="Developer token..." />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Client ID" label-for="google-client-id">
                <b-form-input id="google-client-id" v-model="formState.google_client_id" type="text" placeholder="Client ID..." />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Client Secret" label-for="google-client-secret">
                <b-form-input id="google-client-secret" v-model="formState.google_client_secret" type="password" placeholder="Kosongkan jika tidak ingin mengubah" />
                <small class="text-muted">Opsional — kosongkan jika tidak diubah</small>
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Refresh Token" label-for="google-refresh-token">
                <b-form-input id="google-refresh-token" v-model="formState.google_refresh_token" type="password" placeholder="Kosongkan jika tidak ingin mengubah" />
                <small class="text-muted">Opsional — kosongkan jika tidak diubah</small>
              </b-form-group>
            </b-col>

            <!-- Conversion Actions -->
            <b-col cols="12">
              <hr class="my-1" />
              <h6 class="text-muted fw-semibold mb-3">
                Conversion Actions
                <small class="fw-normal">(Opsional)</small>
              </h6>
            </b-col>

            <b-col md="6">
              <b-form-group label="Purchase" label-for="conversion-purchase">
                <b-form-input id="conversion-purchase" v-model="formState.conversion_action_purchase" type="text" placeholder="Conversion action purchase..." maxlength="50" />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Checkout" label-for="conversion-checkout">
                <b-form-input id="conversion-checkout" v-model="formState.conversion_action_checkout" type="text" placeholder="Conversion action checkout..." maxlength="50" />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Add to Cart" label-for="conversion-add-cart">
                <b-form-input id="conversion-add-cart" v-model="formState.conversion_action_add_cart" type="text" placeholder="Conversion action add cart..." maxlength="50" />
              </b-form-group>
            </b-col>

            <b-col md="6">
              <b-form-group label="Registration" label-for="conversion-registration">
                <b-form-input id="conversion-registration" v-model="formState.conversion_action_registration" type="text" placeholder="Conversion action registration..." maxlength="50" />
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
                <b-button variant="outline-secondary" @click="router.push('/ads-scripts')" :disabled="isPending">
                  Batal
                </b-button>
                <b-button variant="primary" @click="handleSubmit" :disabled="isPending">
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
import { required, helpers } from "@vuelidate/validators";
import { toast as showToast } from "vue3-toastify";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { getAdsScriptById, updateAdsScript } from "@/services/adsScriptService";

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const scriptId = Number(route.params.id);

const formState = reactive({
  name: "",
  type: "",
  script_id: "",
  web: "",
  script_token: "",
  test_code: "",
  google_customer_id: "",
  google_login_customer_id: "",
  google_developer_token: "",
  google_client_id: "",
  google_client_secret: "",
  google_refresh_token: "",
  conversion_action_purchase: "",
  conversion_action_checkout: "",
  conversion_action_add_cart: "",
  conversion_action_registration: "",
});

const { data: scriptData, isLoading: isLoadingScript } = useQuery({
  queryKey: ["ads-scripts", scriptId],
  queryFn: () => getAdsScriptById(scriptId),
  enabled: !!scriptId,
});

watch(scriptData, (data) => {
  if (!data) return;
  formState.name = data.name ?? "";
  formState.type = data.type ?? "";
  formState.script_id = data.script_id ?? "";
  formState.web = data.web ?? "";
  formState.script_token = data.script_token ?? "";
  formState.test_code = data.test_code ?? "";
  formState.google_customer_id = data.google_customer_id ?? "";
  formState.google_login_customer_id = data.google_login_customer_id ?? "";
  formState.google_developer_token = data.google_developer_token ?? "";
  formState.google_client_id = data.google_client_id ?? "";
  formState.google_client_secret = "";
  formState.google_refresh_token = "";
  formState.conversion_action_purchase = data.conversion_action_purchase ?? "";
  formState.conversion_action_checkout = data.conversion_action_checkout ?? "";
  formState.conversion_action_add_cart = data.conversion_action_add_cart ?? "";
  formState.conversion_action_registration = data.conversion_action_registration ?? "";
});

const rules = {
  name: { required: helpers.withMessage("Nama wajib diisi", required) },
  type: { required: helpers.withMessage("Tipe wajib dipilih", required) },
  script_id: { required: helpers.withMessage("Script ID wajib diisi", required) },
};

const v$ = useVuelidate(rules, formState);

const { mutate, isPending } = useMutation({
  mutationFn: () => {
    const payload: Record<string, any> = {};
    Object.entries(formState).forEach(([k, v]) => { if (v !== "") payload[k] = v; });
    return updateAdsScript(scriptId, payload);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["ads-scripts"] });
    showToast("Ads script berhasil diperbarui", { type: "success", position: "top-center" });
    setTimeout(() => router.push("/ads-scripts"), 1500);
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message ?? "Gagal memperbarui ads script";
    showToast(msg, { type: "error", position: "top-center" });
  },
});

const handleSubmit = async () => {
  if (isPending.value) return;
  const isValid = await v$.value.$validate();
  if (!isValid) {
    showToast("Lengkapi semua field yang wajib diisi", { type: "warning", position: "top-center" });
    return;
  }
  mutate();
};
</script>
