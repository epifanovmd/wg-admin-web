import { injectable } from "inversify";

import { IAppStateService } from "./app-state.types";

@injectable()
export class AppStateService implements IAppStateService {
  get isActive(): boolean {
    return document.visibilityState === "visible";
  }

  onChange(callback: (isActive: boolean) => void): () => void {
    const handler = () => callback(this.isActive);

    document.addEventListener("visibilitychange", handler);

    return () => document.removeEventListener("visibilitychange", handler);
  }
}
