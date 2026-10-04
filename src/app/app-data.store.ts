import { IAuthStore } from "@entities/auth";
import { IJobRealtime, IJobStore } from "@entities/job";
import { IUserRealtime, IUserStore } from "@entities/user";
import { IWgNodesStore } from "@entities/wg";
import { createDisposer } from "@shared/lib/di";
import { ISocketTransport } from "@shared/lib/socket";
import { injectable } from "inversify";
import { makeAutoObservable, reaction } from "mobx";

import { IAppDataStore } from "./app-data.types";
import { router } from "./router";

@injectable()
export class AppDataStore implements IAppDataStore {
  isRestored = false;

  constructor(
    @IAuthStore() private _authStore: IAuthStore,
    @ISocketTransport() private _socketTransport: ISocketTransport,
    @IUserRealtime() private _userRealtime: IUserRealtime,
    @IUserStore() private _userStore: IUserStore,
    @IJobRealtime() private _jobRealtime: IJobRealtime,
    @IJobStore() private _jobStore: IJobStore,
    @IWgNodesStore() private _nodesStore: IWgNodesStore,
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  initialize() {
    const disposers = createDisposer();

    // Сессия — до роутера: его beforeLoad тогда синхронны, и редирект на вход
    // не попадает в гонку перехода (маршрут бросал undefined — пустой экран).
    if (this._authStore.isIdle) {
      this._authStore.restore().finally(this._markRestored);
    } else {
      this._markRestored();
    }

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
            // Данные прежнего пользователя (права, списки) не должны
            // пережить выход: следующий вход в этой вкладке — другой человек.
            this._userStore.reset();
            this._jobStore.reset();
            this._nodesStore.reset();

            router.navigate({ to: "/sign-in" });
          }
        },
      ),
      disposers.dispose,
    ];
  }

  private _markRestored() {
    this.isRestored = true;
  }
}
