<template>
  <div
    class="border rounded p-3 text-center position-relative"
    style="min-height: 160px; background: #f8f9fa; cursor: pointer"
    @click="triggerFileInput"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      class="d-none"
      @change="handleFile"
    />

    <div v-if="preview" class="position-relative d-inline-block">
      <img
        :src="preview"
        alt="preview"
        style="max-height: 140px; max-width: 100%; border-radius: 4px"
      />

      <button
        type="button"
        class="btn btn-sm btn-danger position-absolute top-0 end-0"
        style="transform: translate(50%, -50%)"
        @click.stop="remove"
      >
        ×
      </button>
    </div>

    <div v-else class="py-3">
      <i class="bx bx-cloud-upload fs-1 text-muted d-block mb-2"></i>
      <p class="text-muted mb-1">Klik untuk upload gambar</p>
      <small class="text-muted"> JPEG, PNG, WEBP, GIF </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useImageUpload } from "@/composables/useImageUpload";

const emit = defineEmits<{
  (e: "update:modelValue", value: File | null): void;
}>();

const props = defineProps<{
  modelValue?: File | null;
}>();

const { file, preview, fileInput, triggerFileInput, handleChange, clear } =
  useImageUpload();

watch(file, (value) => {
  emit("update:modelValue", value);
});

const handleFile = (event: Event) => {
  handleChange(event);
};

const remove = () => {
  clear();
  emit("update:modelValue", null);
};
</script>
