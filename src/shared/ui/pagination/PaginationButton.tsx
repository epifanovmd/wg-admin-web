import * as React from "react";

import { Button } from "../button";
import { type PaginationSize } from "./pagination.types";

export interface PaginationButtonProps {
  page: number;
  isActive: boolean;
  size: PaginationSize;
  disabled?: boolean;
  onClick: (page: number) => void;
}

export const PaginationButton = React.memo(
  ({ page, isActive, size, disabled, onClick }: PaginationButtonProps) => {
    const handleClick = () => onClick(page);

    return (
      <Button
        type="button"
        variant={isActive ? "primary" : "outline"}
        size={size}
        disabled={disabled}
        onClick={handleClick}
        aria-label={`Перейти на страницу ${page}`}
        aria-current={isActive ? "page" : undefined}
        className="min-w-10"
      >
        {page}
      </Button>
    );
  },
);

PaginationButton.displayName = "PaginationButton";
