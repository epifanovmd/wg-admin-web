import { injectable } from "inversify";

import { INetworkStatusService } from "./network.types";

@injectable()
export class NetworkStatusService implements INetworkStatusService {
  get isOnline(): boolean {
    return navigator.onLine;
  }

  onOnline(callback: () => void): () => void {
    window.addEventListener("online", callback);

    return () => window.removeEventListener("online", callback);
  }

  onOffline(callback: () => void): () => void {
    window.addEventListener("offline", callback);

    return () => window.removeEventListener("offline", callback);
  }
}
