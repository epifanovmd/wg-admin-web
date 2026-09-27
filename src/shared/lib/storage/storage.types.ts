import { createInjectDecorator } from "@shared/lib/di";

export const IStorageService = createInjectDecorator<IStorageService>();

export interface IStorageService {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
