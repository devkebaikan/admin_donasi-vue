<template>
  <VerticalLayout>
    <!-- Header + Program Selector -->
    <b-card class="mb-3">
      <b-row class="align-items-center g-3">
        <b-col cols="12" md="6">
          <h4 class="fw-bold mb-1 d-flex align-items-center gap-2">
            <i class="bx bx-donate-heart text-primary fs-4"></i>Pendanaan Proyek
          </h4>
          <p class="text-muted mb-0 small">
            Alokasikan donasi untuk menutupi kekurangan dana proyek
          </p>
        </b-col>
      </b-row>
    </b-card>

    <!-- Financial Summary Cards -->
    <b-row class="g-3 mb-3">
      <b-col cols="12" sm="6" xl="4">
        <div class="fcard fcard-blue">
          <div class="fcard-icon"><i class="bx bx-target-lock"></i></div>
          <div class="fcard-body">
            <div class="fcard-label">Nominal Proyek (CEO)</div>
            <div class="fcard-value">
              {{ formatCurrency(finance.nominal_proyek) }}
            </div>
            <div class="fcard-sub">Target pendanaan proyek</div>
          </div>
        </div>
      </b-col>
      <b-col cols="12" sm="6" xl="4">
        <div class="fcard fcard-green">
          <div class="fcard-icon"><i class="bx bx-collection"></i></div>
          <div class="fcard-body">
            <div class="fcard-label">Nominal Terkumpul</div>
            <div class="fcard-value">
              {{ formatCurrency(finance.nominal_terkumpul) }}
            </div>
            <div class="fcard-sub">Total donasi program ini</div>
          </div>
        </div>
      </b-col>
      <b-col cols="12" sm="6" xl="4">
        <div class="fcard fcard-red">
          <div class="fcard-icon"><i class="bx bx-error-alt"></i></div>
          <div class="fcard-body">
            <div class="fcard-label">Kekurangan Dana Proyek</div>
            <div class="fcard-value">{{ formatCurrency(kekuranganDana) }}</div>
            <div class="fcard-sub">Nominal − Terkumpul</div>
          </div>
        </div>
      </b-col>
      <b-col cols="12" sm="6" xl="4">
        <div class="fcard fcard-cyan">
          <div class="fcard-icon"><i class="bx bx-history"></i></div>
          <div class="fcard-body">
            <div class="fcard-label">Sisa Saldo Proyek Utama</div>
            <div class="fcard-value">
              {{ formatCurrency(finance.sisa_saldo_sebelumnya) }}
            </div>
            <div class="fcard-sub">Pengembalian proyek sebelumnya</div>
          </div>
        </div>
      </b-col>
      <b-col cols="12" sm="6" xl="4">
        <div class="fcard fcard-purple">
          <div class="fcard-icon"><i class="bx bx-transfer-alt"></i></div>
          <div class="fcard-body">
            <div class="fcard-label">Dana Dicairkan ke Mitra</div>
            <div class="fcard-value">
              {{ formatCurrency(finance.dana_dicairkan) }}
            </div>
            <div class="fcard-sub">Sudah dicairkan</div>
          </div>
        </div>
      </b-col>
      <b-col cols="12" sm="6" xl="4">
        <div class="fcard fcard-orange">
          <div class="fcard-icon"><i class="bx bx-wallet"></i></div>
          <div class="fcard-body">
            <div class="fcard-label">Dana Belum Dicairkan</div>
            <div class="fcard-value">
              {{ formatCurrency(danaBelumDicairkan) }}
            </div>
            <div class="fcard-sub">Terkumpul − Dicairkan</div>
          </div>
        </div>
      </b-col>
    </b-row>

    <!-- Saldo Sebelumnya + Progress + Actions -->
    <b-card class="mb-3">
      <b-row class="g-3 align-items-center">
        <!-- Pakai Saldo -->
        <b-col cols="12" md="4">
          <label class="form-label fw-semibold small mb-1">
            <i class="bx bx-history me-1 text-info"></i>Pakai Saldo Sebelumnya
          </label>
          <b-input-group>
            <b-form-input
              v-model.number="saldoPakai"
              type="number"
              placeholder="0"
              :max="finance.sisa_saldo_sebelumnya"
              min="0"
            />
            <b-button variant="outline-info" @click="pakaiSaldoMax"
              >Pakai Max</b-button
            >
          </b-input-group>
          <small class="text-muted">
            Tersedia:
            <strong>{{ formatCurrency(finance.sisa_saldo_sebelumnya) }}</strong>
          </small>
        </b-col>

        <!-- Progress -->
        <b-col cols="12" md="5">
          <div class="d-flex justify-content-between mb-1">
            <span class="small fw-semibold">Cakupan Kekurangan Dana</span>
            <span
              class="small fw-bold"
              :class="coveragePercent >= 100 ? 'text-success' : 'text-primary'"
            >
              {{ formatCurrency(totalAlokasi) }}
              <span class="fw-normal text-muted"
                >({{ coveragePercent.toFixed(1) }}%)</span
              >
            </span>
          </div>
          <b-progress
            :max="kekuranganDana || 1"
            height="14px"
            class="rounded-pill"
          >
            <b-progress-bar
              :value="Math.min(totalAlokasi, kekuranganDana || 1)"
              :variant="
                coveragePercent >= 100
                  ? 'success'
                  : coveragePercent >= 50
                    ? 'primary'
                    : 'warning'
              "
              animated
            />
          </b-progress>
          <div class="d-flex justify-content-between mt-1">
            <small class="text-muted">
              Centang: {{ formatCurrency(nominalTercentang) }} + Saldo:
              {{ formatCurrency(saldoPakai || 0) }}
            </small>
            <small
              :class="
                coveragePercent >= 100
                  ? 'text-success fw-semibold'
                  : 'text-danger'
              "
            >
              {{
                coveragePercent >= 100
                  ? "✓ Kekurangan terpenuhi"
                  : `Masih kurang: ${formatCurrency(Math.max(0, kekuranganDana - totalAlokasi))}`
              }}
            </small>
          </div>
        </b-col>

        <!-- Action Buttons -->
        <b-col cols="12" md="3" class="d-flex flex-column gap-2">
          <b-button
            variant="primary"
            @click="doAutoCheck"
            :disabled="!transactions.length || isLoading"
          >
            <i class="bx bx-magic-wand me-1"></i>Auto Centang
          </b-button>
          <b-button
            variant="success"
            :disabled="(!checkedIds.size && !saldoPakai) || isAllocating"
            @click="handleAlokasikan"
          >
            <b-spinner v-if="isAllocating" small class="me-1" />
            <i v-else class="bx bx-check-double me-1"></i>Alokasikan
          </b-button>
        </b-col>
      </b-row>
    </b-card>

    <!-- Donor Table -->
    <b-card>
      <template #header>
        <b-row class="g-3 mb-3">
          <b-col cols="12" md="4">
            <label class="form-label fw-semibold small mb-1"
              >Pilih Program</label
            >
            <b-form-select
              v-model="selectedProgramId"
              @change="onProgramChange"
            >
              <b-form-select-option
                v-for="p in MOCK_PROGRAMS"
                :key="p.id"
                :value="p.id"
              >
                {{ p.name }}
              </b-form-select-option>
            </b-form-select>
          </b-col>
        </b-row>
        <div
          class="d-flex align-items-center justify-content-between flex-wrap gap-2"
        >
          <h5 class="mb-0 fw-semibold">
            <i class="bx bx-list-check me-1 text-primary"></i>
            Daftar Donatur
            <span class="badge bg-secondary ms-1">{{
              transactions.length
            }}</span>
          </h5>

          <div class="d-flex align-items-center gap-2">
            <span v-if="checkedIds.size" class="badge bg-success py-2 px-3">
              <i class="bx bx-check-circle me-1"></i>
              {{ checkedIds.size }} dipilih &middot;
              {{ formatCurrency(nominalTercentang) }}
            </span>
            <b-button
              v-if="checkedIds.size"
              size="sm"
              variant="outline-danger"
              @click="clearAll"
            >
              <i class="bx bx-x me-1"></i>Reset
            </b-button>
          </div>
        </div>
      </template>

      <div v-if="isLoading" class="text-center py-5">
        <b-spinner variant="primary" style="width: 2.5rem; height: 2.5rem" />
        <p class="mt-2 text-muted">Memuat data donatur...</p>
      </div>

      <div v-else-if="!transactions.length" class="text-center py-5">
        <i
          class="bx bx-inbox d-block mb-2"
          style="font-size: 3rem; color: #adb5bd"
        ></i>
        <p class="text-muted">Belum ada donasi untuk program ini.</p>
      </div>

      <template v-else>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 48px" class="text-center">
                  <b-form-checkbox
                    :model-value="isAllChecked"
                    :indeterminate="isIndeterminate"
                    @change="toggleAll"
                  />
                </th>
                <th style="width: 40px" class="text-muted small">#</th>
                <th class="text-muted small">Donatur</th>
                <th class="text-muted small text-end">Nominal</th>
                <th class="text-muted small">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(trx, idx) in transactions"
                :key="trx.id"
                :class="{ 'table-success': checkedIds.has(trx.id) }"
                style="cursor: pointer"
                @click="toggleCheck(trx.id)"
              >
                <td class="text-center" @click.stop>
                  <b-form-checkbox
                    :model-value="checkedIds.has(trx.id)"
                    @change="toggleCheck(trx.id)"
                  />
                </td>
                <td class="text-muted small">{{ idx + 1 }}</td>
                <td>
                  <div class="fw-semibold small">{{ trx.owner }}</div>
                  <div
                    v-if="trx.phone"
                    class="text-muted"
                    style="font-size: 11px"
                  >
                    {{ trx.phone }}
                  </div>
                </td>
                <td class="text-end">
                  <span class="fw-bold text-success small">{{
                    formatCurrency(trx.nominal)
                  }}</span>
                </td>
                <td class="small text-muted">{{ formatDate(trx.date) }}</td>
              </tr>
            </tbody>
            <tfoot class="table-light">
              <tr>
                <td colspan="3" class="text-end fw-semibold small text-muted">
                  Total Dipilih ({{ checkedIds.size }} donasi):
                </td>
                <td class="text-end fw-bold text-success small">
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
import { ref, computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import { getAllTransactions } from "@/services/transactionService";
import { formatCurrency, formatDate } from "@/helpers/format";
import { toast as showToast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

// ──────────────────────────────────────────────────────────────────────────────
// Mock data — replace with real API responses when backend is ready
// ──────────────────────────────────────────────────────────────────────────────

const MOCK_PROGRAMS = [
  { id: 1, name: "Program Utama" },
  { id: 2, name: "Program Zakat" },
  { id: 3, name: "Program Infak Sedekah" },
];

type FinanceSummary = {
  nominal_proyek: number;
  nominal_terkumpul: number;
  sisa_saldo_sebelumnya: number;
  dana_dicairkan: number;
};

// Project-level financials — same regardless of which program is selected.
// Replace with a real API call when backend is ready.
const PROJECT_FINANCE: FinanceSummary = {
  nominal_proyek: 5_000_000,
  nominal_terkumpul: 2_000_000,
  sisa_saldo_sebelumnya: 100_000,
  dana_dicairkan: 500_000,
};

type MockTrx = {
  id: number;
  owner: string;
  phone: string;
  nominal: number;
  date: string;
};

const MOCK_TRANSACTIONS: Record<number, MockTrx[]> = {
  1: [
    {
      id: 101,
      owner: "Hamba Allah",
      phone: "083895203060",
      nominal: 100_000,
      date: "2026-01-15",
    },
    {
      id: 102,
      owner: "Yoyok Hari Pambudi",
      phone: "085752598259",
      nominal: 75_000,
      date: "2026-01-28",
    },
    {
      id: 103,
      owner: "Siti Aminah",
      phone: "082134567890",
      nominal: 50_000,
      date: "2026-02-10",
    },
    {
      id: 104,
      owner: "Muhammadnurdin",
      phone: "081276431550",
      nominal: 25_000,
      date: "2026-02-25",
    },
    {
      id: 105,
      owner: "Hamba Allah",
      phone: "083895203060",
      nominal: 150_000,
      date: "2026-03-08",
    },
    {
      id: 106,
      owner: "Budi Santoso",
      phone: "089876543210",
      nominal: 200_000,
      date: "2026-04-02",
    },
    {
      id: 107,
      owner: "Ahmad Fauzi",
      phone: "087654321098",
      nominal: 300_000,
      date: "2026-04-20",
    },
    {
      id: 108,
      owner: "Dewi Rahayu",
      phone: "081234567890",
      nominal: 500_000,
      date: "2026-05-10",
    },
    {
      id: 109,
      owner: "Hamba Allah",
      phone: "083895203060",
      nominal: 600_000,
      date: "2026-06-01",
    },
  ],
  2: [
    {
      id: 201,
      owner: "Rizal Mahmud",
      phone: "085678901234",
      nominal: 150_000,
      date: "2026-02-05",
    },
    {
      id: 202,
      owner: "Nurul Hidayah",
      phone: "081345678901",
      nominal: 200_000,
      date: "2026-02-20",
    },
    {
      id: 203,
      owner: "Hamba Allah",
      phone: "083456789012",
      nominal: 300_000,
      date: "2026-03-10",
    },
    {
      id: 204,
      owner: "Agus Priyatno",
      phone: "087234567890",
      nominal: 500_000,
      date: "2026-03-25",
    },
    {
      id: 205,
      owner: "Fitriani",
      phone: "082345678901",
      nominal: 600_000,
      date: "2026-04-08",
    },
    {
      id: 206,
      owner: "Hamba Allah",
      phone: "089012345678",
      nominal: 250_000,
      date: "2026-04-22",
    },
    {
      id: 207,
      owner: "Eko Prasetyo",
      phone: "081456789012",
      nominal: 400_000,
      date: "2026-05-05",
    },
    {
      id: 208,
      owner: "Lestari Wulandari",
      phone: "085901234567",
      nominal: 350_000,
      date: "2026-05-18",
    },
    {
      id: 209,
      owner: "Hamba Allah",
      phone: "082567890123",
      nominal: 450_000,
      date: "2026-06-02",
    },
    {
      id: 210,
      owner: "Dimas Kurniawan",
      phone: "087890123456",
      nominal: 300_000,
      date: "2026-06-15",
    },
  ],
  3: [
    {
      id: 301,
      owner: "Hamba Allah",
      phone: "083901234567",
      nominal: 50_000,
      date: "2026-03-05",
    },
    {
      id: 302,
      owner: "Rahmat Hidayat",
      phone: "081567890123",
      nominal: 100_000,
      date: "2026-03-20",
    },
    {
      id: 303,
      owner: "Sulistyowati",
      phone: "085234567890",
      nominal: 150_000,
      date: "2026-04-10",
    },
    {
      id: 304,
      owner: "Hamba Allah",
      phone: "082890123456",
      nominal: 200_000,
      date: "2026-04-28",
    },
    {
      id: 305,
      owner: "Farid Mustofa",
      phone: "089123456789",
      nominal: 250_000,
      date: "2026-05-15",
    },
    {
      id: 306,
      owner: "Hamba Allah",
      phone: "081678901234",
      nominal: 300_000,
      date: "2026-05-30",
    },
    {
      id: 307,
      owner: "Indah Permata",
      phone: "085012345678",
      nominal: 150_000,
      date: "2026-06-10",
    },
  ],
};

// ──────────────────────────────────────────────────────────────────────────────
// State
// ──────────────────────────────────────────────────────────────────────────────

const selectedProgramId = ref<number>(1);
const checkedIds = ref<Set<number>>(new Set());
const saldoPakai = ref<number>(0);
const isAllocating = ref(false);

// ──────────────────────────────────────────────────────────────────────────────
// Data fetching — falls back to mock data when API returns empty
// ──────────────────────────────────────────────────────────────────────────────

const { data: rawData, isLoading } = useQuery({
  queryKey: computed(() => ["funding-transactions", selectedProgramId.value]),
  queryFn: () =>
    getAllTransactions({
      program_id: selectedProgramId.value,
      limit: 50,
      status: "Paid",
      sort: "date",
      sort_dir: "asc",
    }),
  staleTime: 30_000,
});

const transactions = computed<MockTrx[]>(() => {
  if (isLoading.value) return [];
  const apiItems: any[] = rawData.value?.data ?? [];
  if (apiItems.length > 0) {
    return [...apiItems]
      .map((item) => ({
        id: item.id,
        owner: item.user?.name ?? item.owner_name ?? "Hamba Allah",
        phone: item.user?.phone ?? item.phone ?? "",
        nominal: Number(item.total ?? item.nominal ?? 0),
        date: item.date ?? item.created_at ?? "",
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  return MOCK_TRANSACTIONS[selectedProgramId.value] ?? [];
});

// ──────────────────────────────────────────────────────────────────────────────
// Financial computations
// ──────────────────────────────────────────────────────────────────────────────

const finance = ref<FinanceSummary>(PROJECT_FINANCE);

const kekuranganDana = computed(() =>
  Math.max(0, finance.value.nominal_proyek - finance.value.nominal_terkumpul),
);

const danaBelumDicairkan = computed(() =>
  Math.max(0, finance.value.nominal_terkumpul - finance.value.dana_dicairkan),
);

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

// ──────────────────────────────────────────────────────────────────────────────
// Checkbox helpers
// ──────────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────────
// Actions
// ──────────────────────────────────────────────────────────────────────────────

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
};

const handleAlokasikan = async () => {
  isAllocating.value = true;
  await new Promise((r) => setTimeout(r, 1000));
  showToast(
    `Berhasil mengalokasikan ${formatCurrency(totalAlokasi.value)} (${checkedIds.value.size} donasi + saldo ${formatCurrency(saldoPakai.value || 0)})`,
    { type: "success", position: "top-center" },
  );
  checkedIds.value = new Set();
  saldoPakai.value = 0;
  isAllocating.value = false;
};
</script>

<style scoped>
.fcard {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  height: 100%;
  border-left: 4px solid transparent;
}
.fcard-icon {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 2px;
}
.fcard-body {
  min-width: 0;
}
.fcard-label {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}
.fcard-value {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
}
.fcard-sub {
  font-size: 11px;
  color: #adb5bd;
  margin-top: 2px;
}

.fcard-blue {
  border-left-color: #0d6efd;
}
.fcard-blue .fcard-icon {
  color: #0d6efd;
}
.fcard-blue .fcard-value {
  color: #0d6efd;
}

.fcard-green {
  border-left-color: #198754;
}
.fcard-green .fcard-icon {
  color: #198754;
}
.fcard-green .fcard-value {
  color: #198754;
}

.fcard-red {
  border-left-color: #dc3545;
}
.fcard-red .fcard-icon {
  color: #dc3545;
}
.fcard-red .fcard-value {
  color: #dc3545;
}

.fcard-cyan {
  border-left-color: #0dcaf0;
}
.fcard-cyan .fcard-icon {
  color: #0dcaf0;
}
.fcard-cyan .fcard-value {
  color: #0aa8c7;
}

.fcard-purple {
  border-left-color: #6f42c1;
}
.fcard-purple .fcard-icon {
  color: #6f42c1;
}
.fcard-purple .fcard-value {
  color: #6f42c1;
}

.fcard-orange {
  border-left-color: #fd7e14;
}
.fcard-orange .fcard-icon {
  color: #fd7e14;
}
.fcard-orange .fcard-value {
  color: #fd7e14;
}
</style>
