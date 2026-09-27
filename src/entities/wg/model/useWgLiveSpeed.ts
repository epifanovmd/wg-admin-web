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

interface UseWgLiveSpeedOptions<TLive extends IWgLiveSnapshot> {
  /** Чья статистика; `null` — не загружать и не слушать. */
  id: string | null;
  /** Событие сокета со снимком. */
  event: string;
  /** Снимок относится к `id` (по умолчанию — любой). */
  match?: (snapshot: TLive, id: string) => boolean;
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

const matchAny = () => true;

const noWindow = async () => ({ data: null });

/**
 * Живая статистика с графиком скорости: снимок и история последних минут при
 * открытии, дальше события сокета; точки графика — скользящее окно. Состояние
 * принадлежит `id`: при его смене прежние данные не показываются.
 */
export const useWgLiveSpeed = <TLive extends IWgLiveSnapshot>({
  id,
  event,
  match = matchAny,
  load,
  loadWindow = noWindow,
}: UseWgLiveSpeedOptions<TLive>) => {
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

  useSocketEvent<[TLive]>(
    event,
    snapshot => {
      if (!id || !match(snapshot, id)) return;

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
