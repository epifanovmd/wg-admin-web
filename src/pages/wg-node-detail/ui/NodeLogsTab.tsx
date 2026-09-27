import { Alert, Skeleton } from "@shared/ui";
import { FC } from "react";

interface NodeLogsTabProps {
  logs: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Журнал агента на всю высоту вкладки; прежний текст виден, пока идёт
 * обновление.
 */
export const NodeLogsTab: FC<NodeLogsTabProps> = ({ logs, loading, error }) => (
  <div className="flex min-h-0 flex-1 flex-col gap-3">
    {error && <Alert variant="destructive">{error}</Alert>}
    {logs !== null ? (
      <pre className="min-h-40 flex-1 overflow-auto rounded-lg bg-muted p-3 text-xs">
        {logs}
      </pre>
    ) : (
      loading && <Skeleton className="min-h-40 flex-1" />
    )}
  </div>
);
