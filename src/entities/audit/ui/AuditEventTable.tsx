import type { AuditEventDto } from "@shared/api/gen/main/model";
import { describeUserAgent, formatter } from "@shared/lib/utils";
import { Badge, Button, createColumnHelper, Empty, Table } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC, useMemo } from "react";

import { auditEventMeta } from "../lib/audit-event";
import type { AuditFeed } from "../model/audit-feed";

const column = createColumnHelper<AuditEventDto>();

/** Короткий id, когда имя автора неизвестно. */
const shortId = (id: string) => `${id.slice(0, 8)}…`;

const createColumns = (actorName?: (id: string) => string | undefined) => [
  column.accessor("createdAt", {
    header: "Когда",
    size: 180,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatter.date.format(getValue())}
      </span>
    ),
  }),
  column.accessor("type", {
    header: "Событие",
    size: 220,
    cell: ({ getValue }) => {
      const meta = auditEventMeta(getValue());

      return (
        <Badge variant={meta.tone} className="whitespace-nowrap">
          {meta.label}
        </Badge>
      );
    },
  }),
  ...(actorName
    ? [
        column.accessor("actorId", {
          header: "Пользователь",
          cell: ({ getValue }) => {
            const id = getValue();

            if (!id) return "—";

            return (
              <span className="block truncate" title={id}>
                {actorName(id) ?? (
                  <span className="font-mono text-xs text-muted-foreground">
                    {shortId(id)}
                  </span>
                )}
              </span>
            );
          },
        }),
      ]
    : []),
  column.accessor("ip", {
    header: "IP",
    size: 130,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">
        {getValue() ?? "—"}
      </span>
    ),
  }),
  column.accessor("userAgent", {
    header: "Клиент",
    cell: ({ getValue }) => (
      <span className="block truncate">{describeUserAgent(getValue())}</span>
    ),
  }),
];

interface AuditEventTableProps {
  feed: AuditFeed;
  /** Имя автора по id; задан — показывается колонка автора (общий журнал). */
  actorName?: (id: string) => string | undefined;
}

/** Таблица событий журнала с подгрузкой следующей страницы. */
export const AuditEventTable: FC<AuditEventTableProps> = observer(
  ({ feed, actorName }) => {
    const columns = useMemo(() => createColumns(actorName), [actorName]);

    return (
      <div className="flex flex-col gap-3">
        <Table
          className="flex-none"
          data={feed.items}
          columns={columns}
          size="sm"
          loading={feed.isLoading}
          error={
            feed.error ? (
              <Empty size="sm" icon="error" title={feed.error.message} />
            ) : undefined
          }
          labels={{ empty: "Событий пока нет" }}
          getRowId={e => e.id}
          aria-label="Журнал действий"
        />
        {feed.hasMore && (
          <Button
            variant="outline"
            className="self-center"
            loading={feed.isLoadingMore}
            onClick={feed.loadMore}
          >
            Показать ещё
          </Button>
        )}
      </div>
    );
  },
);
