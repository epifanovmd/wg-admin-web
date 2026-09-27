import type { ReactNode } from "react";
import type {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseControllerProps,
  UseFormStateReturn,
} from "react-hook-form";

/** Положение подписи; `floating` поддерживают только текстовые поля. */
export type LabelPlacement = "outside" | "floating";

export interface FloatingLabelProps {
  labelPlacement?: LabelPlacement;
}

export interface FieldProps extends FloatingLabelProps {
  label?: ReactNode;
  hint?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  /** Только визуальная отметка и ARIA; валидацией владеют правила RHF/Zod. */
  required?: boolean;
  htmlFor?: string;
  /** id элемента подписи для `aria-labelledby` контрола. */
  labelId?: string;
  descriptionId?: string;
  errorId?: string;
  children?: ReactNode;
}

export interface FormFieldBaseProps<
  TFormData extends FieldValues = FieldValues,
  TName extends FieldPath<TFormData> = FieldPath<TFormData>,
> {
  name: TName;
  control?: Control<TFormData>;
}

/** Пропсы, которые FormField прокидывает в контрол для связки с подписью и ошибкой. */
export interface FormControlProps {
  id: string;
  name: string;
  disabled?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-labelledby"?: string;
  "aria-required"?: true;
}

export interface FormFieldRenderProps<
  TFormData extends FieldValues,
  TName extends FieldPath<TFormData>,
> {
  field: ControllerRenderProps<TFormData, TName>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<TFormData>;
  controlProps: FormControlProps;
}

export type FormControllerOptions<
  TFormData extends FieldValues,
  TName extends FieldPath<TFormData>,
> = Pick<
  UseControllerProps<TFormData, TName>,
  "control" | "defaultValue" | "rules" | "shouldUnregister"
> & {
  /**
   * Блокирует контрол, не отключая поле в RHF: значение остаётся в данных
   * submit, в отличие от `disabled` у `useController`.
   */
  disabled?: boolean;
};

/** Пропсы обёртки Field, доступные адаптерам (без floating-подписи). */
export type FormFieldLayoutProps = Omit<
  FieldProps,
  | "children"
  | "descriptionId"
  | "error"
  | "errorId"
  | "htmlFor"
  | "labelId"
  | "labelPlacement"
> & {
  id?: string;
  /** Класс обёртки Field; `className` адаптера уходит в сам контрол. */
  fieldClassName?: string;
};

export type FormAdapterProps<
  TFormData extends FieldValues,
  TName extends FieldPath<TFormData>,
> = FormFieldBaseProps<TFormData, TName> &
  FormControllerOptions<TFormData, TName> &
  FormFieldLayoutProps;

/** Адаптеры текстовых полей дополнительно принимают floating-подпись. */
export type FloatingFormAdapterProps<
  TFormData extends FieldValues,
  TName extends FieldPath<TFormData>,
> = FormAdapterProps<TFormData, TName> & FloatingLabelProps;

/** Путь к текстовому полю формы; `null` допустим для схем с nullable-строками. */
export type TextFieldValue = string | null | undefined;
