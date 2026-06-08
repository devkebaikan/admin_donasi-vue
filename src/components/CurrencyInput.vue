<template>
  <b-form-input
    :id="id"
    :placeholder="placeholder"
    :state="state"
    v-model="internalValue"
    @input="onInput"
  />
  <!-- <b-form-input
    :id="id"
    :placeholder="placeholder"
    :state="state"
    :value="internalValue"
    @input="onInput"
  /> -->
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: [String, Number],
  id: String,
  placeholder: String,
  state: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

const internalValue = ref("");

// Format dari parent -> input
watch(
  () => props.modelValue,
  (val) => {
    if (val === null || val === undefined || val === "") {
      internalValue.value = "";
      return;
    }

    internalValue.value = new Intl.NumberFormat("id-ID").format(Number(val));
  },
  { immediate: true },
);

// Saat user mengetik
const onInput = (e: any) => {
  const raw = e.target.value.replace(/\D/g, ""); // angka murni
  emit("update:modelValue", Number(raw)); // kirim angka mentah
};
</script>
