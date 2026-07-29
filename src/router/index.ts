import { createRouter, createWebHistory } from "vue-router";
import { allRoutes } from "./routes";
import {
  DEFAULT_MIDDLEWARE,
  middlewarePipeline,
  type Middleware,
} from "./middlewares";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: allRoutes,
});

router.beforeEach((to, from, next) => {
  const title = to.meta.title;
  if (title) {
    document.title = title.toString();
  }
  next();
});

// Guard tunggal: menjalankan meta.middleware milik route lewat pipeline.
// Route yang authRequired: true tapi belum deklarasikan middleware sendiri
// otomatis pakai DEFAULT_MIDDLEWARE (auth + akses menu), jadi route lama
// tidak perlu diubah satu-satu.
router.beforeEach((to, from, next): any => {
  const authRequired = to.matched.some((route) => route.meta.authRequired);
  if (!authRequired) return next();

  const middleware =
    (to.meta.middleware as Middleware[] | undefined) ?? DEFAULT_MIDDLEWARE;

  if (!middleware.length) return next();

  const context = { to, from, next };
  const pipeline = middlewarePipeline(context, middleware, 1);
  return middleware[0]({ ...context, next: pipeline });
});

export default router;
