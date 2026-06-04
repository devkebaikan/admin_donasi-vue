import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    },
  },
});

export interface VueQueryPluginOptions {
  queryClient: QueryClient;
}

export function setupVueQuery(app: import("vue").App<Element>): void {
  app.use(VueQueryPlugin, { queryClient } as VueQueryPluginOptions);
}
