<template>
  <label v-if="label" :for="id" class="form-label text-muted">{{
    label
  }}</label>
  <select
    :id="id"
    :value="modelValue"
    @change="updateValue"
    v-bind="$attrs"
    :multiple="multiple"
    :disabled="disabled"
  >
    <slot />
    <template v-if="options">
      <option v-for="(option, idx) in options" :key="idx" :value="option.value">
        {{ option.text }}
      </option>
    </template>
  </select>
</template>

<script setup lang="ts">
import Choices from "choices.js";
import { onMounted, onBeforeUnmount, watch } from "vue";

type ChoicesSelectPropsType = {
  id: string;
  label?: string;
  modelValue?: string | string[];
  options?: { value: string | number; text: string }[];
  choiceOptions?: object;
  multiple?: boolean;
  disabled?: boolean;
};

const props = defineProps<ChoicesSelectPropsType>();
const emit = defineEmits(["update:modelValue"]);

let choicesInstance: Choices | null = null;
let isSyncing = false;

const updateValue = (e: Event) => {
  if (isSyncing) return;
  const select = e.target as HTMLSelectElement;
  if (select.multiple) {
    emit(
      "update:modelValue",
      Array.from(select.selectedOptions).map((o) => o.value),
    );
  } else {
    emit("update:modelValue", select.value);
  }
};

onMounted(() => {
  choicesInstance = new Choices(`#${props.id}`, { ...props.choiceOptions });

  if (
    props.multiple &&
    Array.isArray(props.modelValue) &&
    props.modelValue.length > 0
  ) {
    isSyncing = true;
    choicesInstance.setChoiceByValue(props.modelValue);
    isSyncing = false;
  }

  // Sync initial disabled state (Choices.js wraps the select, so the
  // native `disabled` attribute alone won't visually/interactively disable it)
  if (props.disabled) {
    choicesInstance.disable();
  }
});

watch(
  () => props.disabled,
  (isDisabled) => {
    if (!choicesInstance) return;
    if (isDisabled) {
      choicesInstance.disable();
    } else {
      choicesInstance.enable();
    }
  },
);

onBeforeUnmount(() => {
  choicesInstance?.destroy();
});
</script>