import { IAuthStore } from "@entities/auth";
import { IJobRealtime, IJobStore } from "@entities/job";
import { IUserRealtime, IUserStore } from "@entities/user";
import { createDisposer } from "@shared/lib/di";
import { ISocketTransport } from "@shared/lib/socket";
import { injectable } from "inversify";
import { makeAutoObservable, reaction } from "mobx";

import { IAppDataStore } from "./app-data.types";
import { router } from "./router";

@injectable()
export class AppDataStore implements IAppDataStore {
  constructor(
    @IAuthStore() private _authStore: IAuthStore,
    @ISocketTransport() private _socketTransport: ISocketTransport,
    @IUserRealtime() private _userRealtime: IUserRealtime,
    @IUserStore() private _userStore: IUserStore,
    @IJobRealtime() private _jobRealtime: IJobRealtime,
    @IJobStore() private _jobStore: IJobStore,
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  initialize() {
    const disposers = createDisposer();

    return [
      reaction(
        () => this._authStore.isAuthenticated,
        isAuthenticated => {
          if (isAuthenticated) {
            this._userStore.load();

            disposers.add(
              this._socketTransport.initialize(),
              this._userRealtime.initialize(),
              this._jobRealtime.initialize(),
            );
          } else {
            disposers.dispose();
            this._jobStore.reset();

            router.navigate({ to: "/sign-in" });
          }
        },
      ),
      disposers.dispose,
    ];
  }
}
