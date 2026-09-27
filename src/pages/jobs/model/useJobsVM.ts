import { IJobStore } from "@entities/job";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useEffect, useState } from "react";

export const useJobsVM = () => {
  const toast = INotificationService.useInstance();
  const jobs = IJobStore.useInstance();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    void jobs.load();
  }, [jobs]);

  const cancel = async (id: string) => {
    setCancellingId(id);

    const { error } = await jobs.cancel(id);

    setCancellingId(null);
    notifyApiError(toast, error);
  };

  return {
    jobs: jobs.jobs,
    isLoading: jobs.isLoading,
    error: jobs.error,
    cancellingId,
    cancel,
  };
};
