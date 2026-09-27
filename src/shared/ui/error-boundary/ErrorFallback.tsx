import * as React from "react";

import { Button } from "../button";
import { Empty } from "../empty";

export interface ErrorFallbackProps {
  error: Error;
  onReset: () => void;
}

/** Стандартный экран ошибки для `ErrorBoundary`. */
export const ErrorFallback = ({ error, onReset }: ErrorFallbackProps) => (
  <Empty
    role="alert"
    icon="error"
    title="Что-то пошло не так"
    description={error.message}
    action={
      <Button type="button" variant="outline" size="sm" onClick={onReset}>
        Попробовать снова
      </Button>
    }
  />
);
