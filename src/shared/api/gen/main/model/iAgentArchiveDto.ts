/**
 * Архив агента для узлов (все платформы).
 */
export interface IAgentArchiveDto {
  file: string;
  version?: string;
  /** Платформы: `linux/amd64`, `linux/arm64`. */
  platforms: string[];
  size: number;
  /** В архиве есть compose.yml: запуск в Docker Compose. */
  compose: boolean;
}
