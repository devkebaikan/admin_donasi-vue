<template>
  <VerticalLayout>
    <b-row>
      <b-col cols="12">
        <UIComponentCard id="influencer-create" title="Tambah Influencer Baru">
          <b-form @submit.prevent="handleSubmit">
            <b-row class="g-3">
              <!-- Name (Handle/Username dasar) -->
              <b-col md="6">
                <b-form-group label="Username / Identifier *" label-for="name">
                  <b-form-input
                    id="name"
                    v-model="v$.name.$model"
                    placeholder="Contoh: tom, rober, rachel_vennya"
                    :state="v$.name.$dirty ? !v$.name.$error : null"
                  />
                  <b-form-invalid-feedback v-if="v$.name.$error">
                    Username / identifier wajib diisi.
                  </b-form-invalid-feedback>
                </b-form-group>
              </b-col>

              <!-- Display Name -->
              <b-col md="6">
                <b-form-group label="Display Name (Nama Lengkap) *" label-for="display_name">
                  <b-form-input
                    id="display_name"
                    v-model="v$.display_name.$model"
                    placeholder="Contoh: Tom Holland, Rachel Vennya"
                    :state="v$.display_name.$dirty ? !v$.display_name.$error : null"
                  />
                  <b-form-invalid-feedback v-if="v$.display_name.$error">
                    Display name wajib diisi.
                  </b-form-invalid-feedback>
                </b-form-group>
              </b-col>

              <!-- Entity Type -->
              <b-col md="4">
                <b-form-group label="Tipe Entitas *" label-for="entity_type">
                  <b-form-select
                    id="entity_type"
                    v-model="v$.entity_type.$model"
                    :state="v$.entity_type.$dirty ? !v$.entity_type.$error : null"
                  >
                    <b-form-select-option value="individual">Individual</b-form-select-option>
                    <b-form-select-option value="agency">Agency</b-form-select-option>
                    <b-form-select-option value="brand">Brand</b-form-select-option>
                    <b-form-select-option value="community">Community</b-form-select-option>
                  </b-form-select>
                </b-form-group>
              </b-col>

              <!-- Status -->
              <b-col md="4">
                <b-form-group label="Status *" label-for="status">
                  <b-form-select
                    id="status"
                    v-model="v$.status.$model"
                    :state="v$.status.$dirty ? !v$.status.$error : null"
                  >
                    <b-form-select-option value="prospect">Prospect</b-form-select-option>
                    <b-form-select-option value="active">Active</b-form-select-option>
                    <b-form-select-option value="inactive">Inactive</b-form-select-option>
                  </b-form-select>
                </b-form-group>
              </b-col>

              <!-- Source -->
              <b-col md="4">
                <b-form-group label="Source" label-for="source">
                  <b-form-input
                    id="source"
                    v-model="formState.source"
                    placeholder="Contoh: admin, outreach, referral"
                  />
                </b-form-group>
              </b-col>

              <!-- Email -->
              <b-col md="6">
                <b-form-group label="Email" label-for="email">
                  <b-form-input
                    id="email"
                    v-model="formState.email"
                    type="email"
                    placeholder="influencer@example.com"
                  />
                </b-form-group>
              </b-col>

              <!-- Phone -->
              <b-col md="6">
                <b-form-group label="No. Telepon / WhatsApp" label-for="phone">
                  <b-form-input
                    id="phone"
                    v-model="formState.phone"
                    placeholder="Contoh: 081234567890"
                  />
                </b-form-group>
              </b-col>

              <!-- Niche -->
              <b-col md="4">
                <b-form-group label="Niche / Kategori" label-for="niche">
                  <b-form-input
                    id="niche"
                    v-model="formState.niche"
                    placeholder="Contoh: Fashion, Tech, Dakwah, Kuliner"
                  />
                </b-form-group>
              </b-col>

              <!-- City -->
              <b-col md="4">
                <b-form-group label="Kota" label-for="city">
                  <b-form-input
                    id="city"
                    v-model="formState.city"
                    placeholder="Contoh: Solo, Jakarta, Surabaya"
                  />
                </b-form-group>
              </b-col>

              <!-- Country -->
              <b-col md="4">
                <b-form-group label="Negara" label-for="country">
                  <b-form-input
                    id="country"
                    v-model="formState.country"
                    placeholder="Contoh: Indonesia"
                  />
                </b-form-group>
              </b-col>

              <!-- Notes -->
              <b-col cols="12">
                <b-form-group label="Catatan Tambahan" label-for="notes">
                  <b-form-textarea
                    id="notes"
                    v-model="formState.notes"
                    rows="3"
                    placeholder="Catatan mengenai influencer, rate card, atau PIC komunikasi..."
                  />
                </b-form-group>
              </b-col>

              <!-- Action Buttons -->
              <b-col cols="12" class="d-flex justify-content-end gap-2 mt-4">
                <b-button variant="outline-secondary" @click="router.back()">
                  Batal
                </b-button>
                <b-button variant="primary" type="submit" :disabled="isPending">
                  <b-spinner v-if="isPending" small class="me-1" />
                  Simpan Influencer
                </b-button>
              </b-col>
            </b-row>
          </b-form>
        </UIComponentCard>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { createInfluencer } from "@/services/influencerService";

const router = useRouter();
const queryClient = useQueryClient();

const formState = reactive({
  name: "",
  display_name: "",
  entity_type: "individual",
  status: "prospect",
  source: "admin",
  email: "",
  phone: "",
  niche: "",
  city: "",
  country: "Indonesia",
  notes: "",
});

const rules = {
  name: { required },
  display_name: { required },
  entity_type: { required },
  status: { required },
};

const v$ = useVuelidate(rules, formState);

const { mutate, isPending } = useMutation({
  mutationFn: (payload: any) => createInfluencer(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["influencers"] });
    toast.success("Influencer berhasil ditambahkan", { position: "top-center" });
    router.push("/influencers");
  },
  onError: (err: any) => {
    toast.error(err?.response?.data?.message || "Gagal menambahkan influencer", {
      position: "top-center",
    });
  },
});

const handleSubmit = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;
  mutate(formState);
};
</script>
