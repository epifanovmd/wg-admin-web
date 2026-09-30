import type {
  ApiResponseDto,
  GetMyAuditParams,
  GetPasskeysParams,
  GetProfilesParams,
  GetSessionsParams,
  GetUserOptionsParams,
  GetUsersParams,
  GetWgSocksMacClientParams,
  IAddWgInterfaceReplicaBody,
  IAppVersionDto,
  IAssignWgEndpointBody,
  IAssignWgForwardBody,
  IAssignWgInterfaceBody,
  IAssignWgNodeBody,
  IAssignWgPeerBody,
  IAssignWgSocksBody,
  ICreateApiKeyBody,
  ICreateRoleRequestDto,
  ICreateWgEndpointBody,
  ICreateWgForwardBody,
  ICreateWgInterfaceBody,
  ICreateWgNodeBody,
  ICreateWgPeerBody,
  ICreateWgSocksBody,
  ICreateWgSocksClientBody,
  ICreateWgSocksUserBody,
  ICreatedApiKeyDto,
  ICreatedWgNodeDto,
  ICursorPageDtoAuditEventDto,
  IDisable2FARequestDto,
  IEnable2FARequestDto,
  IGenerateAuthenticationOptionsRequestDto,
  IMoveWgInterfaceBody,
  IPaginatedDtoApiKeyDto,
  IPaginatedDtoJobRunDto,
  IPaginatedDtoPasskeyDto,
  IPaginatedDtoSessionDto,
  IPaginatedDtoWgEndpointDto,
  IPaginatedDtoWgForwardDto,
  IPaginatedDtoWgInterfaceDto,
  IPaginatedDtoWgNodeDto,
  IPaginatedDtoWgPeerDto,
  IPermissionCatalogDto,
  IProfileListDto,
  IProfileUpdateRequestDto,
  IProvisionWgNodeBody,
  IRefreshRequestDto,
  IRoleDto,
  IRolePermissionsRequestDto,
  ISignInRequestDto,
  ISignInResponseDto,
  ITokensDto,
  IUninstallWgNodeBody,
  IUpdateWgEndpointBody,
  IUpdateWgForwardBody,
  IUpdateWgInterfaceBody,
  IUpdateWgNodeBody,
  IUpdateWgPeerBody,
  IUpdateWgSocksBody,
  IUpdateWgSocksUserBody,
  IUserAdminListDto,
  IUserChangePasswordDto,
  IUserConfirmEmailChangeDto,
  IUserDeleteDto,
  IUserLoginRequestDto,
  IUserOptionsDto,
  IUserPrivilegesRequestDto,
  IUserResetPasswordRequestDto,
  IUserUpdateRequestDto,
  IUserVerifyEmailDto,
  IUserWithTokensDto,
  IVerify2FARequestDto,
  IVerifyAuthenticationRequestDto,
  IVerifyAuthenticationResponseDto,
  IVerifyRegistrationRequestDto,
  IVerifyRegistrationResponseDto,
  IWgAgentCommandCompleteBody,
  IWgAgentCommandOutputBody,
  IWgAgentDesiredState,
  IWgAgentKeyDto,
  IWgAgentReleaseInfo,
  IWgAgentReportBody,
  IWgAgentStatsBody,
  IWgInterfaceLive,
  IWgLinkHealth,
  IWgMeshMatrix,
  IWgNodeLive,
  IWgNodeLogsDto,
  IWgNodeMetricPointDto,
  IWgOverview,
  IWgPeerLive,
  IWgPeerQrDto,
  IWgProvisionStartedDto,
  IWgSeriesDto,
  IWgSocksUserSecretDto,
  IWgSpeedPoint,
  JobRunDto,
  ListApiKeysParams,
  ListAuditEventsParams,
  ListJobsParams,
  ListWgEndpointsParams,
  ListWgForwardsParams,
  ListWgInterfacesParams,
  ListWgNodesParams,
  ListWgPeersParams,
  ListWgSocksParams,
  ProfileDto,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  PublicProfileDto,
  SetUsernameBody,
  TSignUpRequestDto,
  UserDto,
  Uuid,
  WgAgentStateParams,
  WgEndpointDto,
  WgEndpointOptionDto,
  WgEndpointOptionsParams,
  WgForwardDto,
  WgInterfaceDto,
  WgInterfaceOptionDto,
  WgInterfaceOptionsParams,
  WgNodeCommandDto,
  WgNodeDto,
  WgNodeLogsParams,
  WgNodeMetricsParams,
  WgNodeOptionDto,
  WgNodeOptionsParams,
  WgPeerDto,
  WgPeerOptionDto,
  WgPeerOptionsParams,
  WgSocksClientDto,
  WgSocksServiceDto,
  WgStatsSeriesParams,
} from "./model";

