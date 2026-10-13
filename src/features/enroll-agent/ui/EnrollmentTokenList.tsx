import { formatter } from "@shared/lib/utils";
import { Badge, IconButton, Skeleton, Tooltip } from "@shared/ui";
import { Ban } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import {
  type EnrollAgentVM,
  enrollmentTokenState,
} from "../model/useEnrollAgentVM";

interface EnrollmentTokenListProps {
  vm: EnrollAgentVM;
}

const STATE = {
  active: { label: "действует", variant: "success" },
  revoked: { label: "отозван", variant: "destructive" },
  expired: { label: "истёк", variant: "muted" },
  used: { label: "использован", variant: "muted" },
} as const;

/** Созданные токены: состояние, использования, срок; действующие можно отозвать. */
export const EnrollmentTokenList: FC<EnrollmentTokenListProps> = observer(
  ({ vm }) => {
    if (vm.isTokensLoading && vm.tokens.length === 0) {
      return <Skeleton className="h-16 w-full" />;
    }
    if (vm.tokens.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          Токенов пока нет — создайте первый.
        </p>
      );
    }

    return (
      <ul className="flex max-h-56 flex-col divide-y divide-border overflow-auto rounded-lg border border-border">
        {vm.tokens.map(token => {
          const state = enrollmentTokenState(token);

          return (
            <li key={token.id} className="flex items-center gap-3 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <span className="truncate">{token.name}</span>
                  <Badge variant={STATE[state].variant}>
                    {STATE[state].label}
                  </Badge>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  <span className="font-mono">{token.prefix}…</span>
                  {` · агентов ${token.uses}${token.maxUses === null ? "" : ` из ${token.maxUses}`}`}
                  {` · ${token.expiresAt ? `до ${formatter.date.format(token.expiresAt)}` : "бессрочный"}`}
                </p>
              </div>
              {state === "active" && (
                <Tooltip content="Отозвать">
                  <IconButton
                    aria-label={`Отозвать токен ${token.name}`}
                    variant="destructive"
                    onClick={() => void vm.revokeToken(token)}
                  >
                    <Ban size={15} />
                  </IconButton>
                </Tooltip>
              )}
            </li>
          );
        })}
      </ul>
    );
  },
);
