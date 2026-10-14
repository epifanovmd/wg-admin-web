import {
  Alert,
  Button,
  CopyableText,
  Modal,
  ModalContent,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC, ReactNode } from "react";

import type { EnrollAgentVM } from "../model/useEnrollAgentVM";
import { EnrollmentTokenForm } from "./EnrollmentTokenForm";
import { EnrollmentTokenList } from "./EnrollmentTokenList";
import { InstallCommandForm } from "./InstallCommandForm";

interface InstallAgentModalProps {
  vm: EnrollAgentVM;
  /** Вкладка «Архив»: архив агента с токеном для получателя (её собирает страница). */
  archive?: ReactNode;
}

const SECTION_TITLE_CLASS = "text-sm font-semibold text-foreground";
const SECTION_HINT_CLASS = "text-sm text-muted-foreground";

/**
 * Установка агента: токен регистрации и команда для узла — или архив агента с токеном для
 * получателя. Агент сам регистрируется по токену и выходит на связь.
 */
export const InstallAgentModal: FC<InstallAgentModalProps> = observer(
  ({ vm, archive }) => {
    const command = (
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h3 className={SECTION_TITLE_CLASS}>1. Токен регистрации</h3>
          <p className={SECTION_HINT_CLASS}>
            По токену агент получает свой ключ. Одноразовый токен с коротким
            сроком безопаснее.
          </p>
          <EnrollmentTokenForm vm={vm} />
          {vm.issued && (
            <div className="flex flex-col gap-2">
              <Alert variant="warning">
                Скопируйте токен сейчас — повторно он не показывается. Он уже
                подставлен в команду ниже.
              </Alert>
              <CopyableText
                text={vm.issued}
                className="break-all font-mono text-sm"
              />
            </div>
          )}
          <EnrollmentTokenList vm={vm} />
        </section>
        <Separator />
        <section className="flex flex-col gap-3">
          <h3 className={SECTION_TITLE_CLASS}>2. Команда установки</h3>
          <p className={SECTION_HINT_CLASS}>
            Выполните её на узле: установщик скачает агента с сервера, проверит
            подпись и запустит службу.
          </p>
          <InstallCommandForm vm={vm} />
          {vm.command && (
            <div className="flex flex-col gap-2">
              <pre className="overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted p-3 text-xs">
                {vm.command}
              </pre>
              <CopyableText
                text={vm.command}
                displayText="Скопировать команду"
                className="self-start text-sm"
              />
            </div>
          )}
        </section>
      </div>
    );

    return (
      <Modal open={vm.open} onOpenChange={vm.setOpen}>
        <ModalContent
          size="lg"
          fullScreenOnMobile
          title="Установить агента"
          description="Агент регистрируется по токену и сам выходит на связь с сервером"
          footer={<Button onClick={() => vm.setOpen(false)}>Готово</Button>}
        >
          {archive ? (
            <Tabs defaultValue="command">
              <TabsList>
                <TabsTrigger value="command">Команда</TabsTrigger>
                <TabsTrigger value="archive">Архив</TabsTrigger>
              </TabsList>
              <TabsContent value="command" className="pt-4">
                {command}
              </TabsContent>
              <TabsContent value="archive" className="pt-4">
                {archive}
              </TabsContent>
            </Tabs>
          ) : (
            command
          )}
        </ModalContent>
      </Modal>
    );
  },
);
