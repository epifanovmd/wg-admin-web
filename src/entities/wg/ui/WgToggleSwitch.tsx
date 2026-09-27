import { Switch, Tooltip } from "@shared/ui";
import { FC, useEffect, useState } from "react";

interface WgToggleSwitchProps {
  enabled: boolean;
  /** Переключение на сервере; `false` — не удалось, тумблер вернётся. */
  onToggle: () => Promise<boolean>;
}

/**
 * Тумблер «включён/выключен» с подсказкой. Переключается сразу по клику
 * (анимация не ждёт ответа сервера) и откатывается при ошибке. Подсказка — на
 * обёртке: триггер Tooltip проставляет свой `data-state` и перетёр бы
 * состояние Switch (`checked`/`unchecked`), от которого зависят его стили.
 */
export const WgToggleSwitch: FC<WgToggleSwitchProps> = ({
  enabled,
  onToggle,
}) => {
  const [checked, setChecked] = useState(enabled);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setChecked(enabled);
  }, [enabled]);

  const toggle = async (next: boolean) => {
    setChecked(next);
    setPending(true);

    const ok = await onToggle();

    setPending(false);
    if (!ok) setChecked(!next);
  };

  return (
    <Tooltip content={checked ? "Выключить" : "Включить"}>
      <span className="inline-flex">
        <Switch
          checked={checked}
          disabled={pending}
          onCheckedChange={next => void toggle(next)}
          aria-label="Включён"
        />
      </span>
    </Tooltip>
  );
};
