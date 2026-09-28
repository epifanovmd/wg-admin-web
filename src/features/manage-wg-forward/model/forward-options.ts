import type { SegmentedOption } from "@shared/ui";

/** Путь от релея до цели проброса. */
export const FORWARD_PATH_OPTIONS: SegmentedOption<"ipip" | "direct">[] = [
  {
    value: "ipip",
    label: "Через IPIP-туннель",
    description:
      "Трафик идёт внутри туннеля до ноды-цели — обходит потери и фильтрацию UDP у хостера. Нужна нода с агентом: она поднимет свой конец туннеля.",
  },
  {
    value: "direct",
    label: "Напрямую",
    description:
      "Релей переадресует трафик (DNAT) на адрес цели через интернет. Цель может быть любым хостом, агент на ней не нужен.",
  },
];

/** Маршрут проброса через туннель. */
export const FORWARD_ROUTE_OPTIONS: SegmentedOption<
  "auto" | "tunnel" | "direct"
>[] = [
  {
    value: "auto",
    label: "Авто",
    description:
      "Через туннель; если он не отвечает ~30 с, релей сам шлёт напрямую и возвращается в туннель, когда тот оживёт.",
  },
  {
    value: "tunnel",
    label: "Только туннель",
    description:
      "Всегда через туннель, даже если он не отвечает: без обхода по прямому адресу.",
  },
  {
    value: "direct",
    label: "Напрямую",
    description:
      "Принудительно по прямому адресу цели, мимо туннеля — например, пока туннель чинят.",
  },
];
