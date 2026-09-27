import { Button } from "@shared/ui";
import { RefreshCw } from "lucide-react";
import { FC } from "react";

interface NodeLogsRefreshButtonProps {
  loading: boolean;
  onLoad: () => void;
}

/** Обновление журнала агента — в строке вкладок, справа. */
export const NodeLogsRefreshButton: FC<NodeLogsRefreshButtonProps> = ({
  loading,
  onLoad,
}) => (
  <Button
    variant="outline"
    leftIcon={<RefreshCw size={15} />}
    loading={loading}
    onClick={onLoad}
  >
    Обновить
  </Button>
);
