import type { IAppVersionDto } from "@shared/api/gen/main/model";

/** Сборка: версия (тег или SHA), коммит и время; null — неизвестно. */
export interface IBuildInfo {
  version: string;
  commit: string | null;
  builtAt: string | null;
}

/** Строка подписи версий: что, какая версия, подсказка (коммит, время сборки). */
export interface IVersionLine {
  label: string;
  value: string;
  hint?: string;
}

/** Версия с коммитом, если он ещё не входит в неё (`git describe` без тега — сам SHA). */
const formatBuild = ({ version, commit }: IBuildInfo) =>
  commit && !version.includes(commit) ? `${version} · ${commit}` : version;

const buildHint = ({ builtAt }: IBuildInfo) =>
  builtAt ? `Собрано ${builtAt}` : undefined;

/**
 * Подпись версий: веб, API и агент, которого раздаёт бэкенд. Пока версия API
 * не загружена — только веб.
 */
export const formatVersionLines = (
  web: IBuildInfo,
  api: IAppVersionDto | null | undefined,
): IVersionLine[] => {
  const lines: IVersionLine[] = [
    { label: "Веб", value: formatBuild(web), hint: buildHint(web) },
  ];

  if (!api) return lines;

  lines.push({ label: "API", value: formatBuild(api), hint: buildHint(api) });
  lines.push({
    label: "Агент",
    value: api.agentVersion ? `v${api.agentVersion}` : "не собран",
  });

  return lines;
};
