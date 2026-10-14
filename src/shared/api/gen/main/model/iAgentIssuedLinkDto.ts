/**
 * Одноразовая ссылка на архив агента с токеном.
 */
export interface IAgentIssuedLinkDto {
  url: string;
  /** Срок ссылки, мс. */
  expiresAt: number;
}
