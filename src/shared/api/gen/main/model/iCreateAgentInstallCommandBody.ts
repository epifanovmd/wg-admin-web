import type { IAgentPackagesByManagerDto } from "./iAgentPackagesByManagerDto.ts";
import type { ICreateAgentInstallCommandBodyKillMode } from "./iCreateAgentInstallCommandBodyKillMode.ts";
import type { RecordStringString } from "./recordStringString.ts";

export interface ICreateAgentInstallCommandBody {
  /** Токен регистрации; ровно одно из `token` и `tokenFile`. */
  token?: string;
  /** Путь к файлу с токеном на узле. */
  tokenFile?: string;
  /** Адрес сервера; без него — `AGENT_PUBLIC_URL` или `APP_PUBLIC_URL`. */
  baseUrl?: string;
  name?: string;
  /** Пользователь службы агента. */
  user?: string;
  /** Путь к `agent.yaml` на узле. */
  config?: string;
  privileged?: boolean;
  /** `process` | `mixed`. */
  killMode?: ICreateAgentInstallCommandBodyKillMode;
  packages?: string[];
  /** Свои имена пакетов для менеджера: на узле с ним заменяют `packages`. */
  packagesByManager?: IAgentPackagesByManagerDto;
  sysctl?: RecordStringString;
  rwPaths?: string[];
  caFile?: string;
  /** Воркеры из выпуска. */
  workers?: string[];
  /** Например `30s`. */
  stopTimeout?: string;
  /** Другой источник сборок воркеров (`--releases`). */
  releases?: string;
}
