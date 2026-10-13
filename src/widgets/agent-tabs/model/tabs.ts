/** Вкладки агента по порядку. */
export const AGENT_TABS = [
  "overview",
  "workers",
  "configs",
  "commands",
  "events",
  "logs",
] as const;

/** Вкладка агента. */
export type TAgentTab = (typeof AGENT_TABS)[number];

/** Значение вкладки из `Tabs` — одна из вкладок агента. */
export const isAgentTab = (value: string): value is TAgentTab =>
  (AGENT_TABS as readonly string[]).includes(value);
