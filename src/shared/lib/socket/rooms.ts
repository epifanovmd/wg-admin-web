import type { ISocketTransport } from "./transport/socket.transport.types";

interface IRoomAck {
  ok: boolean;
  error?: { code: string; message: string };
}

/**
 * Подписка на серверную комнату (`room:subscribe { type, id }`) с
 * автоматическим восстановлением после reconnect. `onRejoin` — после
 * повторного входа: события за время обрыва потеряны, данные нужно
 * перечитать. Возвращает отписку.
 */
export const subscribeSocketRoom = (
  socket: ISocketTransport,
  type: string,
  id: string,
  onRejoin?: () => void,
): (() => void) => {
  let active = true;

  const join = (): void => {
    if (!active) return;

    socket.emit("room:subscribe", { type, id }, (ack: IRoomAck) => {
      if (!ack?.ok && active) {
        // Нет прав или комната недоступна — повторять бессмысленно.
        active = false;
      }
    });
  };

  join();

  const offConnect = socket.onConnect(() => {
    join();
    if (active) onRejoin?.();
  });

  return () => {
    active = false;
    offConnect();
    socket.emit("room:unsubscribe", { type, id });
  };
};
