import { Button, Skeleton } from "@shared/ui";
import { LogOut } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useManageSessionsVM } from "../model/useManageSessionsVM";
import { SessionRow } from "./SessionRow";

/** Активные сессии: завершение по одной, всех остальных или выход везде. */
export const SessionList: FC = observer(() => {
  const {
    sessions,
    isLoading,
    isCurrent,
    terminatingId,
    terminate,
    terminateOthers,
    isTerminatingOthers,
    signOutAll,
  } = useManageSessionsVM();

  return (
    <div className="flex flex-col gap-4">
      {isLoading && sessions.length === 0 ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {sessions.map(session => (
            <SessionRow
              key={session.data.id}
              session={session}
              current={isCurrent(session.data.id)}
              terminating={terminatingId === session.data.id}
              onTerminate={terminate}
            />
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={sessions.length < 2}
          loading={isTerminatingOthers}
          onClick={() => terminateOthers()}
        >
          Завершить остальные
        </Button>
        <Button
          variant="destructive"
          leftIcon={<LogOut size={15} />}
          onClick={signOutAll}
        >
          Выйти на всех устройствах
        </Button>
      </div>
    </div>
  );
});
