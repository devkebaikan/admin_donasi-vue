<template>
  <div class="menu-item">
    <div class="menu-item-header">
      <div class="menu-item-content">
        <span v-if="item.icon" class="me-2">
          <i :class="`${item.icon}`"></i>
        </span>
        <span class="fw-semibold">{{ item.name }}</span>
        <span v-if="item.route" class="text-muted small ms-2"
          >({{ item.route }})</span
        >
        <b-badge
          :variant="item.is_active ? 'success' : 'secondary'"
          class="ms-2"
        >
          {{ item.is_active ? "Aktif" : "Nonaktif" }}
        </b-badge>
      </div>
      <div class="menu-item-actions">
        <b-button
          variant="soft-warning"
          size="sm"
          @click="$emit('edit', item.id)"
          title="Edit"
        >
          <i class="bx bx-edit fs-16"></i>
        </b-button>
        <b-button
          variant="soft-danger"
          size="sm"
          @click="$emit('delete', item.id)"
          title="Hapus"
        >
          <i class="bx bx-trash fs-16"></i>
        </b-button>
      </div>
    </div>
    <div
      v-if="item.children && item.children.length > 0"
      class="menu-item-children"
    >
      <MenuItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem as MenuItemType } from "@/services/rbacMenuService";

defineProps<{
  item: MenuItemType;
}>();

defineEmits<{
  edit: [id: number];
  delete: [id: number];
}>();
</script>

<style scoped>
.menu-item {
  margin-bottom: 0.75rem;
}

.menu-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  gap: 1rem;
}

.menu-item-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-item-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.menu-item-children {
  margin-left: 2rem;
  margin-top: 0.5rem;
}
</style>
