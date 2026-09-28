import type { SegmentedOption } from "@shared/ui";

/** Режим точки подключения. */
export const ENDPOINT_MODE_OPTIONS: SegmentedOption<"direct" | "relay">[] = [
  {
    value: "direct",
    label: "Напрямую",
    description:
      "Хост указывает на саму ноду (DNS или IP) и просто подставляется в конфиги клиентов. Смена IP ноды — без перевыпуска конфигов.",
  },
  {
    value: "relay",
    label: "Через релей",
    description:
      "Клиенты подключаются к релей-ноде, а она пересылает UDP до ноды интерфейса. Позволяет переносить интерфейс и переключаться на копии без смены адреса у клиентов.",
  },
];

/** Как релей доставляет трафик до ноды интерфейса. */
export const ENDPOINT_FORWARD_MODE_OPTIONS: SegmentedOption<"dnat" | "ipip">[] =
  [
    {
      value: "dnat",
      label: "DNAT",
      description:
        "Релей переадресует UDP на публичный адрес ноды через интернет — просто и без лишних заголовков.",
    },
    {
      value: "ipip",
      label: "IPIP-туннель",
      description:
        "UDP идёт внутри IPIP-туннеля до ноды — обходит потери и фильтрацию UDP у хостера. Туннель агенты настроят сами; протокол IPIP должен пропускаться между нодами.",
    },
  ];
