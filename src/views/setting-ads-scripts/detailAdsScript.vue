<template>
  <VerticalLayout>
    <b-row>
      <b-col>
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0">Detail Ads Script</h4>
          <div class="d-flex gap-2">
            <b-button
              :variant="showUnmasked ? 'warning' : 'outline-secondary'"
              size="sm"
              :disabled="isLoading"
              @click="toggleUnmask"
            >
              <i
                :class="showUnmasked ? 'bx bx-hide' : 'bx bx-show'"
                class="me-1"
              ></i>
              {{ showUnmasked ? "Sembunyikan Token" : "Tampilkan Token" }}
            </b-button>
            <b-button
              variant="warning"
              size="sm"
              @click="router.push(`/ads-scripts/${scriptId}/edit`)"
            >
              <i class="bx bx-edit me-1"></i>Edit
            </b-button>
            <b-button
              variant="secondary"
              size="sm"
              @click="router.push('/ads-scripts')"
            >
              <i class="bx bx-arrow-back me-1"></i>Kembali
            </b-button>
          </div>
        </div>

        <div v-if="isLoading" class="text-center p-5">
          <b-spinner variant="primary" />
          <p class="mt-2">Memuat data...</p>
        </div>

        <div v-else-if="!scriptData" class="alert alert-warning">
          Data ads script tidak ditemukan.
        </div>

        <template v-else>
          <!-- Info Dasar -->
          <UIComponentCard title="Info Dasar" class="mb-3">
            <b-row class="g-3">
              <b-col md="3">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">ID</span>
                  <span class="fw-bold fs-5">{{ scriptData.id }}</span>
                </div>
              </b-col>

              <b-col md="5">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Nama</span>
                  <span class="fw-semibold">{{ scriptData.name ?? "-" }}</span>
                </div>
              </b-col>

              <b-col md="4">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Tipe</span>
                  <span>
                    <b-badge :class="typeBadge(scriptData.type)">
                      {{ typeLabel(scriptData.type) }}
                    </b-badge>
                  </span>
                </div>
              </b-col>

              <b-col md="6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Script ID</span>
                  <span class="font-monospace">
                    {{ scriptData.script_id ?? "-" }}
                  </span>
                </div>
              </b-col>

              <b-col md="6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Web / Domain</span>
                  <span class="text-primary">{{ scriptData.web ?? "-" }}</span>
                </div>
              </b-col>

              <b-col md="6" v-if="scriptData.test_code">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Test Code</span>
                  <span class="font-monospace">{{ scriptData.test_code }}</span>
                </div>
              </b-col>

              <b-col md="6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Dibuat</span>
                  <span class="small">{{ formatDate(scriptData.created_at) }}</span>
                </div>
              </b-col>

              <b-col md="6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Diperbarui</span>
                  <span class="small">{{ formatDate(scriptData.updated_at) }}</span>
                </div>
              </b-col>

              <b-col md="12" v-if="scriptData.script_token">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Script Token</span>
                  <div
                    class="p-2 rounded bg-light font-monospace small text-break"
                    style="word-break: break-all; max-height: 100px; overflow-y: auto"
                  >
                    {{ scriptData.script_token }}
                  </div>
                </div>
              </b-col>
            </b-row>
          </UIComponentCard>

          <!-- Google Ads Config -->
          <UIComponentCard
            v-if="hasGoogleConfig"
            title="Konfigurasi Google Ads"
            class="mb-3"
          >
            <b-row class="g-3">
              <b-col md="6" v-if="scriptData.google_customer_id">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Customer ID</span>
                  <span class="font-monospace">
                    {{ scriptData.google_customer_id }}
                  </span>
                </div>
              </b-col>

              <b-col md="6" v-if="scriptData.google_login_customer_id">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold"
                    >Login Customer ID</span
                  >
                  <span class="font-monospace">
                    {{ scriptData.google_login_customer_id }}
                  </span>
                </div>
              </b-col>

              <b-col md="6" v-if="scriptData.google_developer_token">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold"
                    >Developer Token</span
                  >
                  <span class="font-monospace small text-break">
                    {{ scriptData.google_developer_token }}
                  </span>
                </div>
              </b-col>

              <b-col md="6" v-if="scriptData.google_client_id">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Client ID</span>
                  <span class="font-monospace small text-break">
                    {{ scriptData.google_client_id }}
                  </span>
                </div>
              </b-col>

              <b-col md="6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Client Secret</span>
                  <span class="font-monospace small">
                    {{ scriptData.google_client_secret || "********" }}
                  </span>
                </div>
              </b-col>

              <b-col md="6">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Refresh Token</span>
                  <span class="font-monospace small">
                    {{ scriptData.google_refresh_token || "********" }}
                  </span>
                </div>
              </b-col>
            </b-row>
          </UIComponentCard>

          <!-- Conversion Actions -->
          <UIComponentCard
            v-if="hasConversionConfig"
            title="Conversion Actions"
            class="mb-3"
          >
            <b-row class="g-3">
              <b-col md="6" v-if="scriptData.conversion_action_purchase">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Purchase</span>
                  <span class="font-monospace small">
                    {{ scriptData.conversion_action_purchase }}
                  </span>
                </div>
              </b-col>

              <b-col md="6" v-if="scriptData.conversion_action_checkout">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Checkout</span>
                  <span class="font-monospace small">
                    {{ scriptData.conversion_action_checkout }}
                  </span>
                </div>
              </b-col>

              <b-col md="6" v-if="scriptData.conversion_action_add_cart">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Add to Cart</span>
                  <span class="font-monospace small">
                    {{ scriptData.conversion_action_add_cart }}
                  </span>
                </div>
              </b-col>

              <b-col md="6" v-if="scriptData.conversion_action_registration">
                <div class="d-flex flex-column gap-1">
                  <span class="text-muted small fw-semibold">Registration</span>
                  <span class="font-monospace small">
                    {{ scriptData.conversion_action_registration }}
                  </span>
                </div>
              </b-col>
            </b-row>
          </UIComponentCard>
        </template>
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuery } from "@tanstack/vue-query";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import UIComponentCard from "@/components/UIComponentCard.vue";
import { getAdsScriptById } from "@/services/adsScriptService";

