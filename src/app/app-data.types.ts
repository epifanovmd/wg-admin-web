import { createInjectDecorator, SupportInitialize } from "@shared/lib/di";

export const IAppDataStore = createInjectDecorator<IAppDataStore>();

export type IAppDataStore = SupportInitialize;
