import type { AgentEnrollmentTokenDto } from "./agentEnrollmentTokenDto.ts";

/**
 * Созданный токен: полный токен — только в этом ответе.
 */
export interface ICreatedAgentEnrollmentTokenDto {
  token: string;
  enrollmentToken: AgentEnrollmentTokenDto;
}
