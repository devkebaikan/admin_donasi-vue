import { hasRouteAccess } from "@/helpers/permission";
import type { Middleware } from "./middlewarePipeline";

// Cek akses halaman berdasarkan menu yang dimiliki user (VUE_USER.menus).
export const menuAccess: Middleware = ({ to, next }) => {
  const routeName = to.name?.toString();
  if (!routeName) return next();

  const menuModule = to.matched
    .map((route) => route.meta.menuModule as string | undefined)
    .find(Boolean);

  if (hasRouteAccess(routeName, menuModule)) return next();

  return next({ name: "error.404" });
};
