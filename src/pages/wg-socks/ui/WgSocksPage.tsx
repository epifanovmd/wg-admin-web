import { PermissionGate } from "@entities/user";
import { WG_PERMISSIONS } from "@entities/wg";
import { WgSocksFormModal } from "@features/manage-wg-socks";
import { Button, PageHeader, PageLayout } from "@shared/ui";
import { Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useWgSocksVM } from "../model/useWgSocksVM";
import { SocksNamePromptModal } from "./SocksNamePromptModal";
import { SocksSecretModal } from "./SocksSecretModal";
import { WgSocksServices } from "./WgSocksServices";

export const WgSocksPage: FC = observer(() => {
  const vm = useWgSocksVM();

  return (
    <PageLayout
      header={
        <PageHeader
          title="Прокси"
          subtitle="SOCKS5 через mTLS на нодах — для Telegram и не только: доступ по сертификату устройства и паролю"
          actions={
            vm.canCreate && (
              <Button
                leftIcon={<Plus size={15} />}
                onClick={() => vm.form.openCreate()}
              >
                Новый прокси
              </Button>
            )
          }
        />
      }
    >
      <PermissionGate permission={WG_PERMISSIONS.SOCKS_VIEW}>
        <WgSocksServices vm={vm} />
      </PermissionGate>
      <WgSocksFormModal vm={vm.form} />
      <SocksNamePromptModal vm={vm.namePrompt} />
      <SocksSecretModal vm={vm} />
    </PageLayout>
  );
});
