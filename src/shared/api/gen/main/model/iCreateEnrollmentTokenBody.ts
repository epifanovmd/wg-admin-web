import type { RecordStringString } from "./recordStringString.ts";

export interface ICreateEnrollmentTokenBody {
  name: string;
  /** Метки зарегистрированных агентов (агент их не перепишет). */
  labels?: RecordStringString;
  maxUses?: number;
  expiresAt?: string;
}
