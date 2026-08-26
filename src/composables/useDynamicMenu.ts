import { computed, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { getAll } from "@/services/rbacMenuService";
import { setDynamicMenuItems } from "@/helpers/menu";
import { hasRouteAccess } from "@/helpers/permission";
import { useAuthStore } from "@/stores/auth";
import type { MenuItemType } from "@/types/menu";
import type { MenuItem } from "@/services/rbacMenuService";

// Item tanpa route & tanpa children = section title/separator (bukan halaman)
const isTitlePlaceholder = (item: MenuItem) =>
  !item.route && (!item.children || item.children.length === 0);

// Sembunyikan menu yang route-nya tidak ada di daftar akses user (lihat helpers/permission.ts),
// termasuk section title yang jadi kosong karena semua child-nya tersembunyi.
const filterAccessibleMenus = (items: MenuItem[]): MenuItem[] => {
  const processed = items.map((item): MenuItem | null => {
    if (item.children && item.children.length > 0) {
      const filteredChildren = filterAccessibleMenus(item.children);
      return filteredChildren.length > 0
        ? { ...item, children: filteredChildren }
        : null;
    }
    if (item.route) {
      return hasRouteAccess(item.route) ? item : null;
    }
    return item;
  });

  const result: MenuItem[] = [];
  processed.forEach((item, idx) => {
    if (!item) return;
    if (isTitlePlaceholder(item)) {
      const next = processed.slice(idx + 1).find((n) => n !== null) as
        | MenuItem
        | undefined;
      if (!next || isTitlePlaceholder(next)) return;
    }
    result.push(item);
  });
  return result;
};

const transformMenuItems = (items: MenuItem[]): MenuItemType[] => {
  return items.map((item) => ({
    key: item.id.toString(),
    label: item.name,
    icon: item.icon,
    isTitle: !item.route && (!item.children || item.children.length === 0),
    route: item.route ? { name: item.route } : undefined,
    parentKey: item.parent_id ? item.parent_id.toString() : undefined,
    children:
      item.children && item.children.length > 0
        ? transformMenuItems(item.children)
        : undefined,
  }));
};

export const useDynamicMenu = () => {
  const authStore = useAuthStore();

  const sessionReady = computed(() => {
    if (!authStore.user || typeof authStore.user !== "string") return false;

    try {
      const parsed = JSON.parse(authStore.user);
      return Boolean(parsed?.token || parsed?.data?.access_token);
    } catch (e) {
      return false;
    }
  });

  const {
    data: menuResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dynamic-menu"],
    queryFn: () => getAll({ format: "tree" }),
    enabled: sessionReady,
    staleTime: 1000 * 60 * 5,
  });

  const menuItems = computed((): MenuItemType[] => {
    if (!menuResponse.value?.data) return [];
    return transformMenuItems(filterAccessibleMenus(menuResponse.value.data));
  });

  // Cache the menu items in the helper for use in menuItemActive function
  watch(
    () => menuItems.value,
    (newItems) => {
      if (newItems.length > 0) {
        setDynamicMenuItems(newItems);
      }
    },
  );

  return {
    menuItems,
    isLoading,
    error,
    refetch,
  };
};
