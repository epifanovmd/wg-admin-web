import { Button } from "@shared/ui";
import { ErrorRouteComponent, useRouter } from "@tanstack/react-router";
import { AlertTriangle, RotateCw } from "lucide-react";

export const ErrorPage: ErrorRouteComponent = ({ error, reset }) => {
  const router = useRouter();

  const handleRetry = () => {
    reset?.();
    router.invalidate();
  };

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-semibold text-foreground">
          Что-то пошло не так
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          {error?.message ??
            "Произошла непредвиденная ошибка при загрузке страницы."}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.navigate({ to: "/" })}
        >
          На главную
        </Button>
        <Button
          size="sm"
          leftIcon={<RotateCw size={14} />}
          onClick={handleRetry}
        >
          Повторить
        </Button>
      </div>
    </div>
  );
};
