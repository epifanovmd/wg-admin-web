import { Empty, Spinner } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { WgSocksVM } from "../model/useWgSocksVM";
import { ServiceCard } from "./ServiceCard";

interface WgSocksServicesProps {
  vm: WgSocksVM;
}

/** Список прокси: загрузка, ошибка, пусто или карточки. */
export const WgSocksServices: FC<WgSocksServicesProps> = observer(({ vm }) => {
  const { services } = vm;

  if (services.isLoading && services.items.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  }

  if (services.error) {
    return <Empty size="sm" icon="error" title={services.error.message} />;
  }

  if (services.items.length === 0) {
    return (
      <Empty
        size="sm"
        title="Прокси пока нет"
        description="Сервис создаст сертификаты, клиент для устройства скачивается готовым"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {services.items.map(service => (
        <ServiceCard key={service.id} vm={vm} service={service} />
      ))}
    </div>
  );
});
