/** Способ установки агента на узел. */
export type TAgentInstallMode = "systemd" | "rootless" | "run" | "docker";

/** Способы установки для выбора в форме. */
export const AGENT_INSTALL_MODE_OPTIONS = [
  { value: "systemd", label: "Служба" },
  { value: "rootless", label: "Без root" },
  { value: "run", label: "Без установки" },
  { value: "docker", label: "Docker" },
] as const satisfies readonly { value: TAgentInstallMode; label: string }[];

/** Способы установки по SSH: служба (root или пользователя). */
export const AGENT_SSH_INSTALL_MODE_OPTIONS = AGENT_INSTALL_MODE_OPTIONS.filter(
  o => o.value === "systemd" || o.value === "rootless",
);

/** Что получится на узле при каждом способе. */
export const AGENT_INSTALL_MODE_HINTS: Record<TAgentInstallMode, string> = {
  systemd: "Служба systemd от root — команда выполняется через sudo.",
  rootless:
    "Агент пользователя без root: команда без sudo, всё в домашнем каталоге. Пакеты не ставятся — нужное воркерам должно уже стоять на узле.",
  run: 'Без установки: агент работает на переднем плане — в контейнере (docker run … sh -c "<команда>") или под своим менеджером процессов. Данные — в /var/lib/agent (держите на томе), себя не обновляет.',
  docker:
    "Docker Compose: команда скачает архив агента, создаст .env с адресом и токеном и запустит docker compose up -d --build. Нужны Docker и compose; обновление — новым архивом.",
};

/** Как агент поставлен на узел (`install` агента) — подпись. */
export const agentInstallLabel = (install?: string): string | undefined => {
  switch (install) {
    case "systemd":
      return "служба";
    case "user":
      return "без root, служба пользователя";
    case "manual":
      return "без root, без службы";
    default:
      return undefined;
  }
};

/**
 * Обновляет ли агент себя по команде сервера: `updateMode` нет (агент старше
 * 1.4) или `self`. Агент в контейнере обновляют новым образом или запуском.
 */
export const isAgentSelfUpdating = (agent: { updateMode?: string }): boolean =>
  !agent.updateMode || agent.updateMode === "self";
