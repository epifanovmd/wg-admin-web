import type { Header } from "@tanstack/react-table";

import { stopRowClick } from "../utils";

interface TableResizeHandleProps<TData> {
  header: Header<TData, unknown>;
}

const HANDLE_CLASS =
  "absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent transition-colors hover:bg-primary/50 active:bg-primary";

export const TableResizeHandle = <TData,>({
  header,
}: TableResizeHandleProps<TData>) => {
  const resizeHandler = header.getResizeHandler();

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className={HANDLE_CLASS}
      onMouseDown={resizeHandler}
      onTouchStart={resizeHandler}
      onClick={stopRowClick}
    />
  );
};
