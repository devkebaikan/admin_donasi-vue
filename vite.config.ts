import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { BootstrapVueNextResolver } from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ["VITE_", "PUBLIC_"]);
  const targetApi =
    env.VITE_API_BASE_URL || "https://fapi.beramalbersama.com/api/v1";

  return {
    base: "/",
    envPrefix: ["VITE_", "PUBLIC_"],
    plugins: [
      vue(),
      Components({
        resolvers: [BootstrapVueNextResolver()],
      }),
    ],
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: targetApi,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          secure: false,
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true, // versi Vite-nya dari pengaturan itu
        },
      },
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
