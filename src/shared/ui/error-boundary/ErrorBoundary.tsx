import { Component, type ErrorInfo, type ReactNode } from "react";

import { ErrorFallback } from "./ErrorFallback";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Без обработчика ошибка логируется в консоль. */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Изменение любого ключа сбрасывает ошибку — например, путь при навигации. */
  resetKeys?: unknown[];
}

interface ErrorBoundaryState {
  error: Error | null;
}

const haveResetKeysChanged = (
  prev: unknown[] | undefined,
  next: unknown[] | undefined,
): boolean => {
  if (prev === next) return false;
  if (!prev || !next || prev.length !== next.length) return true;

  return prev.some((value, index) => !Object.is(value, next[index]));
};

/**
 * Брошенное значение — не обязательно Error: роутер в гонке перехода бросает
 * `undefined`. Такое значение граница записала бы как «ошибки нет», снова
 * отрендерила бы тех же детей и, получив ту же ошибку, пробросила бы её выше —
 * React размонтировал бы всё дерево.
 */
const toError = (value: unknown): Error =>
  value instanceof Error
    ? value
    : new Error(`Неизвестная ошибка: ${String(value)}`);

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error) };
  }

  componentDidCatch(thrown: unknown, info: ErrorInfo) {
    const error = toError(thrown);
    const { onError } = this.props;

    if (onError) {
      onError(error, info);

      return;
    }

    console.error(
      "[ErrorBoundary] Uncaught error:",
      error,
      info.componentStack,
    );
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.state.error &&
      haveResetKeysChanged(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { fallback, children } = this.props;

    if (!error) return children;

    if (typeof fallback === "function") return fallback(error, this.reset);

    if (fallback) return fallback;

    return <ErrorFallback error={error} onReset={this.reset} />;
  }
}
