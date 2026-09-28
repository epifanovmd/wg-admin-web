import { useLatestRef } from "@shared/lib/hooks";
import { Empty, Table } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC, useMemo } from "react";

import type { WgForwardsVM } from "../model/useWgForwardsVM";
import { createForwardColumns } from "./createForwardColumns";

interface WgForwardsTableProps {
  vm: WgForwardsVM;
}

/** Таблица пробросов портов. */
export const WgForwardsTable: FC<WgForwardsTableProps> = observer(({ vm }) => {
  const vmRef = useLatestRef(vm);
  const { canUpdate, canDelete, forwards } = vm;
  const columns = useMemo(
    () => createForwardColumns({ canUpdate, canDelete, vm: vmRef }),
    [canUpdate, canDelete, vmRef],
  );

  return (
    <Table
      className="w-full flex-none"
      data={forwards.items}
      columns={columns}
      loading={forwards.isLoading}
      error={
        forwards.error ? (
          <Empty size="sm" icon="error" title={forwards.error.message} />
        ) : undefined
      }
      labels={{
        empty:
          "Пробросов пока нет — например, UDP 51820 и TCP 8443 с релея на сервер через туннель",
      }}
      getRowId={forward => forward.id}
      aria-label="Пробросы портов"
    />
  );
});
