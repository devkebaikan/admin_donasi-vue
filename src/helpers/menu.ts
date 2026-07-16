import { MENU_ITEMS } from '@/assets/data/menu'
import type { MenuItemType } from '@/types/menu'
import type { RouteRecordName } from 'vue-router'

let activeMenuItem = {}
let cachedMenuItems: MenuItemType[] | null = null

export const getMenuItems = () => {
  // Fallback to static menu if dynamic menu is not loaded yet
  return cachedMenuItems || MENU_ITEMS
}

export const setDynamicMenuItems = (items: MenuItemType[]) => {
  cachedMenuItems = items
}

const getMatchingMenuItems = (data: MenuItemType[], currentRouteName: RouteRecordName | null | undefined) => {
  const matchingItems: string[] = []

  const traverse = (item: MenuItemType) => {
    if (item.children && item.children.some((child) => child.route?.name && child.route.name === currentRouteName)) {
      matchingItems.push(item.key) // Add parent's key if a child matches
      if (item.parentKey) {
        matchingItems.push(item.parentKey)
      }
    }

    if (item.children) {
      item.children.forEach((child) => traverse(child))
    }
  }

  data.forEach(traverse)

  return matchingItems
}

export const menuItemActive = (key: string, currentRouteName: RouteRecordName | null | undefined) => {
  const menuData = cachedMenuItems || MENU_ITEMS
  activeMenuItem = getMatchingMenuItems(menuData, currentRouteName)
  return activeMenuItem && Object.values(activeMenuItem).includes(key)
}
