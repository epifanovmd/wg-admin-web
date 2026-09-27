import { FC, ReactNode } from "react";

import { Header } from "./Header";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: FC<AppLayoutProps> = ({ children }) => (
  <div className="flex h-dvh flex-col overflow-hidden bg-background">
    <Header />
    <main className="min-w-0 flex-1 overflow-y-auto bg-muted/30">
      {children}
    </main>
  </div>
);
