import { hasPermission } from "@/helpers/permission";
import type { Middleware } from "./middlewarePipeline";

// Factory: cek permission granular (mis. "event:create", "event:update").
// Terima satu permission atau array — array = lolos kalau salah satu match (any-of).
// Pemakaian: middleware: [auth, menuAccess, permission("event:create")]
export const permission = (required: string | string[]): Middleware => {
  const requiredList = Array.isArray(required) ? required : [required];

  return ({ next }) => {
    const allowed = requiredList.some((perm) => hasPermission(perm));
    if (allowed) return next();
    return next({ name: "error.404" });
  };
};
