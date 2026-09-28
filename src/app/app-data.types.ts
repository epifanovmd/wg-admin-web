import { createInjectDecorator, SupportInitialize } from "@shared/lib/di";

export const IAppDataStore =
  createInjectDecorator<IAppDataStore>("IAppDataStore");

export type IAppDataStore = SupportInitialize;
