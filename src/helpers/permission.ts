import { useAuthStore } from "@/stores/auth";
import type { User, UserMenuItem } from "@/types/auth";

const getStoredUser = (): User | null => {
  const auth = useAuthStore();
  if (!auth.user) return null;
  try {
    return JSON.parse(auth.user);
  } catch (e) {
    console.warn("Invalid auth data in storage", e);
    return null;
  }
};

const flattenMenuRoutes = (menus: UserMenuItem[] = []): string[] => {
  const routes: string[] = [];
  for (const item of menus) {
    if (item.route) routes.push(item.route);
    if (item.children?.length) routes.push(...flattenMenuRoutes(item.children));
  }
  return routes;
};

// Route names yang bisa diakses langsung (persis sama dengan route menu)
export const getAccessibleRouteNames = (): Set<string> => {
  const user = getStoredUser();
  return new Set(flattenMenuRoutes(user?.menus ?? []));
};

// Module (segmen pertama sebelum ".") dari tiap route menu, misal "role.list" -> "role"
export const getAccessibleModules = (): Set<string> => {
  const routeNames = getAccessibleRouteNames();
  return new Set(Array.from(routeNames).map((name) => name.split(".")[0]));
};

// menuModule: override untuk route yang prefix-nya beda dari menu induknya
// (mis. "event-type.list" tetap ikut permission menu "event")
export const hasRouteAccess = (
  routeName: string,
  menuModule?: string,
): boolean => {
  if (!routeName) return false;

  if (getAccessibleRouteNames().has(routeName)) return true;

  const module = menuModule || routeName.split(".")[0];
  return getAccessibleModules().has(module);
};
