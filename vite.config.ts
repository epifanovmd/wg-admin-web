import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { cjsInterop } from "vite-plugin-cjs-interop";

const root = path.resolve(__dirname);

/** Алиасы слоёв FSD; те же пути — в `paths` tsconfig.json. */
export const alias = {
  "@app": path.resolve(root, "src/app"),
  "@pages": path.resolve(root, "src/pages"),
  "@widgets": path.resolve(root, "src/widgets"),
  "@features": path.resolve(root, "src/features"),
  "@entities": path.resolve(root, "src/entities"),
  "@shared": path.resolve(root, "src/shared"),
};

const packageVersion: string = JSON.parse(
  readFileSync(path.resolve(root, "package.json"), "utf8"),
).version;

/**
 * Версия сборки фронта (`WEB_BUILD`): из окружения сборки (make — git
 * describe, коммит, время), вне её — версия package.json.
 */
export const define = {
  __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || packageVersion),
  __APP_COMMIT__: JSON.stringify(process.env.APP_COMMIT || ""),
  __APP_BUILT_AT__: JSON.stringify(process.env.APP_BUILT_AT || ""),
};

export default defineConfig(({ mode }) => {
  // Те же файлы, что видит клиент: .env.[mode].local поверх .env.[mode].
  const env = loadEnv(mode, root, "VITE_");
  const host = env.VITE_HOST || undefined;
  const port = env.VITE_PORT ? Number(env.VITE_PORT) : undefined;

  return {
    plugins: [
      tanstackRouter({
        routesDirectory: "./src/app/routes",
        generatedRouteTree: "./src/app/routeTree.gen.ts",
      }),
      react(),
      cjsInterop({ dependencies: ["lodash", "inversify-inject-decorators"] }),
      tailwindcss(),
    ],
    resolve: { alias },
    define,
    server: {
      host,
      port: port ?? 3000,
      watch: { ignored: ["**/src/app/routeTree.gen.ts"] },
      // HTTP API — через dev-сервер (без CORS); сокет подключается к
      // VITE_SOCKET_BASE_URL напрямую.
      proxy: {
        "/api": { target: env.VITE_BASE_URL, changeOrigin: true },
      },
    },
    // Страницы грузятся лениво; общий чанк с клиентом API крупный,
    // проверка размера чанков для панели управления не нужна.
    build: { chunkSizeWarningLimit: Infinity },
    preview: { host, port },
  };
});
