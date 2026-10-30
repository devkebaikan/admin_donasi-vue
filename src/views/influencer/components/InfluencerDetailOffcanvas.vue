<template>
  <b-offcanvas
    :model-value="modelValue"
    title="Detail Influencer"
    placement="end"
    style="width: 580px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center p-5">
      <b-spinner variant="primary" />
      <p class="mt-2 text-muted">Memuat detail influencer...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="!profile" class="alert alert-warning">
      Data influencer tidak ditemukan.
    </div>

    <!-- Detail Content -->
    <div v-else>
      <!-- Header Profile Card -->
      <div class="card border mb-3 bg-light-subtle">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="card-title mb-1 text-primary">
                {{ profile.display_name || profile.name }}
              </h5>
              <div class="text-muted small">@{{ profile.name }}</div>
            </div>
            <span :class="['badge', getStatusBadge(profile.status)]">
              {{ profile.status }}
            </span>
          </div>

          <hr class="my-2" />

          <b-row class="g-2 small">
            <b-col cols="6">
              <span class="text-muted">Tipe:</span>
              <strong class="text-capitalize ms-1">{{ profile.entity_type || "-" }}</strong>
            </b-col>
            <b-col cols="6">
              <span class="text-muted">Niche:</span>
              <strong class="ms-1">{{ profile.niche || "-" }}</strong>
            </b-col>
            <b-col cols="6">
              <span class="text-muted">Email:</span>
              <strong class="ms-1">{{ profile.email || "-" }}</strong>
            </b-col>
            <b-col cols="6">
              <span class="text-muted">No. Telp:</span>
              <strong class="ms-1">{{ profile.phone || "-" }}</strong>
            </b-col>
            <b-col cols="12">
              <span class="text-muted">Lokasi:</span>
              <strong class="ms-1">
                {{ [profile.city, profile.country].filter(Boolean).join(", ") || "-" }}
              </strong>
            </b-col>
            <b-col v-if="profile.notes" cols="12">
              <span class="text-muted">Catatan:</span>
              <p class="mb-0 text-secondary bg-white p-2 rounded border mt-1">
                {{ profile.notes }}
              </p>
            </b-col>
          </b-row>
        </div>
      </div>

      <!-- Social Media Accounts Section -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="mb-0 fw-bold">
          <i class="bx bxl-instagram-alt text-primary me-1"></i>Akun Media Sosial
        </h6>
        <b-button
          size="sm"
          variant="outline-primary"
          @click="showAddAccountForm = !showAddAccountForm"
        >
          <i class="bx bx-plus me-1"></i>
          {{ showAddAccountForm ? "Tutup Form" : "Tambah Akun" }}
        </b-button>
      </div>

      <!-- Form Tambah / Edit Akun Sosial -->
      <b-collapse v-model="showAddAccountForm" class="mb-3">
        <div class="card border border-primary p-3 bg-white">
          <h6 class="small fw-bold mb-2">
            {{ editingAccountId ? "Edit Akun Sosial" : "Tambah Akun Sosial Baru" }}
          </h6>
          <b-form @submit.prevent="handleSaveSocialAccount">
            <b-row class="g-2">
              <b-col cols="6">
                <label class="form-label small fw-semibold">Platform *</label>
                <b-form-select v-model="accountForm.platform" size="sm" required>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="x">X / Twitter</option>
                  <option value="facebook">Facebook</option>
                  <option value="other">Lainnya</option>
                </b-form-select>
              </b-col>
              <b-col cols="6">
                <label class="form-label small fw-semibold">Handle/Username *</label>
                <b-form-input
                  v-model="accountForm.handle"
                  size="sm"
                  placeholder="@username"
                  required
                />
              </b-col>
              <b-col cols="12">
                <label class="form-label small fw-semibold">URL Profil</label>
                <b-form-input
                  v-model="accountForm.profile_url"
                  size="sm"
                  type="url"
                  placeholder="https://..."
                />
              </b-col>
              <b-col cols="6">
                <label class="form-label small fw-semibold">Followers</label>
                <b-form-input
                  v-model.number="accountForm.follower_count"
                  type="number"
                  size="sm"
                  min="0"
                />
              </b-col>
              <b-col cols="6" class="d-flex align-items-center mt-4">
                <b-form-checkbox v-model="accountForm.is_primary">
                  Akun Utama
                </b-form-checkbox>
              </b-col>
              <b-col cols="12" class="d-flex justify-content-end gap-2 mt-2">
                <b-button size="sm" variant="light" @click="resetAccountForm">
                  Batal
                </b-button>
                <b-button
                  size="sm"
                  variant="primary"
                  type="submit"
                  :disabled="isSubmittingAccount"
                >
                  <b-spinner v-if="isSubmittingAccount" small class="me-1" />
                  Simpan
                </b-button>
              </b-col>
            </b-row>
          </b-form>
        </div>
      </b-collapse>

      <!-- List Akun Sosial -->
      <div v-if="isLoadingSocial" class="text-center py-3">
        <b-spinner small variant="primary" />
        <span class="ms-2 text-muted small">Memuat akun sosial...</span>
      </div>

      <div v-else-if="socialAccounts.length === 0" class="text-center py-4 text-muted border rounded bg-light">
        <i class="bx bx-share-alt fs-24 mb-1 d-block"></i>
        Belum ada akun sosial yang terhubung.
      </div>

      <div v-else class="d-flex flex-column gap-2">
        <div
          v-for="acc in socialAccounts"
          :key="acc.id"
          class="p-2 border rounded d-flex justify-content-between align-items-center bg-white"
        >
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-sm bg-light rounded p-2 text-center text-primary">
              <i class="bx bx-globe fs-20"></i>
            </div>
            <div>
              <div class="fw-semibold small">
                {{ acc.handle }}
                <b-badge v-if="acc.is_primary" variant="primary" class="ms-1" style="font-size: 10px;">
                  Utama
                </b-badge>
              </div>
              <div class="text-muted" style="font-size: 11px;">
                <span class="text-capitalize fw-semibold">{{ acc.platform }}</span> •
                {{ Number(acc.follower_count || 0).toLocaleString() }} followers
              </div>
            </div>
          </div>

          <div class="d-flex align-items-center gap-1">
            <a
              v-if="acc.profile_url"
              :href="acc.profile_url"
              target="_blank"
              class="btn btn-sm btn-light"
              title="Buka Profil"
            >
              <i class="bx bx-link-external"></i>
            </a>
            <button
              class="btn btn-sm btn-soft-warning"
              title="Edit Akun"
              @click="handleEditAccount(acc)"
            >
              <i class="bx bx-edit"></i>
            </button>
            <button
              class="btn btn-sm btn-soft-danger"
              title="Hapus Akun"
              @click="handleDeleteAccount(acc.id)"
            >
              <i class="bx bx-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </b-offcanvas>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue3-toastify";
