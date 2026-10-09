import { SchemaHint } from "@entities/agent";
import { Collapse } from "@shared/ui";
import { FC, ReactNode } from "react";

/** Элемент каталога возможностей воркера: маршрут, событие, задача, запрос, ключ. */
export interface IManifestItem {
  key: string;
  /** Имя: `POST /echo`, тип события, ключ. */
  name: string;
  description?: string;
  /** Рядом с именем: бейджи состояния. */
  extra?: ReactNode;
  /** Ниже описания: ошибки и т. п. */
  footer?: ReactNode;
  /** Схемы из манифеста: тело, ответ, data. */
  schemas: { label: string; schema: unknown }[];
}

interface WorkerManifestSectionProps {
  title: string;
  items: IManifestItem[];
}

const SUBTITLE_CLASS =
  "text-xs font-medium uppercase tracking-wide text-muted-foreground";

const hasSchema = (schema: unknown): boolean =>
  !!schema && typeof schema === "object" && Object.keys(schema).length > 0;

/** Раздел каталога возможностей воркера: элементы с описанием и схемами. */
export const WorkerManifestSection: FC<WorkerManifestSectionProps> = ({
  title,
  items,
}) => (
  <section className="flex min-w-0 flex-col gap-1.5">
    <h4 className={SUBTITLE_CLASS}>
      {title} · {items.length}
    </h4>
    {items.length === 0 ? (
      <p className="text-xs text-muted-foreground">нет</p>
    ) : (
      <ul className="flex flex-col gap-2">
        {items.map(item => {
          const schemas = item.schemas.filter(({ schema }) =>
            hasSchema(schema),
          );

          return (
            <li key={item.key} className="flex flex-col gap-0.5">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-xs">{item.name}</span>
                {item.extra}
              </span>
              {item.description && (
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
              {item.footer}
              {schemas.length > 0 && (
                <Collapse size="sm">
                  <Collapse.Trigger>
                    {schemas.map(({ label }) => label).join(" · ")}
                  </Collapse.Trigger>
                  <Collapse.Content innerClassName="flex flex-col gap-2 pt-1">
                    {schemas.map(({ label, schema }) => (
                      <SchemaHint key={label} schema={schema} label={label} />
                    ))}
                  </Collapse.Content>
                </Collapse>
              )}
            </li>
          );
        })}
      </ul>
    )}
  </section>
);
