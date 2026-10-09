import { defineConfig, Options } from "orval";

const GEN_ROOT = "./src/shared/api/gen";
const API_ROOT = "./src/shared/api";

/**
 * Один бэкенд = один orval-проект. Код кладётся в `gen/<name>/`, запросы идут
 * через мутатор `<name>Mutator` из `src/shared/api/<name>/<name>.mutator.ts`,
 * который зовёт HTTP-клиент этого бэкенда из DI.
 */
const defineApi = (name: string, input: Options["input"]): Options => ({
  output: {
    tsconfig: "tsconfig.json",
    mode: "single",
    target: `${GEN_ROOT}/${name}/api.ts`,
    schemas: `${GEN_ROOT}/${name}/model`,
    client: "axios",
    clean: [`${GEN_ROOT}/${name}`],
    override: {
      mutator: {
        path: `${API_ROOT}/${name}/${name}.mutator.ts`,
        name: `${name}Mutator`,
      },
      header: false,
    },
  },
  input,
  hooks: {
    // Генерированный код в .prettierignore (его не трогает общий prettier), поэтому
    // форматируется здесь — без учёта .prettierignore.
    afterAllFilesWrite: ["prettier --ignore-path .gitignore --write"],
  },
});

/**
 * Спека — из соседнего репозитория бэкенда wg-admin (`yarn generate` там обновляет
 * `src/routing/swagger.json`). С запущенного сервера:
 * `MAIN_SWAGGER=http://localhost:8181/api-docs/swagger.json yarn generate:orval`.
 */
const MAIN_SWAGGER =
  process.env.MAIN_SWAGGER ?? "../wg-admin-api/src/routing/swagger.json";

export default defineConfig({
  main: defineApi("main", { target: MAIN_SWAGGER }),
});
