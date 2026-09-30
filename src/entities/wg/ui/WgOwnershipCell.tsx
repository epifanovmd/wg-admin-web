import { FC } from "react";

interface WgOwnershipCellProps {
  /** Имя владельца (у пира — держателя). */
  owner: string | null;
  /** Имя создателя; совпадает с владельцем или неизвестен — не показывается. */
  creator: string | null;
  /** Подпись, когда владельца нет. */
  emptyOwner?: string;
}

/** Кому принадлежит сущность: владелец и, если другой, — создатель. */
export const WgOwnershipCell: FC<WgOwnershipCellProps> = ({
  owner,
  creator,
  emptyOwner = "не назначен",
}) => (
  <div className="min-w-0 text-xs">
    <p className={owner ? "truncate" : "truncate text-muted-foreground"}>
      {owner ?? emptyOwner}
    </p>
    {creator && creator !== owner && (
      <p className="truncate text-muted-foreground">создал {creator}</p>
    )}
  </div>
);
