import { UserAvatar } from "@entities/user";
import { EditUserPrivilegesModal } from "@features/edit-user-privileges";
import { type UserDto } from "@shared/api/gen/main/model";
import { formatter } from "@shared/lib/utils";
import {
  Badge,
  createColumnHelper,
  Empty,
  IconButton,
  Input,
  Pagination,
  Table,
  Tooltip,
} from "@shared/ui";
import { Search, ShieldCheck, Trash2 } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC, useMemo } from "react";

import { useAdminUsersVM } from "../model/useAdminUsersVM";

interface ColumnActions {
  canManage: boolean;
  currentUserId?: string;
  onEdit: (user: UserDto) => void;
  onDelete: (user: UserDto) => void;
}

const column = createColumnHelper<UserDto>();

const displayName = (user: UserDto): string =>
  [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(" ") ||
  user.username ||
  user.email ||
  user.phone ||
  "Без имени";

const createColumns = ({
  canManage,
  currentUserId,
  onEdit,
  onDelete,
}: ColumnActions) => [
  column.display({
    id: "user",
    header: "Пользователь",
    cell: ({ row }) => {
      const user = row.original;
      const name = displayName(user);

      return (
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar name={name} size="md" />
          <div className="min-w-0">
            <p className="truncate font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email ?? user.phone ?? "—"}
              {user.username && ` · @${user.username}`}
            </p>
          </div>
        </div>
      );
    },
  }),
  column.display({
    id: "roles",
    header: "Роли и права",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.roles.map(role => (
          <Badge key={role.id} variant="secondary">
            {role.name}
          </Badge>
        ))}
        {row.original.directPermissions.map(p => (
          <Badge key={p.id} variant="outline">
            {p.name}
          </Badge>
        ))}
      </div>
    ),
  }),
  column.accessor("createdAt", {
    header: "Регистрация",
    size: 170,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatter.date.formatDate(getValue())}
      </span>
    ),
  }),
  column.display({
    id: "actions",
    size: 100,
    meta: { align: "right" },
    cell: ({ row }) =>
      canManage && row.original.id !== currentUserId ? (
        <div className="flex justify-end gap-1">
          <Tooltip content="Права">
            <IconButton aria-label="Права" onClick={() => onEdit(row.original)}>
              <ShieldCheck size={15} />
            </IconButton>
          </Tooltip>
          <Tooltip content="Удалить">
            <IconButton
              aria-label="Удалить"
              variant="destructive"
              onClick={() => onDelete(row.original)}
            >
              <Trash2 size={15} />
            </IconButton>
          </Tooltip>
        </div>
      ) : null,
  }),
];

export const AdminUsersContent: FC = observer(() => {
  const vm = useAdminUsersVM();
  const { users } = vm;
  const columns = useMemo(
    () =>
      createColumns({
        canManage: vm.canManage,
        currentUserId: vm.currentUserId,
        onEdit: vm.edit,
        onDelete: vm.remove,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vm.canManage, vm.currentUserId],
  );

  return (
    <>
      <Input
        value={vm.search}
        onChange={e => vm.setSearch(e.target.value)}
        placeholder="Поиск по email, имени, username"
        leftAddon={<Search size={15} />}
        className="w-full sm:w-80"
        clearable
        onClear={() => vm.setSearch("")}
      />
      <Table
        className="min-h-0 flex-initial"
        stickyHeader
        data={users.items}
        columns={columns}
        loading={users.isLoading}
        refreshing={users.isRefreshing}
        error={
          users.error ? (
            <Empty size="sm" icon="error" title={users.error.message} />
          ) : undefined
        }
        labels={{ empty: "Пользователи не найдены" }}
        getRowId={u => u.id}
        aria-label="Пользователи"
      />
      {users.pageCount > 1 && (
        <Pagination
          className="shrink-0 self-center"
          currentPage={users.pagination.page}
          totalPages={users.pageCount}
          disabled={users.isBusy}
          onPageChange={page => users.goToPage(page).then()}
        />
      )}
      <EditUserPrivilegesModal
        user={vm.editing}
        onClose={vm.closeEdit}
        onSaved={vm.onSaved}
      />
    </>
  );
});
