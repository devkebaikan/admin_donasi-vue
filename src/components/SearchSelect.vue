<template>
  <div class="user-search-select-wrapper">
    <select :id="id" :value="modelValue" @change="updateValue" v-bind="$attrs">
      <option value="0" disabled>Cari user...</option>
      <template v-if="options">
        <option
          v-for="(option, idx) in options"
          :key="idx"
          :value="option.value"
        >
          {{ option.text }}
        </option>
      </template>
    </select>
  </div>
</template>

<script setup lang="ts">
import Choices from "choices.js";
import { onMounted, watch } from "vue";

type UserSearchSelectPropsType = {
  id: string;
  modelValue?: string;
  options?: { value: string | number; text: string }[];
  isLoading?: boolean;
};

const props = defineProps<UserSearchSelectPropsType>();
const emit = defineEmits(["update:modelValue", "search"]);

let choicesInstance: Choices | null = null;
let isSyncing = false;
let debounceTimer: NodeJS.Timeout | null = null;

const updateValue = (e: Event) => {
  if (isSyncing) return;
  const select = e.target as HTMLSelectElement;
  emit("update:modelValue", select.value);
};

const handleSearch = (query: string) => {
  if (query.length > 2) {
    emit("search", query);
  }
};

const debouncedSearch = (query: string) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    handleSearch(query);
  }, 300);
};

onMounted(() => {
  const selectEl = document.getElementById(props.id) as HTMLSelectElement;

  choicesInstance = new Choices(`#${props.id}`, {
    searchEnabled: true,
    searchChoices: true,
    searchResultLimit: 10,
    shouldSort: false,
    shouldSortItems: false,
    removeItemButton: false,
    noResultsText: "Ketik minimal 3 karakter untuk mencari...",
    noChoicesText: "Tidak ada pilihan",
    itemSelectText: "Pilih",
    classNames: {
      containerOuter: "choices user-search-container",
      containerInner: "choices__inner",
      input: "choices__input",
      inputCloned: "choices__input--cloned",
      list: "choices__list",
      listItems: "choices__list--multiple",
      listSingle: "choices__list--single",
      listDropdown: "choices__list--dropdown",
      item: "choices__item",
      itemSelectable: "choices__item--selectable",
      itemDisabled: "choices__item--disabled",
      itemChoice: "choices__item--choice",
      placeholder: "choices__placeholder",
      group: "choices__group",
      groupHeading: "choices__heading",
      button: "choices__button",
      activeState: "is-active",
      focusState: "is-focused",
      openState: "is-open",
      disabledState: "is-disabled",
      highlightedState: "is-highlighted",
      selectedState: "is-selected",
      flippedState: "is-flipped",
      loadingState: "is-loading",
      noResults: "has-no-results",
      noChoices: "has-no-choices",
    },
  });

  // Keep dropdown open on search
  selectEl?.addEventListener("search", (e: any) => {
    const query = e.detail?.value || "";
    debouncedSearch(query);

    // Force dropdown to stay open
    if (choicesInstance) {
      setTimeout(() => {
        choicesInstance?.showDropdown();
      }, 0);
    }
  });
});

watch(
  () => props.options,
  () => {
    if (choicesInstance && props.options) {
      isSyncing = true;

      // Clear current choices
      choicesInstance.clearChoices();

      // Add new choices
      const newChoices = props.options.map((opt) => ({
        value: String(opt.value),
        label: opt.text,
        selected: String(opt.value) === props.modelValue,
      }));

      choicesInstance.setChoices(newChoices);
      isSyncing = false;
    }
  },
  { deep: true },
);

watch(
  () => props.isLoading,
  (loading) => {
    if (choicesInstance) {
      if (loading) {
        choicesInstance.disable();
      } else {
        choicesInstance.enable();
      }
    }
  },
);
</script>

<style scoped>
:deep(.user-search-container.choices) {
  min-width: 100%;
}

:deep(.choices__list--dropdown) {
  display: block !important;
}

:deep(.choices__list--dropdown.is-active) {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}
</style>
