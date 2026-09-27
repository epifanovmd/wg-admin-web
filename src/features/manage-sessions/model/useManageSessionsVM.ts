import { IAuthStore } from "@entities/auth";
import { ISessionStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import { IAuthSessionGuard } from "@shared/lib/contracts";
import { useMutation } from "@shared/lib/holders";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useConfirm } from "@shared/ui";
import { useEffect, useState } from "react";

export const useManageSessionsVM = () => {
  const sessions = ISessionStore.useInstance();
  const auth = IAuthStore.useInstance();
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const confirm = useConfirm();
  const guard = IAuthSessionGuard.useInstance();
  const [terminatingId, setTerminatingId] = useState<string | null>(null);

  useEffect(() => {
    void sessions.load();
  }, [sessions]);

  const terminateOthers = useMutation<void, unknown>({
    mutationFn: () => sessions.terminateOtherSessions(),
    onSuccess: () => toast.success("Остальные сессии завершены"),
    onError: error => notifyApiError(toast, error),
  });

  const terminate = async (id: string) => {
    setTerminatingId(id);

    const error = await sessions.terminateSession(id);

    setTerminatingId(null);
    notifyApiError(toast, error);
  };

  const signOutAll = async () => {
    const ok = await confirm({
      title: "Выйти на всех устройствах?",
      description: "Все сессии, включая текущую, будут завершены.",
      confirmLabel: "Выйти везде",
      confirmVariant: "destructive",
    });

    if (!ok) return;

    const res = await api.signOutAll();

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    auth.signOut();
  };

  return {
    sessions: sessions.sessionModels,
    isLoading: sessions.isLoading,
    isCurrent: (id: string) => guard.isCurrentSession(id),
    terminatingId,
    terminate,
    terminateOthers: terminateOthers.mutate,
    isTerminatingOthers: terminateOthers.isLoading,
    signOutAll,
  };
};
