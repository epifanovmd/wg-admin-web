import { SchemaHint } from "@entities/agent";
import {
  Alert,
  Button,
  Collapse,
  Form,
  NumberInputFormField,
  PLAIN_NUMBER_FORMAT,
  Segmented,
  SelectFormField,
  TextareaFormField,
} from "@shared/ui";
import { Send } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { WorkerCommandVM } from "../model/useWorkerCommandVM";
import {
  ARGS_MODES,
  MAX_TIMEOUT_SEC,
  type TArgsMode,
  type TWorkerCommandForm,
} from "../model/validation";
import { WorkerArgsFields } from "./WorkerArgsFields";

interface WorkerCommandFormProps {
  vm: WorkerCommandVM;
}

/**
 * Команда воркеру: воркер, команда из его манифеста (других агент не
 * пропустит), аргументы — формой по схеме или JSON, срок ответа; подсказка по
 * итогу.
 */
export const WorkerCommandForm: FC<WorkerCommandFormProps> = observer(
  ({ vm }) => {
    const { command, fields, argsMode } = vm;

    return (
      <Form form={vm.form} onSubmit={vm.submit} className="flex flex-col gap-4">
        <SelectFormField<TWorkerCommandForm>
          name="worker"
          label="Воркер"
          clearable={false}
          options={vm.workers.map(worker => ({
            value: worker.name,
            label: worker.name,
          }))}
        />
        {vm.commands.length === 0 ? (
          <Alert variant="warning" title="Команд нет">
            Воркер не объявил команд в манифесте — агент не передаст ему
            команды.
          </Alert>
        ) : (
          <SelectFormField<TWorkerCommandForm>
            name="type"
            label="Команда"
            clearable={false}
            options={vm.commands.map(c => ({ value: c.type, label: c.type }))}
            description={command?.description}
          />
        )}
        {command && (
          <>
            {fields && (
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium">Аргументы</p>
                <Segmented<TArgsMode>
                  aria-label="Аргументы"
                  value={argsMode}
                  onValueChange={vm.setArgsMode}
                  options={ARGS_MODES.map(mode => ({
                    value: mode.value,
                    label: mode.label,
                  }))}
                />
              </div>
            )}
            {argsMode === "form" && fields ? (
              <WorkerArgsFields fields={fields} />
            ) : (
              <TextareaFormField<TWorkerCommandForm>
                name="args"
                label={fields ? undefined : "Аргументы (JSON)"}
                description={
                  fields ? undefined : "Пусто — команда без аргументов"
                }
                rows={6}
                className="font-mono text-xs"
              />
            )}
            {command.schema && (
              <Collapse size="sm">
                <Collapse.Trigger>Схема аргументов</Collapse.Trigger>
                <Collapse.Content>
                  <SchemaHint schema={command.schema} label="аргументы" />
                </Collapse.Content>
              </Collapse>
            )}
            {command.result && (
              <SchemaHint schema={command.result} label="итог" />
            )}
          </>
        )}
        <NumberInputFormField<TWorkerCommandForm>
          name="timeoutSec"
          label="Срок ответа воркера, с"
          description="Пусто — без срока: долгая команда может идти часами"
          formatOptions={PLAIN_NUMBER_FORMAT}
          min={1}
          max={MAX_TIMEOUT_SEC}
        />
        <div>
          <Button
            type="submit"
            leftIcon={<Send size={15} />}
            loading={vm.form.formState.isSubmitting}
            disabled={!command}
          >
            Отправить
          </Button>
        </div>
      </Form>
    );
  },
);
