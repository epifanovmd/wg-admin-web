import {
  Alert,
  Button,
  Form,
  InputFormField,
  Modal,
  ModalContent,
  NumberInputFormField,
  PLAIN_NUMBER_FORMAT,
  SegmentedFormField,
  SelectFormField,
  SwitchFormField,
  TextareaFormField,
} from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type {
  TWgForwardForm,
  WgForwardFormVM,
} from "../model/useWgForwardFormVM";

interface WgForwardFormModalProps {
  vm: WgForwardFormVM;
}

/** Модалка создания и редактирования проброса; открывается методами VM. */
export const WgForwardFormModal: FC<WgForwardFormModalProps> = observer(
  ({ vm }) => (
    <Modal open={vm.open} onOpenChange={vm.setOpen}>
      <ModalContent
        size="lg"
        title={vm.editing ? `Проброс ${vm.editing.name}` : "Новый проброс"}
        description="Порт на релее → внешний сервис (WireGuard-сервер, прокси) напрямую или через IPIP-туннель"
        footer={
          <>
            <Button variant="outline" onClick={() => vm.setOpen(false)}>
              Отмена
            </Button>
            <Button
              type="submit"
              form="wg-forward-form"
              loading={vm.form.formState.isSubmitting}
            >
              {vm.editing ? "Сохранить" : "Создать"}
            </Button>
          </>
        }
      >
        <Form
          id="wg-forward-form"
          form={vm.form}
          onSubmit={vm.submit}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputFormField<TWgForwardForm>
              name="name"
              label="Название"
              placeholder="wg-server"
            />
            <SelectFormField<TWgForwardForm>
              name="relayNodeId"
              label="Релей"
              options={vm.nodeOptions}
              disabled={!!vm.editing}
              description="Нода, которая принимает трафик клиентов"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr]">
            <SegmentedFormField<TWgForwardForm>
              name="protocol"
              label="Протокол"
              disabled={!!vm.editing}
              options={[
                { value: "udp", label: "UDP" },
                { value: "tcp", label: "TCP" },
              ]}
            />
            <NumberInputFormField<TWgForwardForm>
              name="listenPort"
              formatOptions={PLAIN_NUMBER_FORMAT}
              label="Порт на релее"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_140px]">
            <SelectFormField<TWgForwardForm>
              name="targetNodeId"
              label="Нода-цель"
              options={vm.nodeOptions}
              description="С агентом — для пути через туннель"
            />
            <InputFormField<TWgForwardForm>
              name="targetHost"
              label="Прямой адрес цели"
              placeholder="по умолчанию — publicHost ноды"
            />
            <NumberInputFormField<TWgForwardForm>
              name="targetPort"
              formatOptions={PLAIN_NUMBER_FORMAT}
              label="Порт цели"
            />
          </div>
          <SegmentedFormField<TWgForwardForm>
            name="path"
            label="Путь"
            options={[
              { value: "ipip", label: "Через IPIP-туннель" },
              { value: "direct", label: "Напрямую" },
            ]}
          />
          {vm.path === "ipip" && (
            <>
              <SegmentedFormField<TWgForwardForm>
                name="route"
                label="Маршрут"
                options={[
                  { value: "auto", label: "Авто" },
                  { value: "tunnel", label: "Только туннель" },
                  { value: "direct", label: "Напрямую" },
                ]}
              />
              <Alert variant="info">
                Авто: если туннель не отвечает ~30 с, релей сам шлёт напрямую и
                возвращается в туннель, когда он оживёт. Агент ноды-цели
                поднимет свой конец туннеля.
              </Alert>
            </>
          )}
          <SwitchFormField<TWgForwardForm>
            name="enabled"
            label="Включён"
            description="Выключенный можно создать заранее, пока порт на релее занят другим прокси: включите при переключении — агент применит, как только порт освободится"
          />
          <TextareaFormField<TWgForwardForm>
            name="description"
            label="Описание"
            rows={2}
          />
        </Form>
      </ModalContent>
    </Modal>
  ),
);