import { mainMutator } from "../../main/main.mutator.ts";
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const getWgAdmin = () => {
  /**
   * Выпустить API-ключ сервиса. Полный ключ (`key`) возвращается только в
   * этом ответе — сохраните его: в БД хранится лишь хеш.
   * @summary Создание API-ключа
   */
  const createApiKey = (
    iCreateApiKeyBody: ICreateApiKeyBody,
    options?: SecondParameter<typeof mainMutator<ICreatedApiKeyDto>>,
  ) => {
    return mainMutator<ICreatedApiKeyDto>(
      {
        url: `/api/v1/api-keys`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iCreateApiKeyBody,
      },
      options,
    );
  };

  /**
   * Все API-ключи, новые первыми. Секреты не возвращаются.
   * @summary Список API-ключей
   */
  const listApiKeys = (
    params?: ListApiKeysParams,
    options?: SecondParameter<typeof mainMutator<IPaginatedDtoApiKeyDto>>,
  ) => {
    return mainMutator<IPaginatedDtoApiKeyDto>(
      { url: `/api/v1/api-keys`, method: "GET", params },
      options,
    );
  };

  /**
   * Отозвать ключ: запросы с ним сразу получают 401. Повторный отзыв — 204.
   * @summary Отзыв API-ключа
   */
  const revokeApiKey = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/api-keys/${id}/revoke`, method: "POST" },
      options,
    );
  };

  /**
   * Каталог прав по группам с подписями — для редакторов ролей и прав
   * пользователей. Первая группа — «Система» (полный доступ `*`).
   * @summary Каталог прав
   */
  const getPermissionCatalog = (
    options?: SecondParameter<typeof mainMutator<IPermissionCatalogDto>>,
  ) => {
    return mainMutator<IPermissionCatalogDto>(
      { url: `/api/v1/permissions`, method: "GET" },
      options,
    );
  };

  /**
   * Создать ноду (VPS с агентом). Ключ агента возвращается только в этом
   * ответе — сохранить сразу. Создатель — автор запроса; владелец, отличный
   * от себя, — только с правом `wg:node:assign`.
   * @summary Создание ноды
   */
  const createWgNode = (
    iCreateWgNodeBody: ICreateWgNodeBody,
    options?: SecondParameter<typeof mainMutator<ICreatedWgNodeDto>>,
  ) => {
    return mainMutator<ICreatedWgNodeDto>(
      {
        url: `/api/v1/wg/nodes`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iCreateWgNodeBody,
      },
      options,
    );
  };

  /**
   * Ноды с фильтрами, новые первыми. С правом `wg:node:view:own` — только
   * свои (владелец или создатель).
   * @summary Список нод
   */
  const listWgNodes = (
    params?: ListWgNodesParams,
    options?: SecondParameter<typeof mainMutator<IPaginatedDtoWgNodeDto>>,
  ) => {
    return mainMutator<IPaginatedDtoWgNodeDto>(
      { url: `/api/v1/wg/nodes`, method: "GET", params },
      options,
    );
  };

  /**
   * Краткий список нод для выпадающих списков (в рамках прав).
   * @summary Ноды (options)
   */
  const wgNodeOptions = (
    params?: WgNodeOptionsParams,
    options?: SecondParameter<typeof mainMutator<WgNodeOptionDto[]>>,
  ) => {
    return mainMutator<WgNodeOptionDto[]>(
      { url: `/api/v1/wg/nodes/options`, method: "GET", params },
      options,
    );
  };

  /**
   * Нода по id; чужая без права на все ноды — 404.
   * @summary Нода
   */
  const getWgNode = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgNodeDto>>,
  ) => {
    return mainMutator<WgNodeDto>(
      { url: `/api/v1/wg/nodes/${id}`, method: "GET" },
      options,
    );
  };

  /**
   * Изменить ноду: переданные поля заменяются.
   * @summary Изменение ноды
   */
  const updateWgNode = (
    id: Uuid,
    iUpdateWgNodeBody: IUpdateWgNodeBody,
    options?: SecondParameter<typeof mainMutator<WgNodeDto>>,
  ) => {
    return mainMutator<WgNodeDto>(
      {
        url: `/api/v1/wg/nodes/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: iUpdateWgNodeBody,
      },
      options,
    );
  };

  /**
   * Удалить ноду; ключ агента отзывается. Нода с интерфейсами — 409.
   * @summary Удаление ноды
   */
  const deleteWgNode = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/wg/nodes/${id}`, method: "DELETE" },
      options,
    );
  };

  /**
   * Назначить владельца ноды (она станет для него своей).
   * @summary Назначение владельца ноды
   */
  const assignWgNode = (
    id: Uuid,
    iAssignWgNodeBody: IAssignWgNodeBody,
    options?: SecondParameter<typeof mainMutator<WgNodeDto>>,
  ) => {
    return mainMutator<WgNodeDto>(
      {
        url: `/api/v1/wg/nodes/${id}/assign`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iAssignWgNodeBody,
      },
      options,
    );
  };

  /**
   * Снять владельца ноды.
   * @summary Снятие владельца ноды
   */
  const revokeWgNode = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgNodeDto>>,
  ) => {
    return mainMutator<WgNodeDto>(
      { url: `/api/v1/wg/nodes/${id}/revoke`, method: "POST" },
      options,
    );
  };

  /**
   * Перевыпустить ключ агента: старый отзывается сразу, новый возвращается
   * один раз.
   * @summary Ротация ключа агента
   */
  const rotateWgAgentKey = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<IWgAgentKeyDto>>,
  ) => {
    return mainMutator<IWgAgentKeyDto>(
      { url: `/api/v1/wg/nodes/${id}/agent-key`, method: "POST" },
      options,
    );
  };

  /**
   * Последние строки журнала агента ноды (синхронно, через команду агенту).
   * @summary Журнал агента
   */
  const wgNodeLogs = (
    id: Uuid,
    params?: WgNodeLogsParams,
    options?: SecondParameter<typeof mainMutator<IWgNodeLogsDto>>,
  ) => {
    return mainMutator<IWgNodeLogsDto>(
      { url: `/api/v1/wg/nodes/${id}/logs`, method: "GET", params },
      options,
    );
  };

  /**
   * Создать точку подключения — стабильный адрес для клиентских конфигов
   * (напрямую или через релей-ноду, видимую автору). Создатель — автор
   * запроса; владелец, отличный от себя, — только с правом
   * `wg:endpoint:assign`.
   * @summary Создание точки подключения
   */
  const createWgEndpoint = (
    iCreateWgEndpointBody: ICreateWgEndpointBody,
    options?: SecondParameter<typeof mainMutator<WgEndpointDto>>,
  ) => {
    return mainMutator<WgEndpointDto>(
      {
        url: `/api/v1/wg/endpoints`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iCreateWgEndpointBody,
      },
      options,
    );
  };

  /**
   * Точки подключения, новые первыми. С правом `wg:endpoint:view:own` —
   * только свои (владелец или создатель).
   * @summary Список точек подключения
   */
  const listWgEndpoints = (
    params?: ListWgEndpointsParams,
    options?: SecondParameter<typeof mainMutator<IPaginatedDtoWgEndpointDto>>,
  ) => {
    return mainMutator<IPaginatedDtoWgEndpointDto>(
      { url: `/api/v1/wg/endpoints`, method: "GET", params },
      options,
    );
  };

  /**
   * Краткий список для выпадающих списков (в рамках прав).
   * @summary Точки подключения (options)
   */
  const wgEndpointOptions = (
    params?: WgEndpointOptionsParams,
    options?: SecondParameter<typeof mainMutator<WgEndpointOptionDto[]>>,
  ) => {
    return mainMutator<WgEndpointOptionDto[]>(
      { url: `/api/v1/wg/endpoints/options`, method: "GET", params },
      options,
    );
  };

  /**
   * Точка подключения по id; чужая без права на все точки — 404.
   * @summary Точка подключения
   */
  const getWgEndpoint = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgEndpointDto>>,
  ) => {
    return mainMutator<WgEndpointDto>(
      { url: `/api/v1/wg/endpoints/${id}`, method: "GET" },
      options,
    );
  };

  /**
   * Изменить точку подключения; смена хоста/релея применяется к нодам
   * автоматически, клиентские конфиги перевыпускать не нужно. Новый релей
   * должен быть виден автору.
   * @summary Изменение точки подключения
   */
  const updateWgEndpoint = (
    id: Uuid,
    iUpdateWgEndpointBody: IUpdateWgEndpointBody,
    options?: SecondParameter<typeof mainMutator<WgEndpointDto>>,
  ) => {
    return mainMutator<WgEndpointDto>(
      {
        url: `/api/v1/wg/endpoints/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: iUpdateWgEndpointBody,
      },
      options,
    );
  };

  /**
   * Удалить точку подключения; используемая интерфейсами — 409.
   * @summary Удаление точки подключения
   */
  const deleteWgEndpoint = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/wg/endpoints/${id}`, method: "DELETE" },
      options,
    );
  };

  /**
   * Назначить владельца точки подключения (она станет для него своей).
   * @summary Назначение владельца точки
   */
  const assignWgEndpoint = (
    id: Uuid,
    iAssignWgEndpointBody: IAssignWgEndpointBody,
    options?: SecondParameter<typeof mainMutator<WgEndpointDto>>,
  ) => {
    return mainMutator<WgEndpointDto>(
      {
        url: `/api/v1/wg/endpoints/${id}/assign`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iAssignWgEndpointBody,
      },
      options,
    );
  };

  /**
   * Снять владельца точки подключения.
   * @summary Снятие владельца точки
   */
  const revokeWgEndpoint = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgEndpointDto>>,
  ) => {
    return mainMutator<WgEndpointDto>(
      { url: `/api/v1/wg/endpoints/${id}/revoke`, method: "POST" },
      options,
    );
  };

  /**
   * Создать WireGuard-интерфейс на ноде; ключи генерируются на сервере,
   * приватный ключ хранится зашифрованным. Нода должна быть видна автору;
   * создатель — автор запроса, владелец, отличный от себя, — только с правом
   * `wg:interface:assign`. Произвольные PostUp/PostDown — с правом
   * `wg:interface:hooks`.
   * @summary Создание интерфейса
   */
  const createWgInterface = (
    iCreateWgInterfaceBody: ICreateWgInterfaceBody,
    options?: SecondParameter<typeof mainMutator<WgInterfaceDto>>,
  ) => {
    return mainMutator<WgInterfaceDto>(
      {
        url: `/api/v1/wg/interfaces`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iCreateWgInterfaceBody,
      },
      options,
    );
  };

  /**
   * Интерфейсы с фильтрами (с копиями), новые первыми. `nodeId` — основная
   * нода, `hostNodeId` — нода, где интерфейс работает (основная или копия).
   * `viaRelay` — только
   * интерфейсы за точками через релей: что и куда пересылают релеи. С правом
   * `wg:interface:view:own` — только свои (владелец или создатель).
   * @summary Список интерфейсов
   */
  const listWgInterfaces = (
    params?: ListWgInterfacesParams,
    options?: SecondParameter<typeof mainMutator<IPaginatedDtoWgInterfaceDto>>,
  ) => {
    return mainMutator<IPaginatedDtoWgInterfaceDto>(
      { url: `/api/v1/wg/interfaces`, method: "GET", params },
      options,
    );
  };

  /**
   * Краткий список интерфейсов для выпадающих списков (в рамках прав).
   * @summary Интерфейсы (options)
   */
  const wgInterfaceOptions = (
    params?: WgInterfaceOptionsParams,
    options?: SecondParameter<typeof mainMutator<WgInterfaceOptionDto[]>>,
  ) => {
    return mainMutator<WgInterfaceOptionDto[]>(
      { url: `/api/v1/wg/interfaces/options`, method: "GET", params },
      options,
    );
  };

  /**
   * Интерфейс по id; чужой без права на все интерфейсы — 404.
   * @summary Интерфейс
   */
  const getWgInterface = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgInterfaceDto>>,
  ) => {
    return mainMutator<WgInterfaceDto>(
      { url: `/api/v1/wg/interfaces/${id}`, method: "GET" },
      options,
    );
  };

  /**
   * Изменить интерфейс: переданные поля заменяются; агент применяет
   * конфигурацию автоматически.
   * @summary Изменение интерфейса
   */
  const updateWgInterface = (
    id: Uuid,
    iUpdateWgInterfaceBody: IUpdateWgInterfaceBody,
    options?: SecondParameter<typeof mainMutator<WgInterfaceDto>>,
  ) => {
    return mainMutator<WgInterfaceDto>(
      {
        url: `/api/v1/wg/interfaces/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: iUpdateWgInterfaceBody,
      },
      options,
    );
  };

  /**
   * Удалить интерфейс; с пирами — 409.
   * @summary Удаление интерфейса
   */
  const deleteWgInterface = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/wg/interfaces/${id}`, method: "DELETE" },
      options,
    );
  };

  /**
   * Включить интерфейс (агент поднимет его).
   * @summary Включение интерфейса
   */
  const enableWgInterface = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgInterfaceDto>>,
  ) => {
    return mainMutator<WgInterfaceDto>(
      { url: `/api/v1/wg/interfaces/${id}/enable`, method: "POST" },
      options,
    );
  };

  /**
   * Выключить интерфейс (агент опустит его, пиры отключатся).
   * @summary Выключение интерфейса
   */
  const disableWgInterface = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgInterfaceDto>>,
  ) => {
    return mainMutator<WgInterfaceDto>(
      { url: `/api/v1/wg/interfaces/${id}/disable`, method: "POST" },
      options,
    );
  };

  /**
   * Перенести интерфейс с ключом и пирами на другую ноду (видимую автору).
   * С точкой подключения клиентские конфиги не меняются; без неё меняется
   * адрес подключения (publicHost новой ноды).
   * @summary Перенос интерфейса на другую ноду
   */
  const moveWgInterface = (
    id: Uuid,
    iMoveWgInterfaceBody: IMoveWgInterfaceBody,
    options?: SecondParameter<typeof mainMutator<WgInterfaceDto>>,
  ) => {
    return mainMutator<WgInterfaceDto>(
      {
        url: `/api/v1/wg/interfaces/${id}/move`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iMoveWgInterfaceBody,
      },
      options,
    );
  };

  /**
   * Скопировать интерфейс на ноду (видимую автору): тот же ключ, адреса и
   * всегда те же пиры. Релей точки подключения держит туннели до всех копий
   * и переключает трафик (авто по здоровью или закреплённая копия —
   * `activeReplicaNodeId`).
   * @summary Реплика интерфейса на ноде
   */
  const addWgInterfaceReplica = (
    id: Uuid,
    iAddWgInterfaceReplicaBody: IAddWgInterfaceReplicaBody,
    options?: SecondParameter<typeof mainMutator<WgInterfaceDto>>,
  ) => {
    return mainMutator<WgInterfaceDto>(
      {
        url: `/api/v1/wg/interfaces/${id}/replicas`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iAddWgInterfaceReplicaBody,
      },
      options,
    );
  };

  /**
   * Убрать реплику: агент ноды снимет интерфейс.
   * @summary Удаление реплики интерфейса
   */
  const removeWgInterfaceReplica = (
    id: Uuid,
    nodeId: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      {
        url: `/api/v1/wg/interfaces/${id}/replicas/${nodeId}`,
        method: "DELETE",
      },
      options,
    );
  };

  /**
   * Перезапустить интерфейс на ноде (`wg-quick down && up`).
   * @summary Перезапуск интерфейса
   */
  const restartWgInterface = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgNodeCommandDto>>,
  ) => {
    return mainMutator<WgNodeCommandDto>(
      { url: `/api/v1/wg/interfaces/${id}/restart`, method: "POST" },
      options,
    );
  };

  /**
   * Назначить владельца интерфейса (он станет для него своим).
   * @summary Назначение владельца интерфейса
   */
  const assignWgInterface = (
    id: Uuid,
    iAssignWgInterfaceBody: IAssignWgInterfaceBody,
    options?: SecondParameter<typeof mainMutator<WgInterfaceDto>>,
  ) => {
    return mainMutator<WgInterfaceDto>(
      {
        url: `/api/v1/wg/interfaces/${id}/assign`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iAssignWgInterfaceBody,
      },
      options,
    );
  };

  /**
   * Снять владельца интерфейса.
   * @summary Снятие владельца интерфейса
   */
  const revokeWgInterface = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgInterfaceDto>>,
  ) => {
    return mainMutator<WgInterfaceDto>(
      { url: `/api/v1/wg/interfaces/${id}/revoke`, method: "POST" },
      options,
    );
  };

  /**
   * Создать пира: ключи и IP выделяются автоматически; `publicKey` — импорт
   * существующего клиента (его приватный ключ не хранится).
   * @summary Создание пира
   */
  const createWgPeer = (
    iCreateWgPeerBody: ICreateWgPeerBody,
    options?: SecondParameter<typeof mainMutator<WgPeerDto>>,
  ) => {
    return mainMutator<WgPeerDto>(
      {
        url: `/api/v1/wg/peers`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iCreateWgPeerBody,
      },
      options,
    );
  };

  /**
   * Пиры с фильтрами. С правом `wg:peer:view:own` — только свои пиры
   * (держатель или создатель).
   * @summary Список пиров
   */
  const listWgPeers = (
    params?: ListWgPeersParams,
    options?: SecondParameter<typeof mainMutator<IPaginatedDtoWgPeerDto>>,
  ) => {
    return mainMutator<IPaginatedDtoWgPeerDto>(
      { url: `/api/v1/wg/peers`, method: "GET", params },
      options,
    );
  };

  /**
   * Краткий список пиров для выпадающих списков (в рамках прав).
   * @summary Пиры (options)
   */
  const wgPeerOptions = (
    params?: WgPeerOptionsParams,
    options?: SecondParameter<typeof mainMutator<WgPeerOptionDto[]>>,
  ) => {
    return mainMutator<WgPeerOptionDto[]>(
      { url: `/api/v1/wg/peers/options`, method: "GET", params },
      options,
    );
  };

  /**
   * Пир по id; чужой без права на все пиры — 404.
   * @summary Пир
   */
  const getWgPeer = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgPeerDto>>,
  ) => {
    return mainMutator<WgPeerDto>(
      { url: `/api/v1/wg/peers/${id}`, method: "GET" },
      options,
    );
  };

  /**
   * Изменить пира: переданные поля заменяются.
   * @summary Изменение пира
   */
  const updateWgPeer = (
    id: Uuid,
    iUpdateWgPeerBody: IUpdateWgPeerBody,
    options?: SecondParameter<typeof mainMutator<WgPeerDto>>,
  ) => {
    return mainMutator<WgPeerDto>(
      {
        url: `/api/v1/wg/peers/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: iUpdateWgPeerBody,
      },
      options,
    );
  };

  /**
   * Удалить пира; агент снимет его с интерфейса.
   * @summary Удаление пира
   */
  const deleteWgPeer = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/wg/peers/${id}`, method: "DELETE" },
      options,
    );
  };

  /**
   * Включить пира.
   * @summary Включение пира
   */
  const enableWgPeer = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgPeerDto>>,
  ) => {
    return mainMutator<WgPeerDto>(
      { url: `/api/v1/wg/peers/${id}/enable`, method: "POST" },
      options,
    );
  };

  /**
   * Выключить пира.
   * @summary Выключение пира
   */
  const disableWgPeer = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgPeerDto>>,
  ) => {
    return mainMutator<WgPeerDto>(
      { url: `/api/v1/wg/peers/${id}/disable`, method: "POST" },
      options,
    );
  };

  /**
   * Перевыпустить preshared-ключ; клиенту нужен новый конфиг.
   * @summary Ротация PSK
   */
  const rotateWgPeerPsk = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgPeerDto>>,
  ) => {
    return mainMutator<WgPeerDto>(
      { url: `/api/v1/wg/peers/${id}/psk/rotate`, method: "POST" },
      options,
    );
  };

  /**
   * Убрать preshared-ключ; клиенту нужен новый конфиг.
   * @summary Удаление PSK
   */
  const removeWgPeerPsk = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgPeerDto>>,
  ) => {
    return mainMutator<WgPeerDto>(
      { url: `/api/v1/wg/peers/${id}/psk`, method: "DELETE" },
      options,
    );
  };

  /**
   * Назначить пира пользователю (он увидит его в «Моих пирах»).
   * @summary Назначение пира
   */
  const assignWgPeer = (
    id: Uuid,
    iAssignWgPeerBody: IAssignWgPeerBody,
    options?: SecondParameter<typeof mainMutator<WgPeerDto>>,
  ) => {
    return mainMutator<WgPeerDto>(
      {
        url: `/api/v1/wg/peers/${id}/assign`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iAssignWgPeerBody,
      },
      options,
    );
  };

  /**
   * Отвязать пира от пользователя.
   * @summary Отвязка пира
   */
  const revokeWgPeer = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgPeerDto>>,
  ) => {
    return mainMutator<WgPeerDto>(
      { url: `/api/v1/wg/peers/${id}/revoke`, method: "POST" },
      options,
    );
  };

  /**
   * Клиентский конфиг `.conf` (attachment).
   * @summary Конфиг пира
   */
  const wgPeerConfig = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<string>>,
  ) => {
    return mainMutator<string>(
      { url: `/api/v1/wg/peers/${id}/config`, method: "GET" },
      options,
    );
  };

  /**
   * QR-код клиентского конфига (PNG data-URL).
   * @summary QR пира
   */
  const wgPeerQr = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<IWgPeerQrDto>>,
  ) => {
    return mainMutator<IWgPeerQrDto>(
      { url: `/api/v1/wg/peers/${id}/qr`, method: "GET" },
      options,
    );
  };

  /**
   * Сводка дашборда: с правом `wg:stats:view` — глобальная, с
   * `wg:stats:view:own` — по своим пирам (держатель или создатель).
   * @summary Сводка
   */
  const wgStatsOverview = (
    options?: SecondParameter<typeof mainMutator<IWgOverview>>,
  ) => {
    return mainMutator<IWgOverview>(
      { url: `/api/v1/wg/stats/overview`, method: "GET" },
      options,
    );
  };

  /**
   * Серии скорости/трафика с фильтрами и группировкой. Диапазон по
   * умолчанию — последние 24 часа; шаг подбирается автоматически
   * (минуты, свыше 48 часов — часы). Без права `wg:stats:view`
   * возвращаются только собственные пиры.
   * @summary Серии статистики
   */
  const wgStatsSeries = (
    params?: WgStatsSeriesParams,
    options?: SecondParameter<typeof mainMutator<IWgSeriesDto[]>>,
  ) => {
    return mainMutator<IWgSeriesDto[]>(
      { url: `/api/v1/wg/stats/series`, method: "GET", params },
      options,
    );
  };

  /**
   * Текущий live-снимок пира (для первой отрисовки, дальше — сокет).
   * Держатель видит свои пиры; `null` — агент ещё не присылал статистику.
   * @summary Текущий снимок пира
   */
  const wgStatsCurrentPeer = (
    peerId: Uuid,
    options?: SecondParameter<typeof mainMutator<IWgPeerLive | null>>,
  ) => {
    return mainMutator<IWgPeerLive | null>(
      { url: `/api/v1/wg/stats/current/peer/${peerId}`, method: "GET" },
      options,
    );
  };

  /**
   * Текущий live-снимок интерфейса. С областью «свои» — только свой
   * интерфейс (владелец или создатель).
   * @summary Текущий снимок интерфейса
   */
  const wgStatsCurrentInterface = (
    interfaceId: Uuid,
    options?: SecondParameter<typeof mainMutator<IWgInterfaceLive | null>>,
  ) => {
    return mainMutator<IWgInterfaceLive | null>(
      {
        url: `/api/v1/wg/stats/current/interface/${interfaceId}`,
        method: "GET",
      },
      options,
    );
  };

  /**
   * Текущий live-снимок ноды с системными метриками. С областью «свои» —
   * только своя нода (владелец или создатель).
   * @summary Текущий снимок ноды
   */
  const wgStatsCurrentNode = (
    nodeId: Uuid,
    options?: SecondParameter<typeof mainMutator<IWgNodeLive | null>>,
  ) => {
    return mainMutator<IWgNodeLive | null>(
      { url: `/api/v1/wg/stats/current/node/${nodeId}`, method: "GET" },
      options,
    );
  };

  /**
   * Скорость пира за последние минуты (для первой отрисовки графика,
   * дальше — сокет). Держатель видит свои пиры.
   * @summary Короткий ряд скорости пира
   */
  const wgStatsPeerWindow = (
    peerId: Uuid,
    options?: SecondParameter<typeof mainMutator<IWgSpeedPoint[]>>,
  ) => {
    return mainMutator<IWgSpeedPoint[]>(
      { url: `/api/v1/wg/stats/window/peer/${peerId}`, method: "GET" },
      options,
    );
  };

  /**
   * Скорость интерфейса за последние минуты. С областью «свои» — только
   * свой интерфейс.
   * @summary Короткий ряд скорости интерфейса
   */
  const wgStatsInterfaceWindow = (
    interfaceId: Uuid,
    options?: SecondParameter<typeof mainMutator<IWgSpeedPoint[]>>,
  ) => {
    return mainMutator<IWgSpeedPoint[]>(
      {
        url: `/api/v1/wg/stats/window/interface/${interfaceId}`,
        method: "GET",
      },
      options,
    );
  };

  /**
   * Скорость ноды за последние минуты. С областью «свои» — только своя нода.
   * @summary Короткий ряд скорости ноды
   */
  const wgStatsNodeWindow = (
    nodeId: Uuid,
    options?: SecondParameter<typeof mainMutator<IWgSpeedPoint[]>>,
  ) => {
    return mainMutator<IWgSpeedPoint[]>(
      { url: `/api/v1/wg/stats/window/node/${nodeId}`, method: "GET" },
      options,
    );
  };

  /**
   * Связность нод: RTT и потери между публичными адресами (пробы агентов
   * раз в ~60 с).
   * @summary Матрица связности нод
   */
  const wgStatsMesh = (
    options?: SecondParameter<typeof mainMutator<IWgMeshMatrix>>,
  ) => {
    return mainMutator<IWgMeshMatrix>(
      { url: `/api/v1/wg/stats/mesh`, method: "GET" },
      options,
    );
  };

  /**
   * Здоровье IPIP-туннелей ноды: RTT и потери по каждому линку релея. С
   * областью «свои» — только своя нода.
   * @summary Туннели ноды
   */
  const wgStatsNodeLinks = (
    nodeId: Uuid,
    options?: SecondParameter<typeof mainMutator<IWgLinkHealth[]>>,
  ) => {
    return mainMutator<IWgLinkHealth[]>(
      { url: `/api/v1/wg/stats/links/node/${nodeId}`, method: "GET" },
      options,
    );
  };

  /**
   * Системные метрики ноды (CPU, память, диск) за период. С
   * `wg:node:view:own` — только своя нода.
   * @summary Метрики ноды
   */
  const wgNodeMetrics = (
    params: WgNodeMetricsParams,
    options?: SecondParameter<typeof mainMutator<IWgNodeMetricPointDto[]>>,
  ) => {
    return mainMutator<IWgNodeMetricPointDto[]>(
      { url: `/api/v1/wg/stats/node-metrics`, method: "GET", params },
      options,
    );
  };

  /**
   * Получить все роли с их правами.
   * @summary Список ролей
   */
  const getRoles = (
    options?: SecondParameter<typeof mainMutator<IRoleDto[]>>,
  ) => {
    return mainMutator<IRoleDto[]>(
      { url: `/api/v1/roles`, method: "GET" },
      options,
    );
  };

  /**
   * Создать новую роль.
   * @summary Создание роли
   */
  const createRole = (
    iCreateRoleRequestDto: ICreateRoleRequestDto,
    options?: SecondParameter<typeof mainMutator<IRoleDto>>,
  ) => {
    return mainMutator<IRoleDto>(
      {
        url: `/api/v1/roles`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iCreateRoleRequestDto,
      },
      options,
    );
  };

  /**
   * Удалить роль. Системные роли (`admin`, `user`, `guest`) не удаляются,
   * собственную роль удаляет только суперпользователь.
   * @summary Удаление роли
   */
  const deleteRole = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/roles/${id}`, method: "DELETE" },
      options,
    );
  };

  /**
   * Установить права для роли.
   * Заменяет текущий набор прав роли указанным. Роль `admin`, право `*` и
   * собственную роль меняет только суперпользователь. Все пользователи роли
   * получают `user:privileges-changed` с новыми правами; их прежние
   * access-токены отклоняются (`AUTH_PRIVILEGES_CHANGED`), сессии остаются.
   * @summary Установка прав роли
   */
  const setRolePermissions = (
    id: Uuid,
    iRolePermissionsRequestDto: IRolePermissionsRequestDto,
    options?: SecondParameter<typeof mainMutator<IRoleDto>>,
  ) => {
    return mainMutator<IRoleDto>(
      {
        url: `/api/v1/roles/${id}/permissions`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: iRolePermissionsRequestDto,
      },
      options,
    );
  };

  /**
   * Новый прокси на ноде (видимой автору) со своим CA и серверным
   * сертификатом. Создатель — автор запроса; владелец, отличный от себя, —
   * только с правом `wg:socks:assign`.
   * @summary Создание прокси
   */
  const createWgSocks = (
    iCreateWgSocksBody: ICreateWgSocksBody,
    options?: SecondParameter<typeof mainMutator<WgSocksServiceDto>>,
  ) => {
    return mainMutator<WgSocksServiceDto>(
      {
        url: `/api/v1/wg/socks`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iCreateWgSocksBody,
      },
      options,
    );
  };

  /**
   * Прокси с пользователями, клиентами и live-показателями. С правом
   * `wg:socks:view:own` — только свои (владелец или создатель).
   * @summary Список прокси
   */
  const listWgSocks = (
    params?: ListWgSocksParams,
    options?: SecondParameter<typeof mainMutator<WgSocksServiceDto[]>>,
  ) => {
    return mainMutator<WgSocksServiceDto[]>(
      { url: `/api/v1/wg/socks`, method: "GET", params },
      options,
    );
  };

  /**
   * Прокси по id; чужой без права на все прокси — 404.
   * @summary Прокси
   */
  const getWgSocks = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgSocksServiceDto>>,
  ) => {
    return mainMutator<WgSocksServiceDto>(
      { url: `/api/v1/wg/socks/${id}`, method: "GET" },
      options,
    );
  };

  /**
   * @summary Изменение прокси
   */
  const updateWgSocks = (
    id: Uuid,
    iUpdateWgSocksBody: IUpdateWgSocksBody,
    options?: SecondParameter<typeof mainMutator<WgSocksServiceDto>>,
  ) => {
    return mainMutator<WgSocksServiceDto>(
      {
        url: `/api/v1/wg/socks/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: iUpdateWgSocksBody,
      },
      options,
    );
  };

  /**
   * @summary Удаление прокси
   */
  const deleteWgSocks = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/wg/socks/${id}`, method: "DELETE" },
      options,
    );
  };

  /**
   * Назначить владельца прокси (он станет для него своим).
   * @summary Назначение владельца прокси
   */
  const assignWgSocks = (
    id: Uuid,
    iAssignWgSocksBody: IAssignWgSocksBody,
    options?: SecondParameter<typeof mainMutator<WgSocksServiceDto>>,
  ) => {
    return mainMutator<WgSocksServiceDto>(
      {
        url: `/api/v1/wg/socks/${id}/assign`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iAssignWgSocksBody,
      },
      options,
    );
  };

  /**
   * Снять владельца прокси.
   * @summary Снятие владельца прокси
   */
  const revokeWgSocks = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgSocksServiceDto>>,
  ) => {
    return mainMutator<WgSocksServiceDto>(
      { url: `/api/v1/wg/socks/${id}/revoke`, method: "POST" },
      options,
    );
  };

  /**
   * Пользователь SOCKS5; без пароля — сгенерированный. Пароль — в ответе.
   * @summary Пользователь прокси
   */
  const addWgSocksUser = (
    id: Uuid,
    iCreateWgSocksUserBody: ICreateWgSocksUserBody,
    options?: SecondParameter<typeof mainMutator<IWgSocksUserSecretDto>>,
  ) => {
    return mainMutator<IWgSocksUserSecretDto>(
      {
        url: `/api/v1/wg/socks/${id}/users`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iCreateWgSocksUserBody,
      },
      options,
    );
  };

  /**
   * Включить/выключить пользователя или сменить пароль.
   * @summary Изменение пользователя прокси
   */
  const updateWgSocksUser = (
    id: Uuid,
    userId: Uuid,
    iUpdateWgSocksUserBody: IUpdateWgSocksUserBody,
    options?: SecondParameter<typeof mainMutator<IWgSocksUserSecretDto>>,
  ) => {
    return mainMutator<IWgSocksUserSecretDto>(
      {
        url: `/api/v1/wg/socks/${id}/users/${userId}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: iUpdateWgSocksUserBody,
      },
      options,
    );
  };

  /**
   * @summary Удаление пользователя прокси
   */
  const removeWgSocksUser = (
    id: Uuid,
    userId: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/wg/socks/${id}/users/${userId}`, method: "DELETE" },
      options,
    );
  };

  /**
   * Пароль пользователя (для настройки Telegram).
   * @summary Пароль пользователя прокси
   */
  const getWgSocksUserSecret = (
    id: Uuid,
    userId: Uuid,
    options?: SecondParameter<typeof mainMutator<IWgSocksUserSecretDto>>,
  ) => {
    return mainMutator<IWgSocksUserSecretDto>(
      { url: `/api/v1/wg/socks/${id}/users/${userId}/secret`, method: "GET" },
      options,
    );
  };

  /**
   * Новый клиентский сертификат (устройство).
   * @summary Клиент прокси
   */
  const issueWgSocksClient = (
    id: Uuid,
    iCreateWgSocksClientBody: ICreateWgSocksClientBody,
    options?: SecondParameter<typeof mainMutator<WgSocksClientDto>>,
  ) => {
    return mainMutator<WgSocksClientDto>(
      {
        url: `/api/v1/wg/socks/${id}/clients`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iCreateWgSocksClientBody,
      },
      options,
    );
  };

  /**
   * Отозвать сертификат: агент сразу перестаёт пускать устройство.
   * @summary Отзыв клиента прокси
   */
  const revokeWgSocksClient = (
    id: Uuid,
    clientId: Uuid,
    options?: SecondParameter<typeof mainMutator<WgSocksClientDto>>,
  ) => {
    return mainMutator<WgSocksClientDto>(
      {
        url: `/api/v1/wg/socks/${id}/clients/${clientId}/revoke`,
        method: "POST",
      },
      options,
    );
  };

  /**
   * Готовый клиент для macOS (zip): `install.sh` ставит stunnel, раскладывает
   * сертификаты и включает автозапуск; README — настройки для Telegram.
   * Без `userId` берётся первый включённый пользователь.
   * @summary Клиент прокси для Mac
   */
  const getWgSocksMacClient = (
    id: Uuid,
    clientId: Uuid,
    params?: GetWgSocksMacClientParams,
    options?: SecondParameter<typeof mainMutator<Blob>>,
  ) => {
    return mainMutator<Blob>(
      {
        url: `/api/v1/wg/socks/${id}/clients/${clientId}/mac`,
        method: "GET",
        params,
        responseType: "blob",
      },
      options,
    );
  };

  /**
   * Установить агента и WireGuard на VPS по SSH: docker, модули ядра,
   * ip_forward, контейнер агента со свежим ключом. Прогресс — в задаче
   * (`jobId`): комната `job` по сокету. SSH-данные используются один раз
   * и в открытом виде не сохраняются.
   * @summary Установка агента на VPS
   */
  const provisionWgNode = (
    id: Uuid,
    iProvisionWgNodeBody: IProvisionWgNodeBody,
    options?: SecondParameter<typeof mainMutator<IWgProvisionStartedDto>>,
  ) => {
    return mainMutator<IWgProvisionStartedDto>(
      {
        url: `/api/v1/wg/nodes/${id}/provision`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iProvisionWgNodeBody,
      },
      options,
    );
  };

  /**
   * Удалить агента с VPS: агент откатывает свои интерфейсы, туннели и
   * пробросы, контейнер и конфигурация удаляются, ключ отзывается. Ход — в
   * задаче (комната ноды).
   * @summary Удаление агента с ноды
   */
  const uninstallWgNode = (
    id: Uuid,
    iUninstallWgNodeBody: IUninstallWgNodeBody,
    options?: SecondParameter<typeof mainMutator<IWgProvisionStartedDto>>,
  ) => {
    return mainMutator<IWgProvisionStartedDto>(
      {
        url: `/api/v1/wg/nodes/${id}/uninstall`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iUninstallWgNodeBody,
      },
      options,
    );
  };

  /**
   * Создать проброс: релей, протокол и порт, цель (нода с агентом или
   * адрес), путь и режим маршрута. Релей и нода-цель должны быть видны
   * автору; создатель — автор запроса, владелец, отличный от себя, — только с
   * правом `wg:forward:assign`.
   * @summary Создание проброса
   */
  const createWgForward = (
    iCreateWgForwardBody: ICreateWgForwardBody,
    options?: SecondParameter<typeof mainMutator<WgForwardDto>>,
  ) => {
    return mainMutator<WgForwardDto>(
      {
        url: `/api/v1/wg/forwards`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iCreateWgForwardBody,
      },
      options,
    );
  };

  /**
   * Пробросы с активным маршрутом по отчётам агентов. С правом
   * `wg:forward:view:own` — только свои (владелец или создатель).
   * @summary Список пробросов
   */
  const listWgForwards = (
    params?: ListWgForwardsParams,
    options?: SecondParameter<typeof mainMutator<IPaginatedDtoWgForwardDto>>,
  ) => {
    return mainMutator<IPaginatedDtoWgForwardDto>(
      { url: `/api/v1/wg/forwards`, method: "GET", params },
      options,
    );
  };

  /**
   * Проброс по id; чужой без права на все пробросы — 404.
   * @summary Проброс
   */
  const getWgForward = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgForwardDto>>,
  ) => {
    return mainMutator<WgForwardDto>(
      { url: `/api/v1/wg/forwards/${id}`, method: "GET" },
      options,
    );
  };

  /**
   * Изменить проброс; в том числе переключить маршрут (auto / tunnel /
   * direct) — агент релея применит сразу. Новая нода-цель должна быть видна
   * автору.
   * @summary Изменение проброса
   */
  const updateWgForward = (
    id: Uuid,
    iUpdateWgForwardBody: IUpdateWgForwardBody,
    options?: SecondParameter<typeof mainMutator<WgForwardDto>>,
  ) => {
    return mainMutator<WgForwardDto>(
      {
        url: `/api/v1/wg/forwards/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: iUpdateWgForwardBody,
      },
      options,
    );
  };

  /**
   * @summary Удаление проброса
   */
  const deleteWgForward = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/wg/forwards/${id}`, method: "DELETE" },
      options,
    );
  };

  /**
   * Назначить владельца проброса (он станет для него своим).
   * @summary Назначение владельца проброса
   */
  const assignWgForward = (
    id: Uuid,
    iAssignWgForwardBody: IAssignWgForwardBody,
    options?: SecondParameter<typeof mainMutator<WgForwardDto>>,
  ) => {
    return mainMutator<WgForwardDto>(
      {
        url: `/api/v1/wg/forwards/${id}/assign`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iAssignWgForwardBody,
      },
      options,
    );
  };

  /**
   * Снять владельца проброса.
   * @summary Снятие владельца проброса
   */
  const revokeWgForward = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<WgForwardDto>>,
  ) => {
    return mainMutator<WgForwardDto>(
      { url: `/api/v1/wg/forwards/${id}/revoke`, method: "POST" },
      options,
    );
  };

  /**
   * Видимые задачи: свои, либо задачи scope (`scopeType` + `scopeId`), если
   * политика scope разрешает просмотр. Новые — первыми.
   * @summary Список задач
   */
  const listJobs = (
    params?: ListJobsParams,
    options?: SecondParameter<typeof mainMutator<IPaginatedDtoJobRunDto>>,
  ) => {
    return mainMutator<IPaginatedDtoJobRunDto>(
      { url: `/api/v1/jobs`, method: "GET", params },
      options,
    );
  };

  /**
   * Задача: статус, прогресс, хвост лога, результат или ошибка.
   * @summary Задача
   */
  const getJob = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<JobRunDto>>,
  ) => {
    return mainMutator<JobRunDto>(
      { url: `/api/v1/jobs/${id}`, method: "GET" },
      options,
    );
  };

  /**
   * Отменить задачу: ждущая снимается сразу, выполняющаяся получает сигнал
   * отмены. Завершённую отменить нельзя (409).
   * @summary Отмена задачи
   */
  const cancelJob = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/jobs/${id}/cancel`, method: "POST" },
      options,
    );
  };

  /**
   * Желаемое состояние ноды (long-poll): ответ приходит при изменении
   * конфигурации, появлении команд или по таймауту ожидания.
   * @summary Desired state (long-poll)
   */
  const wgAgentState = (
    params?: WgAgentStateParams,
    options?: SecondParameter<typeof mainMutator<IWgAgentDesiredState>>,
  ) => {
    return mainMutator<IWgAgentDesiredState>(
      { url: `/api/v1/wg-agent/state`, method: "GET", params },
      options,
    );
  };

  /**
   * Отчёт агента: применённая версия, ошибка применения, версии ПО,
   * сведения об ОС и фактические статусы интерфейсов.
   * @summary Отчёт о состоянии
   */
  const wgAgentReport = (
    iWgAgentReportBody: IWgAgentReportBody,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      {
        url: `/api/v1/wg-agent/state`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iWgAgentReportBody,
      },
      options,
    );
  };

  /**
   * Статистика `wg show all dump` и системные метрики хоста.
   * @summary Статистика
   */
  const wgAgentStats = (
    iWgAgentStatsBody: IWgAgentStatsBody,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      {
        url: `/api/v1/wg-agent/stats`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iWgAgentStatsBody,
      },
      options,
    );
  };

  /**
   * Агент взял команду в работу.
   * @summary Команда: взята
   */
  const wgAgentCommandAck = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/wg-agent/commands/${id}/ack`, method: "POST" },
      options,
    );
  };

  /**
   * Фрагмент вывода команды: дописывается в `output` команды (с пределом).
   * @summary Команда: вывод
   */
  const wgAgentCommandOutput = (
    id: Uuid,
    iWgAgentCommandOutputBody: IWgAgentCommandOutputBody,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      {
        url: `/api/v1/wg-agent/commands/${id}/output`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iWgAgentCommandOutputBody,
      },
      options,
    );
  };

  /**
   * Итог выполнения команды.
   * @summary Команда: завершена
   */
  const wgAgentCommandComplete = (
    id: Uuid,
    iWgAgentCommandCompleteBody: IWgAgentCommandCompleteBody,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      {
        url: `/api/v1/wg-agent/commands/${id}/complete`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iWgAgentCommandCompleteBody,
      },
      options,
    );
  };

  /**
   * Бинарь агента своей архитектуры (установка и команда `agent-update`):
   * sha256 — в заголовке `X-Agent-Sha256`, агент и установщик его сверяют.
   * @summary Бинарь агента
   */
  const wgAgentBinary = (
    arch: string,
    options?: SecondParameter<typeof mainMutator<Blob>>,
  ) => {
    return mainMutator<Blob>(
      {
        url: `/api/v1/wg-agent/binary/${arch}`,
        method: "GET",
        responseType: "blob",
      },
      options,
    );
  };

  /**
   * Установщик агента (sh) для ручной установки на сервер:
   * `curl -fsSL <бэкенд>/api/v1/wg-agent/install.sh | sudo sh -s -- --key <ключ>`.
   * Секретов не содержит — бинарь скачивается по ключу агента.
   * @summary Установщик агента
   */
  const wgAgentInstallScript = (
    options?: SecondParameter<typeof mainMutator<string>>,
  ) => {
    return mainMutator<string>(
      { url: `/api/v1/wg-agent/install.sh`, method: "GET" },
      options,
    );
  };

  /**
   * Версия агента, которую бэкенд может раздать, и sha256 бинарей. Нода с
   * другим `agentCodeHash` для своей архитектуры — кандидат на обновление.
   * @summary Доступная версия агента
   */
  const wgAgentRelease = (
    options?: SecondParameter<typeof mainMutator<IWgAgentReleaseInfo>>,
  ) => {
    return mainMutator<IWgAgentReleaseInfo>(
      { url: `/api/v1/wg/agent/release`, method: "GET" },
      options,
    );
  };

  /**
   * Обновить агента на ноде: агент скачает бинарь своей архитектуры,
   * сверит sha256 и перезапустится (не вышел на связь трижды — откат на
   * прежнюю версию). Архитектура ноды неизвестна или бинарь под неё не
   * собран — 404.
   * @summary Обновить агента
   */
  const updateWgAgent = (
    nodeId: Uuid,
    options?: SecondParameter<typeof mainMutator<WgNodeCommandDto>>,
  ) => {
    return mainMutator<WgNodeCommandDto>(
      { url: `/api/v1/wg/agent/nodes/${nodeId}/update`, method: "POST" },
      options,
    );
  };

  /**
   * Получить пользователя.
   * Этот эндпоинт позволяет получить данные пользователя, который выполнил запрос.
   * @summary Получение данных текущего пользователя
   */
  const getMyUser = (
    options?: SecondParameter<typeof mainMutator<UserDto>>,
  ) => {
    return mainMutator<UserDto>(
      { url: `/api/v1/user/my`, method: "GET" },
      options,
    );
  };

  /**
   * Обновить email и/или телефон текущего пользователя.
   * Телефон меняется сразу. Email — нет: создаётся запрос на смену, код
   * уходит на новый адрес, уведомление — на старый; адрес меняется после
   * `POST my/email/confirm`. Повторный запрос — не чаще раза в минуту (429).
   * Занятые email/телефон → 409 (`USER_EMAIL_TAKEN` / `USER_PHONE_TAKEN`).
   * @summary Обновление данных текущего пользователя
   */
  const updateMyUser = (
    iUserUpdateRequestDto: IUserUpdateRequestDto,
    options?: SecondParameter<typeof mainMutator<UserDto>>,
  ) => {
    return mainMutator<UserDto>(
      {
        url: `/api/v1/user/my/update`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: iUserUpdateRequestDto,
      },
      options,
    );
  };

  /**
   * Подтвердить смену email кодом из письма на новый адрес. Email
   * меняется и считается подтверждённым. Неверный код расходует попытку
   * (`USER_EMAIL_CHANGE_INVALID_CODE`, в `details.attemptsLeft` — остаток);
   * после 5 неверных или по истечении 15 минут запрос аннулируется.
   * @summary Подтверждение смены email
   */
  const confirmEmailChange = (
    iUserConfirmEmailChangeDto: IUserConfirmEmailChangeDto,
    options?: SecondParameter<typeof mainMutator<UserDto>>,
  ) => {
    return mainMutator<UserDto>(
      {
        url: `/api/v1/user/my/email/confirm`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iUserConfirmEmailChangeDto,
      },
      options,
    );
  };

  /**
   * Удалить текущего пользователя. Требуется текущий пароль.
   * POST, а не DELETE: тело DELETE-запроса не разбирается body-parser-ом.
   * @summary Удаление текущего пользователя
   */
  const deleteMyUser = (
    iUserDeleteDto: IUserDeleteDto,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      {
        url: `/api/v1/user/my/delete`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iUserDeleteDto,
      },
      options,
    );
  };

  /**
   * Установить username для текущего пользователя.
   * @summary Установка username
   */
  const setUsername = (
    setUsernameBody: SetUsernameBody,
    options?: SecondParameter<typeof mainMutator<UserDto>>,
  ) => {
    return mainMutator<UserDto>(
      {
        url: `/api/v1/user/my/username`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: setUsernameBody,
      },
      options,
    );
  };

  /**
   * Получить пользователей постранично (администрирование), новые первыми.
   * @summary Получение всех пользователей
   */
  const getUsers = (
    params?: GetUsersParams,
    options?: SecondParameter<typeof mainMutator<IUserAdminListDto>>,
  ) => {
    return mainMutator<IUserAdminListDto>(
      { url: `/api/v1/user/all`, method: "GET", params },
      options,
    );
  };

  /**
   * Получить опции пользователей для выпадающих списков (id + name).
   * name — имя и фамилия или email если профиль не заполнен.
   * @summary Опции пользователей
   */
  const getUserOptions = (
    params?: GetUserOptionsParams,
    options?: SecondParameter<typeof mainMutator<IUserOptionsDto>>,
  ) => {
    return mainMutator<IUserOptionsDto>(
      { url: `/api/v1/user/options`, method: "GET", params },
      options,
    );
  };

  /**
   * Получить пользователя по ID.
   * @summary Получение пользователя по ID
   */
  const getUserById = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<UserDto>>,
  ) => {
    return mainMutator<UserDto>(
      { url: `/api/v1/user/${id}`, method: "GET" },
      options,
    );
  };

  /**
   * Установить роли и прямые права пользователя.
   * Роли и права должны существовать. Свои привилегии менять нельзя; роль
   * `admin` и право `*` выдаёт только суперпользователь.
   * @summary Установка привилегий для пользователя
   */
  const setPrivileges = (
    id: Uuid,
    iUserPrivilegesRequestDto: IUserPrivilegesRequestDto,
    options?: SecondParameter<typeof mainMutator<UserDto>>,
  ) => {
    return mainMutator<UserDto>(
      {
        url: `/api/v1/user/setPrivileges/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: iUserPrivilegesRequestDto,
      },
      options,
    );
  };

  /**
   * Отправить код подтверждения на email текущего пользователя.
   * Повторная отправка — не чаще раза в минуту (429).
   * @summary Запрос подтверждения email
   */
  const requestVerifyEmail = (
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/user/verify-email/request`, method: "POST" },
      options,
    );
  };

  /**
   * Подтвердить email текущего пользователя кодом из письма.
   * @summary Подтверждение email-адреса
   */
  const verifyEmail = (
    iUserVerifyEmailDto: IUserVerifyEmailDto,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      {
        url: `/api/v1/user/verify-email`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iUserVerifyEmailDto,
      },
      options,
    );
  };

  /**
   * Обновить email/телефон другого пользователя — сразу, без подтверждения
   * кодом. Новый email сбрасывает `emailVerified`.
   * @summary Обновление другого пользователя
   */
  const updateUser = (
    id: Uuid,
    iUserUpdateRequestDto: IUserUpdateRequestDto,
    options?: SecondParameter<typeof mainMutator<UserDto>>,
  ) => {
    return mainMutator<UserDto>(
      {
        url: `/api/v1/user/update/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: iUserUpdateRequestDto,
      },
      options,
    );
  };

  /**
   * Изменить пароль текущего пользователя. Требуется текущий пароль;
   * остальные сессии завершаются, текущая остаётся.
   * @summary Изменение пароля
   */
  const changePassword = (
    iUserChangePasswordDto: IUserChangePasswordDto,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      {
        url: `/api/v1/user/changePassword`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iUserChangePasswordDto,
      },
      options,
    );
  };

  /**
   * Удалить другого пользователя. Себя и суперпользователя удалить нельзя.
   * @summary Удаление другого пользователя
   */
  const deleteUser = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/user/delete/${id}`, method: "DELETE" },
      options,
    );
  };

  /**
   * Получить список активных сессий пользователя (последние активные — первыми).
   * @summary Список сессий
   */
  const getSessions = (
    params?: GetSessionsParams,
    options?: SecondParameter<typeof mainMutator<IPaginatedDtoSessionDto>>,
  ) => {
    return mainMutator<IPaginatedDtoSessionDto>(
      { url: `/api/v1/session`, method: "GET", params },
      options,
    );
  };

  /**
   * Завершить конкретную сессию: её access-токен сразу перестаёт действовать.
   * @summary Завершение сессии
   */
  const terminateSession = (
    id: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/session/${id}`, method: "DELETE" },
      options,
    );
  };

  /**
   * Завершить все сессии, кроме текущей.
   * @summary Завершение остальных сессий
   */
  const terminateOtherSessions = (
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/session/terminate-others`, method: "POST" },
      options,
    );
  };

  /**
   * Получить профиль текущего пользователя.
   * Этот эндпоинт позволяет получить данные профиля пользователя, который выполнил запрос.
   * Используется для получения информации о текущем пользователе, например, его имени, email, и других данных.
   * @summary Получение профиля текущего пользователя
   */
  const getMyProfile = (
    options?: SecondParameter<typeof mainMutator<ProfileDto>>,
  ) => {
    return mainMutator<ProfileDto>(
      { url: `/api/v1/profile/my`, method: "GET" },
      options,
    );
  };

  /**
   * Обновить профиль текущего пользователя.
   * Этот эндпоинт позволяет пользователю обновить свои данные, такие как имя, email и другие параметры профиля.
   * @summary Обновление профиля текущего пользователя
   */
  const updateMyProfile = (
    iProfileUpdateRequestDto: IProfileUpdateRequestDto,
    options?: SecondParameter<typeof mainMutator<ProfileDto>>,
  ) => {
    return mainMutator<ProfileDto>(
      {
        url: `/api/v1/profile/my/update`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: iProfileUpdateRequestDto,
      },
      options,
    );
  };

  /**
   * Очистить профиль текущего пользователя.
   * Личные данные (имя, фамилия, дата рождения, пол) обнуляются,
   * сама запись профиля остаётся.
   * @summary Очистка профиля текущего пользователя
   */
  const deleteMyProfile = (
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/profile/my/delete`, method: "DELETE" },
      options,
    );
  };

  /**
   * Получить все профили постранично, новые первыми.
   * @summary Получение всех профилей
   */
  const getProfiles = (
    params?: GetProfilesParams,
    options?: SecondParameter<typeof mainMutator<IProfileListDto>>,
  ) => {
    return mainMutator<IProfileListDto>(
      { url: `/api/v1/profile/all`, method: "GET", params },
      options,
    );
  };

  /**
   * Получить профиль по ID.
   * Этот эндпоинт позволяет получить профиль другого пользователя по его ID. Доступен только для администраторов.
   * @summary Получение профиля по ID
   */
  const getProfileById = (
    userId: Uuid,
    options?: SecondParameter<typeof mainMutator<PublicProfileDto>>,
  ) => {
    return mainMutator<PublicProfileDto>(
      { url: `/api/v1/profile/${userId}`, method: "GET" },
      options,
    );
  };

  /**
   * Обновить профиль другого пользователя.
   * Этот эндпоинт позволяет администраторам обновлять профиль других пользователей.
   * @summary Обновление профиля другого пользователя
   */
  const updateProfile = (
    userId: Uuid,
    iProfileUpdateRequestDto: IProfileUpdateRequestDto,
    options?: SecondParameter<typeof mainMutator<ProfileDto>>,
  ) => {
    return mainMutator<ProfileDto>(
      {
        url: `/api/v1/profile/update/${userId}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: iProfileUpdateRequestDto,
      },
      options,
    );
  };

  /**
   * Очистить профиль другого пользователя.
   * Личные данные обнуляются, запись профиля остаётся.
   * @summary Очистка профиля другого пользователя
   */
  const deleteProfile = (
    userId: Uuid,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/profile/delete/${userId}`, method: "DELETE" },
      options,
    );
  };

  /**
   * Регистрация нового пользователя
   * @summary Регистрация
   */
  const signUp = (
    tSignUpRequestDto: TSignUpRequestDto,
    options?: SecondParameter<typeof mainMutator<IUserWithTokensDto>>,
  ) => {
    return mainMutator<IUserWithTokensDto>(
      {
        url: `/api/v1/auth/sign-up`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: tSignUpRequestDto,
      },
      options,
    );
  };

  /**
   * Авторизация пользователя
   * @summary Вход в систему
   */
  const signIn = (
    iSignInRequestDto: ISignInRequestDto,
    options?: SecondParameter<typeof mainMutator<ISignInResponseDto>>,
  ) => {
    return mainMutator<ISignInResponseDto>(
      {
        url: `/api/v1/auth/sign-in`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iSignInRequestDto,
      },
      options,
    );
  };

  /**
   * Запрос на сброс пароля
   * @summary Запрос сброса пароля
   */
  const requestResetPassword = (
    iUserLoginRequestDto: IUserLoginRequestDto,
    options?: SecondParameter<typeof mainMutator<ApiResponseDto>>,
  ) => {
    return mainMutator<ApiResponseDto>(
      {
        url: `/api/v1/auth/request-reset-password`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iUserLoginRequestDto,
      },
      options,
    );
  };

  /**
   * Сброс пароля
   * @summary Смена пароля
   */
  const resetPassword = (
    iUserResetPasswordRequestDto: IUserResetPasswordRequestDto,
    options?: SecondParameter<typeof mainMutator<ApiResponseDto>>,
  ) => {
    return mainMutator<ApiResponseDto>(
      {
        url: `/api/v1/auth/reset-password`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iUserResetPasswordRequestDto,
      },
      options,
    );
  };

  /**
   * Обновление токенов доступа
   * @summary Обновление токенов
   */
  const refresh = (
    iRefreshRequestDto: IRefreshRequestDto,
    options?: SecondParameter<typeof mainMutator<ITokensDto>>,
  ) => {
    return mainMutator<ITokensDto>(
      {
        url: `/api/v1/auth/refresh`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iRefreshRequestDto,
      },
      options,
    );
  };

  /**
   * Выйти из текущей сессии: сессия завершается, access-токен сразу
   * перестаёт действовать, cookie с refresh-токеном очищается.
   * @summary Выход
   */
  const signOut = (options?: SecondParameter<typeof mainMutator<void>>) => {
    return mainMutator<void>(
      { url: `/api/v1/auth/sign-out`, method: "POST" },
      options,
    );
  };

  /**
   * Выйти со всех устройств, включая текущее: все сессии завершаются,
   * их access-токены сразу перестают действовать.
   * @summary Выход со всех устройств
   */
  const signOutAll = (options?: SecondParameter<typeof mainMutator<void>>) => {
    return mainMutator<void>(
      { url: `/api/v1/auth/sign-out-all`, method: "POST" },
      options,
    );
  };

  /**
   * Включить двухфакторную аутентификацию. Требует текущий пароль аккаунта.
   * @summary Включение 2FA
   */
  const enable2FA = (
    iEnable2FARequestDto: IEnable2FARequestDto,
    options?: SecondParameter<typeof mainMutator<ApiResponseDto>>,
  ) => {
    return mainMutator<ApiResponseDto>(
      {
        url: `/api/v1/auth/enable-2fa`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iEnable2FARequestDto,
      },
      options,
    );
  };

  /**
   * Отключить двухфакторную аутентификацию. Требует текущий пароль аккаунта
   * и пароль 2FA.
   * @summary Отключение 2FA
   */
  const disable2FA = (
    iDisable2FARequestDto: IDisable2FARequestDto,
    options?: SecondParameter<typeof mainMutator<ApiResponseDto>>,
  ) => {
    return mainMutator<ApiResponseDto>(
      {
        url: `/api/v1/auth/disable-2fa`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iDisable2FARequestDto,
      },
      options,
    );
  };

  /**
   * Верифицировать 2FA и получить токены. Токен 2FA одноразовый; после
   * нескольких неверных паролей вход по 2FA временно блокируется.
   * @summary Верификация 2FA
   */
  const verify2FA = (
    iVerify2FARequestDto: IVerify2FARequestDto,
    options?: SecondParameter<typeof mainMutator<IUserWithTokensDto>>,
  ) => {
    return mainMutator<IUserWithTokensDto>(
      {
        url: `/api/v1/auth/verify-2fa`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iVerify2FARequestDto,
      },
      options,
    );
  };

  /**
   * Список passkeys текущего пользователя (новые — первыми).
   * @summary Мои passkeys
   */
  const getPasskeys = (
    params?: GetPasskeysParams,
    options?: SecondParameter<typeof mainMutator<IPaginatedDtoPasskeyDto>>,
  ) => {
    return mainMutator<IPaginatedDtoPasskeyDto>(
      { url: `/api/v1/passkeys`, method: "GET", params },
      options,
    );
  };

  /**
   * Удаляет passkey текущего пользователя.
   * @summary Удаление passkey
   */
  const deletePasskey = (
    id: string,
    options?: SecondParameter<typeof mainMutator<void>>,
  ) => {
    return mainMutator<void>(
      { url: `/api/v1/passkeys/${id}`, method: "DELETE" },
      options,
    );
  };

  /**
   * Генерирует параметры для регистрации нового passkey.
   * Требует авторизации — passkey привязывается к текущему пользователю.
   * @summary Параметры регистрации passkey
   */
  const generateRegistrationOptions = (
    options?: SecondParameter<
      typeof mainMutator<PublicKeyCredentialCreationOptionsJSON>
    >,
  ) => {
    return mainMutator<PublicKeyCredentialCreationOptionsJSON>(
      { url: `/api/v1/passkeys/generate-registration-options`, method: "POST" },
      options,
    );
  };

  /**
   * Верифицирует ответ устройства и сохраняет passkey для текущего пользователя.
   * @summary Верификация регистрации passkey
   */
  const verifyRegistration = (
    iVerifyRegistrationRequestDto: IVerifyRegistrationRequestDto,
    options?: SecondParameter<
      typeof mainMutator<IVerifyRegistrationResponseDto>
    >,
  ) => {
    return mainMutator<IVerifyRegistrationResponseDto>(
      {
        url: `/api/v1/passkeys/verify-registration`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iVerifyRegistrationRequestDto,
      },
      options,
    );
  };

  /**
   * Генерирует параметры для аутентификации по passkey.
   * Принимает login (email или телефон) пользователя.
   * @summary Параметры аутентификации passkey
   */
  const generateAuthenticationOptions = (
    iGenerateAuthenticationOptionsRequestDto: IGenerateAuthenticationOptionsRequestDto,
    options?: SecondParameter<
      typeof mainMutator<PublicKeyCredentialRequestOptionsJSON>
    >,
  ) => {
    return mainMutator<PublicKeyCredentialRequestOptionsJSON>(
      {
        url: `/api/v1/passkeys/generate-authentication-options`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iGenerateAuthenticationOptionsRequestDto,
      },
      options,
    );
  };

  /**
   * Верифицирует ответ устройства и возвращает токены при успехе.
   * @summary Аутентификация по passkey
   */
  const verifyAuthentication = (
    iVerifyAuthenticationRequestDto: IVerifyAuthenticationRequestDto,
    options?: SecondParameter<
      typeof mainMutator<IVerifyAuthenticationResponseDto>
    >,
  ) => {
    return mainMutator<IVerifyAuthenticationResponseDto>(
      {
        url: `/api/v1/passkeys/verify-authentication`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: iVerifyAuthenticationRequestDto,
      },
      options,
    );
  };

  /**
   * Журнал безопасности текущего пользователя: входы (в том числе
   * неудачные), блокировки, 2FA, смена пароля, сессии, passkeys, биометрия.
   * Новые — первыми.
   * @summary Мой журнал безопасности
   */
  const getMyAudit = (
    params?: GetMyAuditParams,
    options?: SecondParameter<typeof mainMutator<ICursorPageDtoAuditEventDto>>,
  ) => {
    return mainMutator<ICursorPageDtoAuditEventDto>(
      { url: `/api/v1/audit/my`, method: "GET", params },
      options,
    );
  };

  /**
   * Журнал безопасности всех пользователей. Требует право `audit:view`.
   * @summary Журнал безопасности
   */
  const listAuditEvents = (
    params?: ListAuditEventsParams,
    options?: SecondParameter<typeof mainMutator<ICursorPageDtoAuditEventDto>>,
  ) => {
    return mainMutator<ICursorPageDtoAuditEventDto>(
      { url: `/api/v1/audit`, method: "GET", params },
      options,
    );
  };

  /**
   * Версия запущенного бэкенда (тег или SHA сборки, коммит, время сборки и
   * запуска процесса) и агента, которого он раздаёт, — для подписи версий в
   * админке.
   * @summary Версия бэкенда
   */
  const getAppVersion = (
    options?: SecondParameter<typeof mainMutator<IAppVersionDto>>,
  ) => {
    return mainMutator<IAppVersionDto>(
      { url: `/api/v1/app/version`, method: "GET" },
      options,
    );
  };

  return {
    createApiKey,
    listApiKeys,
    revokeApiKey,
    getPermissionCatalog,
    createWgNode,
    listWgNodes,
    wgNodeOptions,
    getWgNode,
    updateWgNode,
    deleteWgNode,
    assignWgNode,
    revokeWgNode,
    rotateWgAgentKey,
    wgNodeLogs,
    createWgEndpoint,
    listWgEndpoints,
    wgEndpointOptions,
    getWgEndpoint,
    updateWgEndpoint,
    deleteWgEndpoint,
    assignWgEndpoint,
    revokeWgEndpoint,
    createWgInterface,
    listWgInterfaces,
    wgInterfaceOptions,
    getWgInterface,
    updateWgInterface,
    deleteWgInterface,
    enableWgInterface,
    disableWgInterface,
    moveWgInterface,
    addWgInterfaceReplica,
    removeWgInterfaceReplica,
    restartWgInterface,
    assignWgInterface,
    revokeWgInterface,
    createWgPeer,
    listWgPeers,
    wgPeerOptions,
    getWgPeer,
    updateWgPeer,
    deleteWgPeer,
    enableWgPeer,
    disableWgPeer,
    rotateWgPeerPsk,
    removeWgPeerPsk,
    assignWgPeer,
    revokeWgPeer,
    wgPeerConfig,
    wgPeerQr,
    wgStatsOverview,
    wgStatsSeries,
    wgStatsCurrentPeer,
    wgStatsCurrentInterface,
    wgStatsCurrentNode,
    wgStatsPeerWindow,
    wgStatsInterfaceWindow,
    wgStatsNodeWindow,
    wgStatsMesh,
    wgStatsNodeLinks,
    wgNodeMetrics,
    getRoles,
    createRole,
    deleteRole,
    setRolePermissions,
    createWgSocks,
    listWgSocks,
    getWgSocks,
    updateWgSocks,
    deleteWgSocks,
    assignWgSocks,
    revokeWgSocks,
    addWgSocksUser,
    updateWgSocksUser,
    removeWgSocksUser,
    getWgSocksUserSecret,
    issueWgSocksClient,
    revokeWgSocksClient,
    getWgSocksMacClient,
    provisionWgNode,
    uninstallWgNode,
    createWgForward,
    listWgForwards,
    getWgForward,
    updateWgForward,
    deleteWgForward,
    assignWgForward,
    revokeWgForward,
    listJobs,
    getJob,
    cancelJob,
    wgAgentState,
    wgAgentReport,
    wgAgentStats,
    wgAgentCommandAck,
    wgAgentCommandOutput,
    wgAgentCommandComplete,
    wgAgentBinary,
    wgAgentInstallScript,
    wgAgentRelease,
    updateWgAgent,
    getMyUser,
    updateMyUser,
    confirmEmailChange,
    deleteMyUser,
    setUsername,
    getUsers,
    getUserOptions,
    getUserById,
    setPrivileges,
    requestVerifyEmail,
    verifyEmail,
    updateUser,
    changePassword,
    deleteUser,
    getSessions,
    terminateSession,
    terminateOtherSessions,
    getMyProfile,
    updateMyProfile,
    deleteMyProfile,
    getProfiles,
    getProfileById,
    updateProfile,
    deleteProfile,
    signUp,
    signIn,
    requestResetPassword,
    resetPassword,
    refresh,
    signOut,
    signOutAll,
    enable2FA,
    disable2FA,
    verify2FA,
    getPasskeys,
    deletePasskey,
    generateRegistrationOptions,
    verifyRegistration,
    generateAuthenticationOptions,
    verifyAuthentication,
    getMyAudit,
    listAuditEvents,
    getAppVersion,
  };
};
export type CreateApiKeyResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["createApiKey"]>>
>;
export type ListApiKeysResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["listApiKeys"]>>
>;
export type RevokeApiKeyResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["revokeApiKey"]>>
>;
export type GetPermissionCatalogResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getPermissionCatalog"]>>
>;
export type CreateWgNodeResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["createWgNode"]>>
>;
export type ListWgNodesResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["listWgNodes"]>>
>;
export type WgNodeOptionsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgNodeOptions"]>>
>;
export type GetWgNodeResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getWgNode"]>>
>;
export type UpdateWgNodeResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["updateWgNode"]>>
>;
export type DeleteWgNodeResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["deleteWgNode"]>>
>;
export type AssignWgNodeResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["assignWgNode"]>>
>;
export type RevokeWgNodeResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["revokeWgNode"]>>
>;
export type RotateWgAgentKeyResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["rotateWgAgentKey"]>>
>;
export type WgNodeLogsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgNodeLogs"]>>
>;
export type CreateWgEndpointResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["createWgEndpoint"]>>
>;
export type ListWgEndpointsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["listWgEndpoints"]>>
>;
export type WgEndpointOptionsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgEndpointOptions"]>>
>;
export type GetWgEndpointResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getWgEndpoint"]>>
>;
export type UpdateWgEndpointResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["updateWgEndpoint"]>>
>;
export type DeleteWgEndpointResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["deleteWgEndpoint"]>>
>;
export type AssignWgEndpointResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["assignWgEndpoint"]>>
>;
export type RevokeWgEndpointResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["revokeWgEndpoint"]>>
>;
export type CreateWgInterfaceResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["createWgInterface"]>>
>;
export type ListWgInterfacesResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["listWgInterfaces"]>>
>;
export type WgInterfaceOptionsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgInterfaceOptions"]>>
>;
export type GetWgInterfaceResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getWgInterface"]>>
>;
export type UpdateWgInterfaceResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["updateWgInterface"]>>
>;
export type DeleteWgInterfaceResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["deleteWgInterface"]>>
>;
export type EnableWgInterfaceResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["enableWgInterface"]>>
>;
export type DisableWgInterfaceResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["disableWgInterface"]>>
>;
export type MoveWgInterfaceResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["moveWgInterface"]>>
>;
export type AddWgInterfaceReplicaResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["addWgInterfaceReplica"]>>
>;
export type RemoveWgInterfaceReplicaResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["removeWgInterfaceReplica"]>>
>;
export type RestartWgInterfaceResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["restartWgInterface"]>>
>;
export type AssignWgInterfaceResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["assignWgInterface"]>>
>;
export type RevokeWgInterfaceResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["revokeWgInterface"]>>
>;
export type CreateWgPeerResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["createWgPeer"]>>
>;
export type ListWgPeersResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["listWgPeers"]>>
>;
export type WgPeerOptionsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgPeerOptions"]>>
>;
export type GetWgPeerResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getWgPeer"]>>
>;
export type UpdateWgPeerResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["updateWgPeer"]>>
>;
export type DeleteWgPeerResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["deleteWgPeer"]>>
>;
export type EnableWgPeerResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["enableWgPeer"]>>
>;
export type DisableWgPeerResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["disableWgPeer"]>>
>;
export type RotateWgPeerPskResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["rotateWgPeerPsk"]>>
>;
export type RemoveWgPeerPskResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["removeWgPeerPsk"]>>
>;
export type AssignWgPeerResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["assignWgPeer"]>>
>;
export type RevokeWgPeerResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["revokeWgPeer"]>>
>;
export type WgPeerConfigResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgPeerConfig"]>>
>;
export type WgPeerQrResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgPeerQr"]>>
>;
export type WgStatsOverviewResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgStatsOverview"]>>
>;
export type WgStatsSeriesResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgStatsSeries"]>>
>;
export type WgStatsCurrentPeerResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgStatsCurrentPeer"]>>
>;
export type WgStatsCurrentInterfaceResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgStatsCurrentInterface"]>>
>;
export type WgStatsCurrentNodeResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgStatsCurrentNode"]>>
>;
export type WgStatsPeerWindowResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgStatsPeerWindow"]>>
>;
export type WgStatsInterfaceWindowResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgStatsInterfaceWindow"]>>
>;
export type WgStatsNodeWindowResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgStatsNodeWindow"]>>
>;
export type WgStatsMeshResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgStatsMesh"]>>
>;
export type WgStatsNodeLinksResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgStatsNodeLinks"]>>
>;
export type WgNodeMetricsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgNodeMetrics"]>>
>;
export type GetRolesResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getRoles"]>>
>;
export type CreateRoleResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["createRole"]>>
>;
export type DeleteRoleResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["deleteRole"]>>
>;
export type SetRolePermissionsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["setRolePermissions"]>>
>;
export type CreateWgSocksResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["createWgSocks"]>>
>;
export type ListWgSocksResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["listWgSocks"]>>
>;
export type GetWgSocksResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getWgSocks"]>>
>;
export type UpdateWgSocksResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["updateWgSocks"]>>
>;
export type DeleteWgSocksResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["deleteWgSocks"]>>
>;
export type AssignWgSocksResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["assignWgSocks"]>>
>;
export type RevokeWgSocksResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["revokeWgSocks"]>>
>;
export type AddWgSocksUserResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["addWgSocksUser"]>>
>;
export type UpdateWgSocksUserResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["updateWgSocksUser"]>>
>;
export type RemoveWgSocksUserResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["removeWgSocksUser"]>>
>;
export type GetWgSocksUserSecretResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getWgSocksUserSecret"]>>
>;
export type IssueWgSocksClientResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["issueWgSocksClient"]>>
>;
export type RevokeWgSocksClientResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["revokeWgSocksClient"]>>
>;
export type GetWgSocksMacClientResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getWgSocksMacClient"]>>
>;
export type ProvisionWgNodeResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["provisionWgNode"]>>
>;
export type UninstallWgNodeResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["uninstallWgNode"]>>
>;
export type CreateWgForwardResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["createWgForward"]>>
>;
export type ListWgForwardsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["listWgForwards"]>>
>;
export type GetWgForwardResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getWgForward"]>>
>;
export type UpdateWgForwardResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["updateWgForward"]>>
>;
export type DeleteWgForwardResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["deleteWgForward"]>>
>;
export type AssignWgForwardResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["assignWgForward"]>>
>;
export type RevokeWgForwardResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["revokeWgForward"]>>
>;
export type ListJobsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["listJobs"]>>
>;
export type GetJobResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getJob"]>>
>;
export type CancelJobResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["cancelJob"]>>
>;
export type WgAgentStateResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgAgentState"]>>
>;
export type WgAgentReportResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgAgentReport"]>>
>;
export type WgAgentStatsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgAgentStats"]>>
>;
export type WgAgentCommandAckResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgAgentCommandAck"]>>
>;
export type WgAgentCommandOutputResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgAgentCommandOutput"]>>
>;
export type WgAgentCommandCompleteResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgAgentCommandComplete"]>>
>;
export type WgAgentBinaryResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgAgentBinary"]>>
>;
export type WgAgentInstallScriptResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgAgentInstallScript"]>>
>;
export type WgAgentReleaseResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["wgAgentRelease"]>>
>;
export type UpdateWgAgentResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["updateWgAgent"]>>
>;
export type GetMyUserResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getMyUser"]>>
>;
export type UpdateMyUserResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["updateMyUser"]>>
>;
export type ConfirmEmailChangeResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["confirmEmailChange"]>>
>;
export type DeleteMyUserResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["deleteMyUser"]>>
>;
export type SetUsernameResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["setUsername"]>>
>;
export type GetUsersResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getUsers"]>>
>;
export type GetUserOptionsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getUserOptions"]>>
>;
export type GetUserByIdResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getUserById"]>>
>;
export type SetPrivilegesResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["setPrivileges"]>>
>;
export type RequestVerifyEmailResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["requestVerifyEmail"]>>
>;
export type VerifyEmailResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["verifyEmail"]>>
>;
export type UpdateUserResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["updateUser"]>>
>;
export type ChangePasswordResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["changePassword"]>>
>;
export type DeleteUserResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["deleteUser"]>>
>;
export type GetSessionsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getSessions"]>>
>;
export type TerminateSessionResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["terminateSession"]>>
>;
export type TerminateOtherSessionsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["terminateOtherSessions"]>>
>;
export type GetMyProfileResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getMyProfile"]>>
>;
export type UpdateMyProfileResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["updateMyProfile"]>>
>;
export type DeleteMyProfileResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["deleteMyProfile"]>>
>;
export type GetProfilesResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getProfiles"]>>
>;
export type GetProfileByIdResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getProfileById"]>>
>;
export type UpdateProfileResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["updateProfile"]>>
>;
export type DeleteProfileResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["deleteProfile"]>>
>;
export type SignUpResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["signUp"]>>
>;
export type SignInResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["signIn"]>>
>;
export type RequestResetPasswordResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["requestResetPassword"]>>
>;
export type ResetPasswordResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["resetPassword"]>>
>;
export type RefreshResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["refresh"]>>
>;
export type SignOutResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["signOut"]>>
>;
export type SignOutAllResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["signOutAll"]>>
>;
export type Enable2FAResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["enable2FA"]>>
>;
export type Disable2FAResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["disable2FA"]>>
>;
export type Verify2FAResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["verify2FA"]>>
>;
export type GetPasskeysResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getPasskeys"]>>
>;
export type DeletePasskeyResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["deletePasskey"]>>
>;
export type GenerateRegistrationOptionsResult = NonNullable<
  Awaited<
    ReturnType<ReturnType<typeof getWgAdmin>["generateRegistrationOptions"]>
  >
>;
export type VerifyRegistrationResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["verifyRegistration"]>>
>;
export type GenerateAuthenticationOptionsResult = NonNullable<
  Awaited<
    ReturnType<ReturnType<typeof getWgAdmin>["generateAuthenticationOptions"]>
  >
>;
export type VerifyAuthenticationResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["verifyAuthentication"]>>
>;
export type GetMyAuditResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getMyAudit"]>>
>;
export type ListAuditEventsResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["listAuditEvents"]>>
>;
export type GetAppVersionResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getWgAdmin>["getAppVersion"]>>
>;
