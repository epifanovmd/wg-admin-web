import * as React from "react";

export type AsyncClickHandler = (
  event: React.MouseEvent<HTMLButtonElement>,
) => Promise<void> | void;

export interface UseAsyncClickResult {
  loading: boolean;
  handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/** Кнопка сама показывает ожидание, пока обещание из `onClick` не завершится. */
export const useAsyncClick = (
  onClick: AsyncClickHandler | undefined,
  disabled: boolean,
): UseAsyncClickResult => {
  const [loading, setLoading] = React.useState(false);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleClick = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!onClick || disabled) {
        return;
      }

      setLoading(true);

      try {
        await onClick(event);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [disabled, onClick],
  );

  return { loading, handleClick };
};
