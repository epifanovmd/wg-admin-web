import * as React from "react";

/** Object URL файла на время жизни компонента; `null` — превью не нужно. */
export const useObjectUrl = (file: File | null): string | null => {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) {
      setUrl(null);

      return undefined;
    }

    const next = URL.createObjectURL(file);

    setUrl(next);

    return () => URL.revokeObjectURL(next);
  }, [file]);

  return url;
};