const route = useRoute();
const router = useRouter();
const scriptId = Number(route.params.id);
const showUnmasked = ref(false);

const { data: scriptData, isLoading, refetch } = useQuery({
  queryKey: ["ads-scripts", scriptId, showUnmasked],
  queryFn: () => getAdsScriptById(scriptId, showUnmasked.value),
  enabled: !!scriptId,
});

const toggleUnmask = () => {
  showUnmasked.value = !showUnmasked.value;
  refetch();
};

const TYPE_BADGE: Record<string, string> = {
  google: "bg-danger",
  meta: "bg-primary",
  tiktok: "bg-dark",
  fb_pixel: "bg-primary",
};

const TYPE_LABEL: Record<string, string> = {
  google: "Google",
  meta: "Meta",
  tiktok: "TikTok",
  fb_pixel: "FB Pixel",
};

const typeBadge = (type: string) => TYPE_BADGE[type] ?? "bg-secondary";
const typeLabel = (type: string) => TYPE_LABEL[type] ?? type ?? "-";

const hasGoogleConfig = computed(() => {
  const d = scriptData.value;
  return !!(
    d?.google_customer_id ||
    d?.google_login_customer_id ||
    d?.google_developer_token ||
    d?.google_client_id ||
    d?.google_client_secret ||
    d?.google_refresh_token
  );
});

const hasConversionConfig = computed(() => {
  const d = scriptData.value;
  return !!(
    d?.conversion_action_purchase ||
    d?.conversion_action_checkout ||
    d?.conversion_action_add_cart ||
    d?.conversion_action_registration
  );
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
