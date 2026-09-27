import { APP_NAME } from "@shared/config/env";
import { ShieldCheck } from "lucide-react";
import { FC, ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: FC<AuthLayoutProps> = ({ children }) => (
  <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background p-4">
    <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />

    <div className="relative w-full max-w-md">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand/70 text-brand-foreground shadow-lg shadow-brand/30 ring-1 ring-inset ring-white/15">
          <ShieldCheck size={28} strokeWidth={2.2} />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {APP_NAME}
          </p>
          <p className="text-sm text-muted-foreground">
            Управление WireGuard VPN
          </p>
        </div>
      </div>

      {children}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {APP_NAME} — ноды, интерфейсы, пиры и пробросы WireGuard
      </p>
    </div>
  </div>
);
