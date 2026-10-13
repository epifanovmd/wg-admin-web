import { ConfigStateBadge, SchemaHint } from "@entities/agent";
import {
  Alert,
  Button,
  Form,
  Modal,
  ModalContent,
  TextareaFormField,
} from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { WorkerConfigEditorVM } from "../model/useWorkerConfigEditorVM";
import type { TWorkerConfigForm } from "../model/validation";

interface WorkerConfigModalProps {
  vm: WorkerConfigEditorVM;
  /** Можно задавать значение; иначе — только посмотреть. */
  canEdit: boolean;
}

const FORM_ID = "worker-config-form";

/** Окно ключа настроек воркера: подсказка по схеме, статус и JSON-значение. */
export const WorkerConfigModal: FC<WorkerConfigModalProps> = observer(
  ({ vm, canEdit }) => {
    const { target } = vm;
    const status = target?.entry;

    return (
      <Modal open={target !== null} onOpenChange={open => !open && vm.close()}>
        <ModalContent
          size="lg"
          fullScreenOnMobile
          title={target ? `${target.worker} / ${target.key}` : ""}
          description={
            target?.manifest?.description ?? "Настройка воркера — любой JSON"
          }
          footer={
            <>
              <Button variant="outline" onClick={vm.close}>
                {canEdit ? "Отмена" : "Закрыть"}
              </Button>
              {canEdit && (
                <Button
                  type="submit"
                  form={FORM_ID}
                  loading={vm.form.formState.isSubmitting}
                >
                  Задать новую версию
                </Button>
              )}
            </>
          }
        >
          {target && (
            <div className="flex flex-col gap-4">
              {!target.manifest && (
                <Alert variant="warning">
                  Этого ключа нет в манифесте воркера: агент не передаст его
                  воркеру.
                </Alert>
              )}
              <SchemaHint schema={target.manifest?.schema} />
              {status && (
                <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  Сейчас — версия {status.version}
                  <ConfigStateBadge state={status.state} />
                  {status.error && (
                    <span className="text-destructive">
                      {status.error.message}
                    </span>
                  )}
                </p>
              )}
              <Form
                id={FORM_ID}
                form={vm.form}
                onSubmit={vm.save}
                className="flex flex-col gap-3"
              >
                <TextareaFormField<TWorkerConfigForm>
                  name="value"
                  label="Значение (JSON)"
                  description="Сервер проверит его по схеме и даст новую версию; агент применит её сразу или при подключении"
                  rows={12}
                  className="font-mono text-xs"
                  disabled={!canEdit}
                />
              </Form>
            </div>
          )}
        </ModalContent>
      </Modal>
    );
  },
);
