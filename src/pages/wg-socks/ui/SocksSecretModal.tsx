import { Alert, CopyableText, Modal, ModalContent } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { LOCAL_SOCKS_PORT, telegramSocksLink } from "../model/socks-links";
import type { WgSocksVM } from "../model/useWgSocksVM";

interface SocksSecretModalProps {
  vm: WgSocksVM;
}

/** Логин, пароль и ссылка tg://socks пользователя прокси. */
export const SocksSecretModal: FC<SocksSecretModalProps> = observer(
  ({ vm }) => (
    <Modal open={!!vm.secret} onOpenChange={open => !open && vm.closeSecret()}>
      <ModalContent
        size="md"
        title={`Доступ к прокси ${vm.secret?.serviceName ?? ""}`}
        description="В Telegram: Настройки → Данные и память → Прокси → SOCKS5"
      >
        {vm.secret && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
              <span className="text-muted-foreground">Сервер</span>
              <CopyableText text="127.0.0.1" />
              <span className="text-muted-foreground">Порт</span>
              <CopyableText text={String(LOCAL_SOCKS_PORT)} />
              <span className="text-muted-foreground">Логин</span>
              <CopyableText text={vm.secret.username} />
              <span className="text-muted-foreground">Пароль</span>
              <CopyableText text={vm.secret.password} />
            </div>
            <Alert variant="info">
              Адрес — локальный клиент stunnel на устройстве (ставится из архива
              «Клиент для Mac»); он сам держит mTLS до сервера.
            </Alert>
            <CopyableText
              text={telegramSocksLink(vm.secret)}
              displayText="Ссылка tg://socks для Telegram"
            />
          </div>
        )}
      </ModalContent>
    </Modal>
  ),
);
