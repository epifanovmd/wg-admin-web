import { WG_PERMISSIONS } from "@entities/wg";
import { KnownPermission } from "@shared/api/gen/main/model";
import { type LinkProps } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  Cable,
  KeyRound,
  LayoutGrid,
  ListChecks,
  type LucideIcon,
  Network,
  ScrollText,
  Server,
  Shield,
  ShieldCheck,
  Users,
  Waypoints,
} from "lucide-react";

export interface NavItem {
  to: LinkProps["to"];
  label: string;
  icon: LucideIcon;
  /** Пункт виден, только если у пользователя есть это право. */
  permission?: KnownPermission | (string & {});
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
  /** Группа есть только в мобильном меню: в шапке её пункты лежат в меню профиля. */
  mobileOnly?: boolean;
}

export const NAV_ICON_SIZE = 17;

/** Разделы аккаунта: в шапке — в меню профиля, на мобильном — группой. */
export const ACCOUNT_NAV_ITEMS: NavItem[] = [
  { to: "/security", label: "Безопасность", icon: Shield },
  { to: "/activity", label: "Мой журнал", icon: Activity },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { to: "/", label: "Дашборд", icon: LayoutGrid },
      {
        to: "/wg/peers",
        label: "Пиры",
        icon: Cable,
        permission: WG_PERMISSIONS.PEER_OWN,
      },
    ],
  },
  {
    label: "VPN",
    items: [
      {
        to: "/wg/nodes",
        label: "Ноды",
        icon: Server,
        permission: WG_PERMISSIONS.NODE_VIEW,
      },
      {
        to: "/wg/endpoints",
        label: "Точки подключения",
        icon: Network,
        permission: WG_PERMISSIONS.ENDPOINT_VIEW,
      },
      {
        to: "/wg/forwards",
        label: "Пробросы",
        icon: ArrowLeftRight,
        permission: WG_PERMISSIONS.FORWARD_VIEW,
      },
      {
        to: "/wg/socks",
        label: "Прокси",
        icon: Waypoints,
        permission: WG_PERMISSIONS.SOCKS_VIEW,
      },
      {
        to: "/wg/stats",
        label: "Статистика",
        icon: BarChart3,
        permission: WG_PERMISSIONS.STATS_VIEW,
      },
    ],
  },
  {
    items: [{ to: "/jobs", label: "Задачи", icon: ListChecks }],
  },
  {
    label: "Аккаунт",
    mobileOnly: true,
    items: ACCOUNT_NAV_ITEMS,
  },
  {
    label: "Администрирование",
    items: [
      {
        to: "/admin/users",
        label: "Пользователи",
        icon: Users,
        permission: KnownPermission["user:view"],
      },
      {
        to: "/admin/roles",
        label: "Роли",
        icon: ShieldCheck,
        permission: KnownPermission["role:view"],
      },
      {
        to: "/admin/api-keys",
        label: "API-ключи",
        icon: KeyRound,
        permission: KnownPermission["apikey:manage"],
      },
      {
        to: "/admin/audit",
        label: "Аудит",
        icon: ScrollText,
        permission: KnownPermission["audit:view"],
      },
    ],
  },
];
