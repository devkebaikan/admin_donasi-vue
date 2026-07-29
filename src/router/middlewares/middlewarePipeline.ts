import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

export type MiddlewareContext = {
  to: RouteLocationNormalized;
  from: RouteLocationNormalized;
  next: NavigationGuardNext;
};

export type Middleware = (context: MiddlewareContext) => unknown;

// Menjalankan array middleware secara berurutan (mirip Express).
// - Middleware panggil `next()` tanpa argumen -> lanjut ke middleware berikutnya.
// - Middleware panggil `next(false)` / `next({ name: ... })` -> langsung resolve
//   ke `next` asli vue-router (redirect/abort), rantai berhenti di situ.
// - Middleware terakhir yang panggil `next()` -> mengonfirmasi navigasi (next asli).
export function middlewarePipeline(
  context: MiddlewareContext,
  middleware: Middleware[],
  index: number,
): NavigationGuardNext {
  const nextMiddleware = middleware[index];

  if (!nextMiddleware) {
    return context.next;
  }

  return ((...args: Parameters<NavigationGuardNext>) => {
    if (args.length > 0) {
      return context.next(...args);
    }
    const nextPipeline = middlewarePipeline(context, middleware, index + 1);
    return nextMiddleware({ ...context, next: nextPipeline });
  }) as NavigationGuardNext;
}
