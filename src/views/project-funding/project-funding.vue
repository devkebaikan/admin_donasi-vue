<template>
  <VerticalLayout>
    <!-- Header -->
    <div
      class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4"
    >
      <div>
        <h4 class="fw-bold mb-1">Funding {{ finance.project_name }}</h4>
        <p class="text-muted mb-0 small">
          Alokasikan donasi untuk menutupi kekurangan dana proyek
        </p>
      </div>
    </div>

    <!-- Financial Summary -->
    <b-card class="mb-3" body-class="p-0">
      <b-row class="g-0 text-center text-md-start">
        <b-col cols="6" md="4" class="p-3 border-end border-bottom">
          <div class="small text-muted mb-1">Nominal Proyek</div>
          <div class="fs-5 fw-semibold">
            {{ formatCurrency(finance.nominal_proyek) }}
          </div>
        </b-col>
        <b-col cols="6" md="4" class="p-3 border-end border-bottom">
          <div class="small text-muted mb-1">Terkumpul</div>
          <div class="fs-5 fw-semibold text-success">
            {{ formatCurrency(finance.nominal_terkumpul) }}
          </div>
        </b-col>
        <b-col cols="6" md="4" class="p-3 border-bottom">
          <div class="small text-muted mb-1">Kekurangan Dana</div>
          <div class="fs-5 fw-semibold text-danger">
            {{ formatCurrency(kekuranganDana) }}
          </div>
        </b-col>
        <b-col cols="6" md="4" class="p-3 border-end">
          <div class="small text-muted mb-1">Saldo Sebelumnya</div>
          <div class="fs-5 fw-semibold">
            {{ formatCurrency(finance.sisa_saldo_sebelumnya) }}
          </div>
        </b-col>
        <b-col cols="6" md="4" class="p-3 border-end">
          <div class="small text-muted mb-1">Dicairkan ke Mitra</div>
          <div class="fs-5 fw-semibold">
            {{ formatCurrency(finance.dana_dicairkan) }}
          </div>
        </b-col>
        <b-col cols="6" md="4" class="p-3">
          <div class="small text-muted mb-1">Belum Dicairkan</div>
          <div class="fs-5 fw-semibold text-warning">
            {{ formatCurrency(danaBelumDicairkan) }}
          </div>
        </b-col>
      </b-row>
    </b-card>

    <!-- Allocation controls -->
    <b-card class="mb-3">
      <b-row class="g-4 align-items-center">
        <b-col cols="12" md="4">
          <label class="form-label fw-semibold small text-muted mb-1">
            Pakai Saldo Sebelumnya
          </label>
          <b-input-group>
            <b-form-input
              v-model.number="saldoPakai"
              type="number"
              placeholder="0"
              :max="finance.sisa_saldo_sebelumnya"
              min="0"
            />
            <b-button variant="outline-secondary" @click="pakaiSaldoMax">
              Max
            </b-button>
          </b-input-group>
          <small class="text-muted">
            Tersedia {{ formatCurrency(finance.sisa_saldo_sebelumnya) }}
          </small>
        </b-col>

        <b-col cols="12" md="5">
          <div class="d-flex justify-content-between mb-2">
            <span class="small fw-semibold text-muted"
              >Cakupan Kekurangan Dana</span
            >
            <span
              class="small fw-bold"
              :class="coveragePercent >= 100 ? 'text-success' : 'text-body'"
            >
              {{ formatCurrency(totalAlokasi) }}
              <span class="fw-normal text-muted">
                ({{ coveragePercent.toFixed(1) }}%)
              </span>
            </span>
          </div>
          <b-progress
            :max="kekuranganDana || 1"
            height="8px"
            class="rounded-pill"
          >
            <b-progress-bar
              :value="Math.min(totalAlokasi, kekuranganDana || 1)"
              :variant="coveragePercent >= 100 ? 'success' : 'primary'"
            />
          </b-progress>
          <div class="mt-2">
            <small
              :class="
                coveragePercent >= 100
                  ? 'text-success fw-semibold'
                  : 'text-muted'
              "
            >
              {{
                coveragePercent >= 100
                  ? "Kekurangan dana terpenuhi"
                  : `Masih kurang ${formatCurrency(Math.max(0, kekuranganDana - totalAlokasi))}`
              }}
            </small>
          </div>
        </b-col>

        <b-col cols="12" md="3" class="d-flex flex-column gap-2">
          <b-button
            variant="outline-primary"
            @click="doAutoCheck"
            :disabled="!transactions.length || isLoading"
          >
            Auto Centang
          </b-button>
          <b-button
            variant="primary"
            :disabled="(!checkedIds.size && !saldoPakai) || isAllocating"
            @click="handleAlokasikan"
          >
            <b-spinner v-if="isAllocating" small class="me-1" />
            Alokasikan
          </b-button>
        </b-col>
      </b-row>
    </b-card>

    <!-- Donor Table -->
    <b-card no-body>
      <template #header>
        <div class="p-3 pb-0">
          <b-row class="g-3 mb-3">
            <b-col cols="12" md="4">
              <label class="form-label fw-semibold small text-muted mb-1">
                Pilih Program
              </label>
              <b-form-select
                v-model="selectedProgramId"
                :disabled="isProjectLoading || !programs.length"
                @change="onProgramChange"
              >
                <b-form-select-option :value="0" disabled>
                  {{ isProjectLoading ? "Memuat program..." : "Pilih program" }}
                </b-form-select-option>
                <b-form-select-option
                  v-for="p in programs"
                  :key="p.id"
                  :value="p.program_id"
                >
                  {{ p.program_name }}
                </b-form-select-option>
              </b-form-select>
              <small v-if="selectedProgramId !== 0" class="text-muted">
                Yang bisa diclaim
                <span class="fw-semibold text-success">{{
                  formatCurrency(canClaim)
                }}</span>
              </small>
            </b-col>
          </b-row>
          <b-row class="g-3 mb-3">
            <b-col cols="12" md="4">
              <b-input-group prepend="Rp">
                <CurrencyInput
                  id="nominal-claim"
                  placeholder="0"
                  v-model="nominalClaim"
                  :state="null"
                />
              </b-input-group>
            </b-col>
            <b-col>
              <b-button @click="handleLihatDonatur" :disabled="isLoading">
                <b-spinner v-if="isLoading" small class="me-1" />
                Lihat Donatur
              </b-button>
            </b-col>
          </b-row>
        </div>
        <div
          class="d-flex align-items-center justify-content-between flex-wrap gap-2 px-3 pb-3"
        >
          <h6 class="mb-0 fw-semibold text-muted">
            Daftar Donatur
            <span class="text-body">{{ transactions.length }}</span>
          </h6>

          <div class="d-flex align-items-center gap-2">
            <span v-if="checkedIds.size" class="small text-success fw-semibold">
              {{ checkedIds.size }} dipilih ·
              {{ formatCurrency(nominalTercentang) }}
            </span>
            <b-button
              v-if="checkedIds.size"
              size="sm"
              variant="link"
              class="text-danger p-0"
              @click="clearAll"
            >
              Reset
            </b-button>
          </div>
        </div>
      </template>

      <div v-if="isLoading" class="text-center py-5">
        <b-spinner variant="primary" style="width: 2rem; height: 2rem" />
        <p class="mt-3 text-muted small">Memuat data donatur...</p>
      </div>

      <div v-else-if="!transactions.length" class="text-center py-5">
        <p class="text-muted small mb-0">Belum ada donasi untuk program ini.</p>
      </div>

      <template v-else>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 44px" class="text-center">
                  <b-form-checkbox
                    :model-value="isAllChecked"
                    :indeterminate="isIndeterminate"
                    @change="toggleAll"
                  />
                </th>
                <th class="text-muted small">Donatur</th>
                <th class="text-muted small text-end">Nominal</th>
                <th class="text-muted small">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="trx in transactions"
                :key="trx.id"
                :class="{ 'table-success': checkedIds.has(trx.id) }"
                role="button"
                @click="toggleCheck(trx.id)"
              >
                <td class="text-center" @click.stop>
                  <b-form-checkbox
                    :model-value="checkedIds.has(trx.id)"
                    @change="toggleCheck(trx.id)"
                  />
                </td>
                <td>
                  <div class="fw-medium small">{{ trx.owner }}</div>
                  <div v-if="trx.phone" class="text-muted small">
                    {{ trx.phone }}
                  </div>
                </td>
                <td class="text-end">
                  <span class="fw-semibold small">{{
                    formatCurrency(trx.nominal)
                  }}</span>
                </td>
                <td class="small text-muted">{{ formatDate(trx.date) }}</td>
              </tr>
            </tbody>
            <tfoot class="table-light">
              <tr>
                <td colspan="2" class="text-end fw-semibold small text-muted">
                  Total Dipilih ({{ checkedIds.size }})
                </td>
                <td class="text-end fw-bold small">
                  {{ formatCurrency(nominalTercentang) }}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </template>
    </b-card>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { useRoute } from "vue-router";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import { getProjectById } from "@/services/projectService";
