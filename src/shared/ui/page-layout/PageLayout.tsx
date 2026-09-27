import { cn } from "@shared/lib/utils";
import * as React from "react";

import { PAGE_CONTAINER_CLASS } from "./page-container";
import { PageLayoutToolbar } from "./PageLayoutToolbar";

export interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Шапка вне области прокрутки (обычно `PageHeader`). */
  header?: React.ReactNode;
  /** Короткая подводка над содержимым; вместе с `actions` — одна строка. */
  lead?: React.ReactNode;
  /** Действия страницы в строке подводки, справа. */
  actions?: React.ReactNode;
  /** Ширина и отступы содержимого: галерее нужна вся ширина, тексту — нет. */
  contentClassName?: string;
  /**
   * Содержимое — ровно по высоте экрана, без общей прокрутки страницы: для
   * таблиц с пагинацией (таблица прокручивается внутри, пагинация видна).
   */
  fill?: boolean;
}

const ROOT_CLASS = "flex h-full min-h-0 flex-col overflow-hidden";
const SCROLL_CLASS = "flex min-h-0 flex-1 flex-col overflow-auto";
// shrink-0: содержимое растёт вместе с контентом, а не сжимается до высоты
// прокрутки — иначе контент переливается за блок и нижний отступ теряется.
const CONTENT_CLASS =
  "flex flex-1 shrink-0 flex-col gap-3 p-3 pb-8 sm:p-6 sm:pb-10";
const FILL_CONTENT_CLASS = "flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-6";

/**
 * Полотно страницы: необязательная шапка вне прокрутки, строка подводки с
 * действиями и прокручиваемое содержимое по общей сетке ширины.
 */
const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  (
    {
      header,
      lead,
      actions,
      children,
      className,
      contentClassName,
      fill,
      ...props
    },
    ref,
  ) => {
    const hasToolbar = Boolean(lead || actions);

    return (
      <div ref={ref} className={cn(ROOT_CLASS, className)} {...props}>
        {header}
        <div className={SCROLL_CLASS}>
          <div
            className={cn(
              PAGE_CONTAINER_CLASS,
              fill ? FILL_CONTENT_CLASS : CONTENT_CLASS,
              contentClassName,
            )}
          >
            {hasToolbar && <PageLayoutToolbar lead={lead} actions={actions} />}
            {children}
          </div>
        </div>
      </div>
    );
  },
);

PageLayout.displayName = "PageLayout";

export { PageLayout };
