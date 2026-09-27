import {
  IProfileUpdateRequestDto,
  KnownPermission,
  KnownRole,
  ProfileDto,
  UserDto,
} from "@shared/api/gen/main/model";
import { createInjectDecorator, SupportInitialize } from "@shared/lib/di";
import { IEntityHolderResult, IHolderError } from "@shared/lib/holders";
import { ApiError, ApiResponse } from "@shared/lib/http";

import { ProfileModel } from "./profile-model";
import { UserModel } from "./user-model";

export const IUserStore = createInjectDecorator<IUserStore>();

/**
 * Доменный стор **текущего пользователя**: профиль, роли и эффективные
 * permissions. Отвечает только за данные авторизованного юзера — поток
 * аутентификации (вход/2FA/сессия) живёт в `IAuthStore`.
 */
export interface IUserStore {
  readonly user: UserDto | null;
  /** User-центричная view-модель (имя, инициалы, даты). */
  readonly model: UserModel | null;
  readonly profile: ProfileModel | null;
  readonly roles: KnownRole[];
  /** Объединение permissions из всех ролей и прямых permissions пользователя. */
  readonly permissions: KnownPermission[];
  readonly directPermissions: KnownPermission[];
  /** superadmin bypass (роль KnownRole.admin) */
  readonly isAdmin: boolean;
  readonly error: string | undefined;
  readonly isLoading: boolean;
  readonly isReady: boolean;

  /** Есть ли у пользователя указанный permission (через роль, напрямую, или wildcard-иерархия). */
  can(permission: KnownPermission | (string & {})): boolean;
  /** Есть ли у пользователя указанная роль. */
  hasRole(role: KnownRole): boolean;

  /** Мгновенно положить пользователя без запроса (например, из ответа login). */
  seed(user: UserDto): void;
  /** Точечно обновить поля текущего пользователя (например, из socket-события). */
  patchUser(patch: Partial<UserDto>): void;
  /** Точечно обновить профиль текущего пользователя. */
  patchProfile(patch: Partial<ProfileDto>): void;

  /**
   * Загрузить текущего пользователя с сервера. Если данные уже есть —
   * обновляет их «тихо» (не сбрасывая видимое состояние).
   */
  load(): Promise<IEntityHolderResult<UserDto, IHolderError>>;
  /** Принудительное фоновое обновление. */
  refresh(): Promise<IEntityHolderResult<UserDto, IHolderError>>;
  updateProfile(
    data: IProfileUpdateRequestDto,
  ): Promise<ApiResponse<ProfileDto, ApiError>>;

  setUsername(username: string): Promise<ApiResponse<UserDto, ApiError>>;
  /** Запрос смены email: код уходит на новый адрес, email меняется после подтверждения. */
  changeEmail(email: string): Promise<ApiResponse<UserDto, ApiError>>;
  confirmEmailChange(code: string): Promise<ApiResponse<UserDto, ApiError>>;
  /** Смена пароля; остальные сессии сервер завершает. */
  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<void, ApiError>>;
  /** Код подтверждения уходит на email. */
  requestVerifyEmail(): Promise<ApiResponse<void, ApiError>>;
  verifyEmail(code: string): Promise<ApiResponse<void, ApiError>>;

  reset(): void;

  /** Удалить свой аккаунт; нужен текущий пароль. */
  deleteMyAccount(password: string): Promise<ApiResponse<void, ApiError>>;
}

export const IUserRealtime = createInjectDecorator<IUserRealtime>();

/**
 * Realtime-мост: подписывается на socket-события текущего пользователя и
 * синхронизирует `IUserStore`/`ISessionStore` без поллинга. Запускается на
 * время авторизованной сессии (см. `AppDataStore.initialize`), `initialize()`
 * возвращает отписку.
 */
export type IUserRealtime = SupportInitialize;