import {
  checkFundingProject,
  getClaimableDonationsByProjectId,
  claimFunding,
} from "@/services/fundingService";
import { formatCurrency, formatDate } from "@/helpers/format";
import { toast as showToast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const route = useRoute();
const queryClient = useQueryClient();
const projectId = Number(route.params.id);

// State
const selectedProgramId = ref<number>(0);
const checkedIds = ref<Set<number>>(new Set());
const saldoPakai = ref<number>(0);
const nominalClaim = ref<number>(0);
const canClaim = computed(() => {
  const program = programs.value.find(
    (p) => p.program_id === selectedProgramId.value,
  );
  return program?.can_claim ?? 0;
});

// Project detail — provides related programs + project nominal
const { data: projectDetail, isLoading: isProjectLoading } = useQuery({
  queryKey: ["project-detail", projectId],
  queryFn: () => getProjectById(projectId),
});

// Fund check — project-level allocation summary
const { data: fundCheck, isLoading: isFundCheckLoading } = useQuery({
  queryKey: ["fund-check", projectId],
  queryFn: () => checkFundingProject(projectId),
});

const programs = computed<any[]>(() => fundCheck.value?.breakdown ?? []);

watch(programs, (list) => {
  if (
    list.length &&
    !list.some((p) => p.program_id === selectedProgramId.value)
  ) {
    selectedProgramId.value = list[0].program_id;
  }
});

const finance = computed(() => ({
  nominal_proyek:
    projectDetail.value?.nominal_acc || projectDetail.value?.nominal_ajuan || 0,
  nominal_terkumpul: fundCheck.value?.total_allocated ?? 0,
  sisa_saldo_sebelumnya: fundCheck.value?.available_amount ?? 0,
  dana_dicairkan: fundCheck.value?.total_disbursed ?? 0,
  project_name: fundCheck.value?.project_name ?? "Proyek",
}));

const kekuranganDana = computed(() =>
  Math.max(0, finance.value.nominal_proyek - finance.value.nominal_terkumpul),
);

const danaBelumDicairkan = computed(() =>
  Math.max(0, finance.value.nominal_terkumpul - finance.value.dana_dicairkan),
);

// Claimable donations for the selected program

type Trx = {
  id: number;
  owner: string;
  phone: string;
  nominal: number;
  date: string;
};

const {
  data: claimableData,
  isLoading,
  refetch: fetchClaimableDonations,
} = useQuery({
  queryKey: computed(() => [
    "claimable-donations",
    projectId,
    selectedProgramId.value,
    kekuranganDana.value,
  ]),
  queryFn: () =>
    getClaimableDonationsByProjectId(projectId, {
      programs: [
        { program_id: selectedProgramId.value, nominal: nominalClaim.value },
      ],
    }),
  enabled: false,
});

const handleLihatDonatur = async () => {
  if (!selectedProgramId.value) {
    showToast("Pilih program terlebih dahulu.", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  if (!nominalClaim.value || nominalClaim.value <= 0) {
    showToast("Masukkan nominal terlebih dahulu.", {
      type: "warning",
      position: "top-center",
    });
    return;
  }

  checkedIds.value = new Set();

  await fetchClaimableDonations();
};

const transactions = computed<Trx[]>(() => {
  const donations: any[] = claimableData.value?.programs?.[0]?.donations ?? [];
  return donations.map((d) => ({
    id: d.id,
    owner: d.user?.name ?? d.owner_name ?? d.donor_name ?? "Hamba Allah",
    phone: d.user?.phone ?? d.phone ?? d.donor_phone ?? "",
    nominal: Number(d.nominal ?? d.amount ?? d.total ?? 0),
    date: d.date ?? d.created_at ?? "",
  }));
});

// Financial computations
const nominalTercentang = computed(() =>
  transactions.value
    .filter((t) => checkedIds.value.has(t.id))
    .reduce((sum, t) => sum + t.nominal, 0),
);

const totalAlokasi = computed(
  () => nominalTercentang.value + (saldoPakai.value || 0),
);

const coveragePercent = computed(() => {
  if (!kekuranganDana.value) return 100;
  return Math.min(100, (totalAlokasi.value / kekuranganDana.value) * 100);
});

// Checkbox helpers
const isAllChecked = computed(
  () =>
    transactions.value.length > 0 &&
    transactions.value.every((t) => checkedIds.value.has(t.id)),
);

const isIndeterminate = computed(
  () => checkedIds.value.size > 0 && !isAllChecked.value,
);

const toggleCheck = (id: number) => {
  const next = new Set(checkedIds.value);
  next.has(id) ? next.delete(id) : next.add(id);
  checkedIds.value = next;
};

const toggleAll = () => {
  checkedIds.value = isAllChecked.value
    ? new Set()
    : new Set(transactions.value.map((t) => t.id));
};

const clearAll = () => {
  checkedIds.value = new Set();
};

// Actions
const pakaiSaldoMax = () => {
  saldoPakai.value = finance.value.sisa_saldo_sebelumnya;
};

const doAutoCheck = () => {
  const target = kekuranganDana.value - (saldoPakai.value || 0);
  if (target <= 0) {
    checkedIds.value = new Set();
    showToast("Saldo sebelumnya sudah mencukupi kekurangan dana.", {
      type: "info",
      position: "top-center",
    });
    return;
  }

  let running = 0;
  const next = new Set<number>();
  for (const trx of transactions.value) {
    if (running >= target) break;
    next.add(trx.id);
    running += trx.nominal;
  }

  checkedIds.value = next;
  showToast(
    `Auto centang: ${next.size} donasi dipilih (${formatCurrency(running)})`,
    { type: "info", position: "top-center" },
  );
};

const onProgramChange = () => {
  checkedIds.value = new Set();
  saldoPakai.value = 0;
  nominalClaim.value = 0;
};

const { mutate: mutateClaim, isPending: isAllocating } = useMutation({
  mutationFn: () =>
    claimFunding(projectId, {
      programs: [
        {
          program_id: selectedProgramId.value,
          donation_ids: Array.from(checkedIds.value),
        },
      ],
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["fund-check", projectId] });
    queryClient.invalidateQueries({ queryKey: ["claimable-donations"] });
    showToast(
      `Berhasil mengalokasikan ${formatCurrency(totalAlokasi.value)} (${checkedIds.value.size} donasi)`,
      { type: "success", position: "top-center" },
    );
    checkedIds.value = new Set();
    saldoPakai.value = 0;
  },
  onError: (err: any) => {
    showToast(err?.response?.data?.message ?? "Gagal mengalokasikan dana", {
      type: "error",
      position: "top-center",
    });
  },
});

const handleAlokasikan = () => {
  if (!checkedIds.value.size) {
    showToast("Pilih minimal satu donasi untuk dialokasikan.", {
      type: "warning",
      position: "top-center",
    });
    return;
  }
  mutateClaim();
};
</script>
