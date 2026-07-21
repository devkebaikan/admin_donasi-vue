<template>
  <div class="menu-tree-node">
    <div class="d-flex align-items-center gap-1 py-1">
      <button
        v-if="hasChildren"
        type="button"
        class="btn btn-sm btn-link p-0 text-muted lh-1"
        @click="expanded = !expanded"
      >
        <i :class="expanded ? 'bx bx-chevron-down' : 'bx bx-chevron-right'"></i>
      </button>
      <i v-else class="bx bx-chevron-right invisible"></i>

      <div class="form-check mb-0">
        <input
          :id="`menu-${node.id}`"
          type="checkbox"
          class="form-check-input"
          :checked="isChecked"
          :indeterminate.prop="isIndeterminate"
          @change="$emit('toggle', node.id)"
        />
        <label :for="`menu-${node.id}`" class="form-check-label small">
          {{ node.name }}
        </label>
      </div>
    </div>

    <div v-if="hasChildren && expanded" class="ps-4 border-start">
      <MenuTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected="selected"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

// Allows the component to reference itself recursively in the template
defineOptions({ name: "MenuTreeNode" });

export interface MenuNode {
  id: number;
  name: string;
  children?: MenuNode[];
}

const props = defineProps<{
  node: MenuNode;
  selected: number[];
}>();

defineEmits<{
  (e: "toggle", id: number): void;
}>();

const expanded = ref(true);

const hasChildren = computed(
  () => !!props.node.children && props.node.children.length > 0,
);

const descendantIds = (node: MenuNode): number[] =>
  (node.children ?? []).flatMap((c) => [c.id, ...descendantIds(c)]);

const isChecked = computed(() => props.selected.includes(props.node.id));

const isIndeterminate = computed(() => {
  if (isChecked.value || !hasChildren.value) return false;
  const ids = descendantIds(props.node);
  return ids.some((id) => props.selected.includes(id));
});
</script>