import Swal from "sweetalert2/dist/sweetalert2.js";
import {
  getInfluencerById,
  getInfluencerSocialAccounts,
  createInfluencerSocialAccount,
  updateInfluencerSocialAccount,
  deleteInfluencerSocialAccount,
  type InfluencerProfile,
  type InfluencerSocialAccount,
} from "@/services/influencerService";

const props = defineProps<{
  modelValue: boolean;
  influencerId: number | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
}>();

const queryClient = useQueryClient();
const showAddAccountForm = ref(false);
const editingAccountId = ref<number | null>(null);

const accountForm = reactive({
  platform: "instagram",
  handle: "",
  profile_url: "",
  follower_count: 0,
  is_primary: false,
});

// Query detail influencer
const { data: profile, isLoading } = useQuery<InfluencerProfile | null>({
  queryKey: ["influencer-detail", () => props.influencerId],
  queryFn: () => (props.influencerId ? getInfluencerById(props.influencerId) : null),
  enabled: () => !!props.influencerId && props.modelValue,
});

// Query list akun sosial
const { data: socialAccountsData, isLoading: isLoadingSocial } = useQuery<InfluencerSocialAccount[]>({
  queryKey: ["influencer-social-accounts", () => props.influencerId],
  queryFn: () => (props.influencerId ? getInfluencerSocialAccounts(props.influencerId) : []),
  enabled: () => !!props.influencerId && props.modelValue,
});

const socialAccounts = ref<InfluencerSocialAccount[]>([]);

watch(socialAccountsData, (newVal) => {
  socialAccounts.value = newVal || [];
}, { immediate: true });

const getStatusBadge = (status: string) => {
  if (status === "active") return "bg-success";
  if (status === "prospect") return "bg-warning text-dark";
  return "bg-secondary";
};

const resetAccountForm = () => {
  editingAccountId.value = null;
  accountForm.platform = "instagram";
  accountForm.handle = "";
  accountForm.profile_url = "";
  accountForm.follower_count = 0;
  accountForm.is_primary = false;
  showAddAccountForm.value = false;
};

const handleEditAccount = (acc: InfluencerSocialAccount) => {
  editingAccountId.value = acc.id;
  accountForm.platform = acc.platform || "instagram";
  accountForm.handle = acc.handle || "";
  accountForm.profile_url = acc.profile_url || "";
  accountForm.follower_count = acc.follower_count || 0;
  accountForm.is_primary = Boolean(acc.is_primary);
  showAddAccountForm.value = true;
};

// Mutation simpan akun sosial (Create / Update)
const { mutate: saveSocialAccount, isPending: isSubmittingAccount } = useMutation({
  mutationFn: async () => {
    if (!props.influencerId) return;
    const payload = {
      ...accountForm,
      follower_count_checked_at: new Date().toISOString(),
    };
    if (editingAccountId.value) {
      return updateInfluencerSocialAccount(props.influencerId, editingAccountId.value, payload);
    }
    return createInfluencerSocialAccount(props.influencerId, payload);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["influencer-social-accounts", props.influencerId] });
    toast.success(
      editingAccountId.value ? "Akun sosial berhasil diperbarui" : "Akun sosial berhasil ditambahkan",
      { position: "top-center" }
    );
    resetAccountForm();
  },
  onError: (err: any) => {
    toast.error(err?.response?.data?.message || "Gagal menyimpan akun sosial", {
      position: "top-center",
    });
  },
});

const handleSaveSocialAccount = () => {
  saveSocialAccount();
};

const handleDeleteAccount = async (accountId: number) => {
  const result = await Swal.fire({
    title: "Hapus Akun Sosial?",
    text: "Akun sosial ini akan dihapus dari influencer ini.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
  });

  if (result.isConfirmed && props.influencerId) {
    try {
      await deleteInfluencerSocialAccount(props.influencerId, accountId);
      queryClient.invalidateQueries({ queryKey: ["influencer-social-accounts", props.influencerId] });
      toast.success("Akun sosial berhasil dihapus", { position: "top-center" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus akun sosial", {
        position: "top-center",
      });
    }
  }
};
</script>

