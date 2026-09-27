import { CreateApiKeyButton } from "@features/create-api-key";
import { type ApiKeyDto } from "@shared/api/gen/main/model";
import { formatter } from "@shared/lib/utils";
import {
  Badge,
  CodeChip,
  createColumnHelper,
  Empty,
  IconButton,
  Pagination,
  Table,
  Tooltip,
} from "@shared/ui";
import { Ban } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC, useMemo } from "react";

import { useAdminApiKeysVM } from "../model/useAdminApiKeysVM";

const isExpired = (key: ApiKeyDto) =>
  !!key.expiresAt && new Date(key.expiresAt) < new Date();

const column = createColumnHelper<ApiKeyDto>();

const createColumns = (onRevoke: (key: ApiKeyDto) => void) => [
  column.accessor("name", {
    header: "Ключ",
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{row.original.name}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.prefix}…
        </span>
      </div>
    ),
  }),
  column.accessor("scopes", {
    header: "Scopes",
    cell: ({ getValue }) => (
      <div className="flex flex-wrap gap-1">
        {getValue().map(scope => (
          <CodeChip key={scope}>{scope}</CodeChip>
        ))}
      </div>
    ),
  }),
  column.display({
    id: "state",
    header: "Состояние",
    size: 130,
    cell: ({ row }) => {
      if (row.original.revokedAt) {
        return <Badge variant="destructive">отозван</Badge>;
      }
      if (isExpired(row.original)) {
        return <Badge variant="warning">истёк</Badge>;
      }

      return <Badge variant="success">активен</Badge>;
    },
  }),
  column.accessor("lastUsedAt", {
    header: "Использован",
    size: 170,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {getValue() ? formatter.date.formatDiff(getValue()) : "никогда"}
      </span>
    ),
  }),
  column.accessor("expiresAt", {
    header: "Действует до",
    size: 150,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {getValue() ? formatter.date.formatDate(getValue()) : "бессрочно"}
      </span>
    ),
  }),
  column.display({
    id: "actions",
    size: 60,
    meta: { align: "right" },
    cell: ({ row }) =>
      row.original.revokedAt ? null : (
        <Tooltip content="Отозвать">
          <IconButton
            aria-label="Отозвать"
            variant="destructive"
            onClick={() => onRevoke(row.original)}
          >
            <Ban size={15} />
          </IconButton>
        </Tooltip>
      ),
  }),
];

export const AdminApiKeysContent: FC = observer(() => {
  const { keys, revoke, onCreated } = useAdminApiKeysVM();
  const columns = useMemo(() => createColumns(revoke), [revoke]);

  return (
    <>
      <div>
        <CreateApiKeyButton onCreated={onCreated} />
      </div>
      <Table
        className="min-h-0 flex-initial"
        stickyHeader
        data={keys.items}
        columns={columns}
        loading={keys.isLoading}
        refreshing={keys.isRefreshing}
        error={
          keys.error ? (
            <Empty size="sm" icon="error" title={keys.error.message} />
          ) : undefined
        }
        labels={{ empty: "Ключей пока нет" }}
        getRowId={k => k.id}
        aria-label="API-ключи"
      />
      {keys.pageCount > 1 && (
        <Pagination
          className="shrink-0 self-center"
          currentPage={keys.pagination.page}
          totalPages={keys.pageCount}
          disabled={keys.isBusy}
          onPageChange={page => keys.goToPage(page).then()}
        />
      )}
    </>
  );
});
