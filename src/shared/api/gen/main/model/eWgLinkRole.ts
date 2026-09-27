/**
 * Роль ноды в линке релея.
 */
export type EWgLinkRole = (typeof EWgLinkRole)[keyof typeof EWgLinkRole];

export const EWgLinkRole = {
  relay: "relay",
  target: "target",
} as const;
