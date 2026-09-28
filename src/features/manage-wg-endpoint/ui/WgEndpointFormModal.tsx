import {
  Alert,
  Button,
  Form,
  InputFormField,
  Modal,
  ModalContent,
  SegmentedFormField,
  SelectFormField,
  TextareaFormField,
} from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import {
  ENDPOINT_FORWARD_MODE_OPTIONS,
  ENDPOINT_MODE_OPTIONS,
  ENDPOINT_ROUTE_OPTIONS,
} from "../model/endpoint-options";
import type {
  TWgEndpointForm,
  WgEndpointFormVM,
} from "../model/useWgEndpointFormVM";
import { EndpointTargets } from "./EndpointTargets";

interface WgEndpointFormModalProps {
  vm: WgEndpointFormVM;
}

/** Модалка создания и редактирования точки подключения; открывается методами VM. */
export const WgEndpointFormModal: FC<WgEndpointFormModalProps> = observer(
  ({ vm }) => (
    <Modal open={vm.open} onOpenChange={vm.setOpen}>
      <ModalContent
        size="md"
        title={
          vm.editing ? `Точка ${vm.editing.name}` : "Новая точка подключения"
        }
        description="Стабильный адрес в конфигах клиентов: ноду можно менять, конфиги — нет"
        footer={
          <>
            <Button variant="outline" onClick={() => vm.setOpen(false)}>
              Отмена
            </Button>
            <Button
              type="submit"
              form="wg-endpoint-form"
              loading={vm.form.formState.isSubmitting}
            >
              {vm.editing ? "Сохранить" : "Создать"}
            </Button>
          </>
        }
      >
        <Form
          id="wg-endpoint-form"
          form={vm.form}
          onSubmit={vm.submit}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputFormField<TWgEndpointForm>
              name="name"
              label="Название"
              placeholder="msk-relay"
            />
            <InputFormField<TWgEndpointForm>
              name="host"
              label="Хост для клиентов"
              placeholder="vpn.example.com"
            />
          </div>
          <SegmentedFormField<TWgEndpointForm>
            name="mode"
            label="Режим"
            options={ENDPOINT_MODE_OPTIONS}
          />
          {vm.mode === "relay" && (
            <>
              <SelectFormField<TWgEndpointForm>
                name="relayNodeId"
                label="Релей-нода"
                options={vm.nodeOptions}
                description="Нода с агентом, которая принимает трафик клиентов"
              />
              <SegmentedFormField<TWgEndpointForm>
                name="forwardMode"
                label="Пересылка до ноды интерфейса"
                options={ENDPOINT_FORWARD_MODE_OPTIONS}
              />
              {vm.forwardMode === "ipip" && (
                <SegmentedFormField<TWgEndpointForm>
                  name="route"
                  label="Маршрут"
                  options={ENDPOINT_ROUTE_OPTIONS}
                />
              )}
            </>
          )}
          {vm.warnings.map(warning => (
            <Alert key={warning} variant="warning">
              {warning}
            </Alert>
          ))}
          {vm.editing && (
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">Интерфейсы через точку</p>
              <EndpointTargets interfaces={vm.editing.interfaces} />
            </div>
          )}
          <TextareaFormField<TWgEndpointForm>
            name="description"
            label="Описание"
            rows={2}
          />
        </Form>
      </ModalContent>
    </Modal>
  ),
);
