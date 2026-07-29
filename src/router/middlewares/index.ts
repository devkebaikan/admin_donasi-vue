import { auth } from "./auth";
import { menuAccess } from "./menuAccess";
import { permission } from "./permission";
import type { Middleware } from "./middlewarePipeline";

export { auth, menuAccess, permission };
export { middlewarePipeline } from "./middlewarePipeline";
export type { Middleware, MiddlewareContext } from "./middlewarePipeline";

// Dipakai untuk route yang authRequired: true tapi belum deklarasikan
// meta.middleware sendiri — supaya semua route lama tetap terlindungi
// persis seperti sebelumnya (auth + akses menu) tanpa perlu diubah satu-satu.
export const DEFAULT_MIDDLEWARE: Middleware[] = [auth, menuAccess];
