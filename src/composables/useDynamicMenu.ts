import { computed, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { getAll } from "@/services/rbacMenuService";
import { setDynamicMenuItems } from "@/helpers/menu";
import type { MenuItemType } from "@/types/menu";
import type { MenuItem } from "@/services/rbacMenuService";

const transformMenuItems = (items: MenuItem[]): MenuItemType[] => {
  return items.map((item) => ({
    key: item.id.toString(),
    label: item.name,
    icon: item.icon,
    isTitle: !item.route && (!item.children || item.children.length === 0),
    route: item.route ? { name: item.route } : undefined,
    parentKey: item.parent_id ? item.parent_id.toString() : undefined,
    children: item.children && item.children.length > 0
      ? transformMenuItems(item.children)
      : undefined,
  }));
};

export const useDynamicMenu = () => {
  const { data: menuResponse, isLoading, error, refetch } = useQuery({
    queryKey: ["dynamic-menu"],
    queryFn: () => getAll({ format: "tree" }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const menuItems = computed((): MenuItemType[] => {
    if (!menuResponse.value?.data) return [];
    return transformMenuItems(menuResponse.value.data);
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
