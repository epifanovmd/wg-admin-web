import type { RecordStringString } from "./recordStringString.ts";

export interface AgentEnrollmentTokenDto {
  id: string;
  name: string;
  /** Начало токена — для узнавания в списке. */
  prefix: string;
  labels: RecordStringString;
  maxUses?: number;
  uses: number;
  expiresAt?: string;
  revokedAt?: string;
  createdBy?: string;
  createdAt: string;
}
