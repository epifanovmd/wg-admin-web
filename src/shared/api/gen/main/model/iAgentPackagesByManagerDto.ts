/**
 * Пакеты по менеджерам (`--packages-apt` и т. п.).
 */
export interface IAgentPackagesByManagerDto {
  apt?: string[];
  dnf?: string[];
  yum?: string[];
  apk?: string[];
  zypper?: string[];
}
