import type { RouteLocationNormalized } from "vue-router";
import { hasRouteAccess } from "@/helpers/permission";
import type { Middleware } from "./middlewarePipeline";

// Halaman yang selalu bisa diakses semua user yang sudah login.
// Bisa diisi dengan:
// - Exact path: "/"
// - Dynamic path: "/crm/wa-template/:id/edit" atau "/image/:id/edit"
// - Route name: "crm.wa-template.edit"
export const ALWAYS_ACCESSIBLE: string[] = [
  "/",
  "/crm",
  "/crm/wa-template",
  "/crm/wa-template/create",
  "/crm/wa-template/:id/edit",
  "/image/:id/edit",
  "/iniaja",
];

// Helper untuk mencocokkan dynamic path pattern (contoh: :id, :slug, atau wildcard *)
const isPatternMatch = (pattern: string, actualPath: string) => {
  if (pattern === actualPath) return true;
  if (!pattern.includes(":") && !pattern.includes("*")) return false;

  const regexPattern = new RegExp(
    "^" +
      pattern
        .replace(/:[a-zA-Z0-9_]+/g, "[^/]+") // mengubah :id menjadi karakter selain slash
        .replace(/\*/g, ".*") +              // wildcard * jika ada
      "$"
  );
  return regexPattern.test(actualPath);
};

const isAlwaysAccessible = (to: RouteLocationNormalized) => {
  const routeName = to.name?.toString();
  const actualPath = to.path;

  // 1. Cek jika Route Name terdaftar di ALWAYS_ACCESSIBLE
  if (routeName && ALWAYS_ACCESSIBLE.includes(routeName)) {
    return true;
  }

  // 2. Cek jika path asli dari route definition (to.matched) terdaftar
  const isMatchedPathAccessible = to.matched.some((record) =>
    ALWAYS_ACCESSIBLE.includes(record.path)
  );
  if (isMatchedPathAccessible) return true;

  // 3. Cek pattern matching terhadap actual path (misal: /image/123/edit vs /image/:id/edit)
  return ALWAYS_ACCESSIBLE.some((pattern) => isPatternMatch(pattern, actualPath));
};

// Cek akses halaman berdasarkan menu yang dimiliki user (VUE_USER.menus).
export const menuAccess: Middleware = ({ to, next }) => {
  if (isAlwaysAccessible(to)) return next();

  const routeName = to.name?.toString();
  if (!routeName) return next();

  const menuModule = to.matched
    .map((route) => route.meta.menuModule as string | undefined)
    .find(Boolean);

  if (hasRouteAccess(routeName, menuModule)) return next();

  return next({ name: "error.404" });
};
