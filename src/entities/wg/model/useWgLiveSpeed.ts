import { useLatestRef } from "@shared/lib/hooks";
import { useSocketEvent } from "@shared/lib/socket";
import { useCallback, useEffect, useState } from "react";

import {
  type ISpeedPoint,
  mergeSpeedPoints,
  pushSpeedPoint,
} from "./live.types";

/** Снимок live-статистики со скоростью. */
interface IWgLiveSnapshot {
  ts: string;
  rxBps: number;
  txBps: number;
}

interface UseWgLiveSpeedOptions<TLive extends IWgLiveSnapshot, TPayload> {
  /** Чья статистика; `null` — не загружать и не слушать. */
  id: string | null;
  /** Событие сокета со снимком (или пачкой снимков). */
  event: string;
  /**
   * Снимок `id` из события; `null` — событие не о нём. По умолчанию событие
   * и есть снимок.
   */
  select?: (payload: TPayload, id: string) => TLive | null | undefined;
  /** Текущий снимок с сервера — при открытии и по `reload`. */
  load: (id: string) => Promise<{ data?: TLive | null }>;
  /** Скорость за последние минуты — график сразу с историей. */
  loadWindow?: (id: string) => Promise<{ data?: ISpeedPoint[] | null }>;
}

interface ILiveState<TLive> {
  id: string | null;
  live: TLive | null;
  points: ISpeedPoint[];
}

const selectPayload = <TLive>(payload: unknown) => payload as TLive;

const noWindow = async () => ({ data: null });

/**
 * Живая статистика с графиком скорости: снимок и история последних минут при
 * открытии, дальше события сокета; точки графика — скользящее окно. Состояние
 * принадлежит `id`: при его смене прежние данные не показываются.
 */
export const useWgLiveSpeed = <
  TLive extends IWgLiveSnapshot,
  TPayload = TLive,
>({
  id,
  event,
  select = selectPayload<TLive>,
  load,
  loadWindow = noWindow,
}: UseWgLiveSpeedOptions<TLive, TPayload>) => {
  const [state, setState] = useState<ILiveState<TLive>>({
    id,
    live: null,
    points: [],
  });
  const loadRef = useLatestRef(load);
  const loadWindowRef = useLatestRef(loadWindow);
  const current = state.id === id ? state : null;

  const reload = useCallback(async () => {
    if (!id) return;

    const [{ data }, { data: history }] = await Promise.all([
      loadRef.current(id),
      loadWindowRef.current(id),
    ]);

    if (!data && !history) return;

    setState(prev => {
      const own = prev.id === id;
      const points = own ? prev.points : [];

      return {
        id,
        live: data ?? (own ? prev.live : null),
        points: history ? mergeSpeedPoints(history, points) : points,
      };
    });
  }, [id, loadRef, loadWindowRef]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useSocketEvent<[TPayload]>(
    event,
    payload => {
      const snapshot = id ? select(payload, id) : null;

      if (!id || !snapshot) return;

      setState(prev => ({
        id,
        live: snapshot,
        points: pushSpeedPoint(prev.id === id ? prev.points : [], {
          ts: Date.parse(snapshot.ts),
          rxBps: snapshot.rxBps,
          txBps: snapshot.txBps,
        }),
      }));
    },
    id !== null,
  );

  return {
    live: current?.live ?? null,
    points: current?.points ?? [],
    reload,
  };
};
