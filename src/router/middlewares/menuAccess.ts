import { hasRouteAccess } from "@/helpers/permission";
import type { Middleware } from "./middlewarePipeline";

// Halaman yang selalu bisa diakses semua user yang sudah login,
// tanpa perlu terdaftar di menu (VUE_USER.menus). Isi dengan path
// ("/crm") atau route name ("crm.list") — tambah baris baru untuk buka halaman lain.
export const ALWAYS_ACCESSIBLE: string[] = [
  "/",
  "/crm",
  "/crm/wa-template",
  "/crm/wa-template/create",
  "/crm/wa-template/:id/edit",
];

const isAlwaysAccessible = (path: string, routeName?: string) =>
  ALWAYS_ACCESSIBLE.includes(path) ||
  (!!routeName && ALWAYS_ACCESSIBLE.includes(routeName));

// Cek akses halaman berdasarkan menu yang dimiliki user (VUE_USER.menus).
export const menuAccess: Middleware = ({ to, next }) => {
  const routeName = to.name?.toString();

  if (isAlwaysAccessible(to.path, routeName)) return next();
  if (!routeName) return next();

  const menuModule = to.matched
    .map((route) => route.meta.menuModule as string | undefined)
    .find(Boolean);

  if (hasRouteAccess(routeName, menuModule)) return next();

  return next({ name: "error.404" });
};
