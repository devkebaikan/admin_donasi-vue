<template>
  <div>
    <!-- Lat/Lng Inputs -->
    <b-row class="g-2 mb-2">
      <b-col md="6">
        <b-form-group label="Latitude" label-for="map-lat">
          <b-form-input
            id="map-lat"
            v-model="latStr"
            type="number"
            step="any"
            placeholder="e.g., -6.2088"
            @change="onInputCommit"
          />
          <small class="text-muted">Opsional</small>
        </b-form-group>
      </b-col>
      <b-col md="6">
        <b-form-group label="Longitude" label-for="map-lng">
          <b-form-input
            id="map-lng"
            v-model="lngStr"
            type="number"
            step="any"
            placeholder="e.g., 106.8456"
            @change="onInputCommit"
          />
          <small class="text-muted">Opsional</small>
        </b-form-group>
      </b-col>
    </b-row>

    <!-- Action Buttons -->
    <div class="d-flex flex-wrap gap-2 mb-3">
      <!-- <b-button
        size="sm"
        :variant="showMap ? 'primary' : 'outline-primary'"
        @click="showMap = !showMap"
      >
        <i :class="['bx', showMap ? 'bx-map-alt' : 'bx-map', 'me-1']"></i>
        {{ showMap ? "Tutup Peta" : "Buka Peta" }}
      </b-button> -->

      <b-button
        size="sm"
        variant="outline-secondary"
        :disabled="isLocating"
        @click="useMyLocation"
      >
        <b-spinner v-if="isLocating" small class="me-1" />
        <i v-else class="bx bx-current-location me-1"></i>
        Gunakan Lokasi Saya
      </b-button>

      <b-button
        v-if="hasLocation"
        size="sm"
        variant="outline-danger"
        @click="clearLocation"
      >
        <i class="bx bx-x me-1"></i>Hapus Lokasi
      </b-button>
    </div>

    <!-- Koordinat terpilih -->
    <div
      v-if="hasLocation"
      class="alert alert-light border py-2 px-3 mb-3 d-flex align-items-center gap-2"
    >
      <i class="bx bx-map-pin text-primary fs-5"></i>
      <span class="small">
        <strong>Lat:</strong> {{ parsedLat?.toFixed(6) }}&ensp;
        <strong>Lng:</strong> {{ parsedLng?.toFixed(6) }}
      </span>
    </div>

    <!-- Google Map -->
    <div
      v-if="showMap"
      class="border rounded overflow-hidden"
      style="height: 380px"
    >
      <GoogleMap
        :api-key="apiKey"
        :center="mapCenter"
        :zoom="mapZoom"
        style="width: 100%; height: 100%"
        @click="onMapClick"
      >
        <Marker
          v-if="hasLocation"
          :options="{ position: markerPosition, draggable: true }"
          @dragend="onMarkerDragEnd"
        />
      </GoogleMap>
    </div>
    <small v-if="showMap" class="text-muted d-block mt-1">
      <i class="bx bx-info-circle me-1"></i>Klik pada peta atau seret penanda
      untuk memilih lokasi
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { GoogleMap, Marker } from "vue3-google-map";

const props = defineProps<{
  lat?: number;
  lng?: number;
}>();

const emit = defineEmits<{
  "update:lat": [value: number | undefined];
  "update:lng": [value: number | undefined];
}>();

const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ?? "";

const DEFAULT_CENTER = { lat: -2.5489, lng: 118.0149 };
const DEFAULT_ZOOM = 5;
const LOCATION_ZOOM = 15;

const showMap = ref(true);
const isLocating = ref(false);
const latStr = ref("");
const lngStr = ref("");
const mapCenter = ref({ ...DEFAULT_CENTER });
const mapZoom = ref(DEFAULT_ZOOM);

const parsedLat = computed(() => {
  const n = parseFloat(latStr.value);
  return isNaN(n) ? undefined : n;
});

const parsedLng = computed(() => {
  const n = parseFloat(lngStr.value);
  return isNaN(n) ? undefined : n;
});

const hasLocation = computed(
  () => parsedLat.value != null && parsedLng.value != null,
);

const markerPosition = computed(() =>
  hasLocation.value
    ? { lat: parsedLat.value!, lng: parsedLng.value! }
    : { lat: 0, lng: 0 },
);

// Sync dari props (dibutuhkan saat edit page load data)
watch(
  () => [props.lat, props.lng] as const,
  ([lat, lng]) => {
    if (lat != null) latStr.value = String(lat);
    if (lng != null) lngStr.value = String(lng);
    if (lat != null && lng != null) {
      mapCenter.value = { lat, lng };
      mapZoom.value = LOCATION_ZOOM;
    }
  },
  { immediate: true },
);

const emitValues = () => {
  emit("update:lat", parsedLat.value);
  emit("update:lng", parsedLng.value);
};

const setPosition = (lat: number, lng: number) => {
  latStr.value = parseFloat(lat.toFixed(6)).toString();
  lngStr.value = parseFloat(lng.toFixed(6)).toString();
  emitValues();
};

const onInputCommit = () => {
  emitValues();
  if (parsedLat.value != null && parsedLng.value != null) {
    mapCenter.value = { lat: parsedLat.value, lng: parsedLng.value };
    mapZoom.value = LOCATION_ZOOM;
    if (!showMap.value) showMap.value = true;
  }
};

const onMapClick = (event: any) => {
  if (!event?.latLng) return;
  setPosition(event.latLng.lat(), event.latLng.lng());
};

const onMarkerDragEnd = (event: any) => {
  if (!event?.latLng) return;
  setPosition(event.latLng.lat(), event.latLng.lng());
};

const useMyLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation tidak tersedia di browser Anda.");
    return;
  }
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setPosition(lat, lng);
      mapCenter.value = { lat, lng };
      mapZoom.value = LOCATION_ZOOM;
      if (!showMap.value) showMap.value = true;
      isLocating.value = false;
    },
    (error) => {
      let msg = "Gagal mendapatkan lokasi";
      if (error.code === 1) msg = "Izin lokasi ditolak. Periksa setting browser Anda.";
      else if (error.code === 2) msg = "Lokasi tidak tersedia.";
      else if (error.code === 3) msg = "Request timeout. Coba lagi.";
      alert(msg);
      isLocating.value = false;
    },
  );
};

const clearLocation = () => {
  latStr.value = "";
  lngStr.value = "";
  mapCenter.value = { ...DEFAULT_CENTER };
  mapZoom.value = DEFAULT_ZOOM;
  emit("update:lat", undefined);
  emit("update:lng", undefined);
};
</script>
