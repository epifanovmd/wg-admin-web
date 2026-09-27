import { SessionDto } from "@shared/api/gen/main/model";
import { createInjectDecorator } from "@shared/lib/di";
import {
  CollectionHolder,
  IHolderError,
  MutationHolder,
} from "@shared/lib/holders";
import { ApiError, ApiResponse } from "@shared/lib/http";

import { SessionModel } from "./session-model";

export const ISessionStore = createInjectDecorator<ISessionStore>();

export interface ISessionStore {
  sessionsHolder: CollectionHolder<SessionDto>;
  terminateMutation: MutationHolder<string>;

  sessions: SessionDto[];
  sessionModels: SessionModel[];
  isLoading: boolean;

  load(): Promise<void>;
  /** Завершить сессию; ошибка — `null`, если завершена. */
  terminateSession(sessionId: string): Promise<IHolderError | null>;
  terminateOtherSessions(): Promise<ApiResponse<void, ApiError>>;

  handleNewSession(session: SessionDto): void;
  handleSessionTerminated(sessionId: string): void;
}
