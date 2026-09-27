import { AuditEventTable } from "@entities/audit";
import { Select } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { AUDIT_TYPE_OPTIONS, useAdminAuditVM } from "../model/useAdminAuditVM";

export const AdminAuditContent: FC = observer(() => {
  const vm = useAdminAuditVM();

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="w-full sm:w-64">
          <Select
            placeholder="Все события"
            options={AUDIT_TYPE_OPTIONS}
            value={vm.type}
            clearable
            onChange={vm.setType}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select
            placeholder="Все пользователи"
            options={vm.actorOptions}
            value={vm.actorId}
            search
            clearable
            onChange={vm.setActorId}
          />
        </div>
      </div>
      <AuditEventTable feed={vm.feed} actorName={vm.actorName} />
    </>
  );
});
