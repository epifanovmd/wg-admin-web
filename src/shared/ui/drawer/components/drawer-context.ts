import * as React from "react";

export type DrawerDirection = "top" | "bottom" | "left" | "right";

/** Сторона, с которой выезжает панель: задаётся в корне, читается содержимым. */
export const DrawerDirectionContext =
  React.createContext<DrawerDirection>("bottom");

export const useDrawerDirection = (): DrawerDirection =>
  React.useContext(DrawerDirectionContext);
