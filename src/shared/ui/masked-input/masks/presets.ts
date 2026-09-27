import type { FactoryOpts } from "imask";
import { MaskedRange } from "imask";

export const phoneMask: FactoryOpts = { mask: "+{7} (000) 000-00-00" };

export const internationalPhoneMask: FactoryOpts = { mask: "+000000000000000" };

export const cardNumberMask: FactoryOpts = { mask: "0000 0000 0000 0000" };

export const postalCodeMask: FactoryOpts = { mask: "000000" };

export const innMask: FactoryOpts = { mask: "000000000000" };

export const ogrnMask: FactoryOpts = { mask: "0000000000000" };

export const timeMask: FactoryOpts = {
  mask: "HH:MM",
  blocks: {
    HH: { mask: MaskedRange, from: 0, to: 23, maxLength: 2 },
    MM: { mask: MaskedRange, from: 0, to: 59, maxLength: 2 },
  },
};

export const cardExpiryMask: FactoryOpts = {
  mask: "MM/YY",
  blocks: {
    MM: { mask: MaskedRange, from: 1, to: 12, maxLength: 2 },
    YY: { mask: MaskedRange, from: 0, to: 99, maxLength: 2 },
  },
};

export const cardCvcMask: FactoryOpts = { mask: "000" };

export const ipAddressMask: FactoryOpts = {
  mask: "000.000.000.000",
  blocks: { "000": { mask: MaskedRange, from: 0, to: 255 } },
};

export const snilsMask: FactoryOpts = { mask: "000-000-000 00" };

export const passportMask: FactoryOpts = { mask: "0000 000000" };

export const bankAccountMask: FactoryOpts = {
  mask: "0000 0000 0000 0000 0000",
};

export const bicMask: FactoryOpts = { mask: "000000000" };

export const hexColorMask: FactoryOpts = {
  mask: "#HHHHHH",
  lazy: false,
  definitions: { H: /[0-9a-fA-F]/ },
};

export const macAddressMask: FactoryOpts = {
  mask: "HH:HH:HH:HH:HH:HH",
  definitions: { H: /[0-9a-fA-F]/ },
};

export const licensePlateMask = {
  mask: "L000LL 000",
  definitions: { L: /[АВЕКМНОРСТУХавекмнорстух]/ },
  prepare: (value: string) => value.toUpperCase(),
} as FactoryOpts;

export interface CreatePercentMaskOptions {
  scale?: number;
  min?: number;
  max?: number;
}

export const createPercentMask = ({
  scale = 0,
  min = 0,
  max = 100,
}: CreatePercentMaskOptions = {}): FactoryOpts =>
  ({
    mask: "num%",
    lazy: false,
    blocks: { num: { mask: Number, scale, min, max } },
  }) as FactoryOpts;

export interface CreateCurrencyMaskOptions {
  scale?: number;
  thousandsSeparator?: string;
  radix?: string;
  min?: number;
  max?: number;
}

export const createCurrencyMask = ({
  scale = 2,
  thousandsSeparator = " ",
  radix = ",",
  min,
  max,
}: CreateCurrencyMaskOptions = {}): FactoryOpts =>
  ({
    mask: Number,
    scale,
    thousandsSeparator,
    radix,
    ...(min !== undefined && { min }),
    ...(max !== undefined && { max }),
    normalizeZeros: true,
    padFractionalZeros: false,
  }) as FactoryOpts;

export interface CreatePatternMaskOptions {
  definitions?: Record<string, RegExp>;
  lazy?: boolean;
  placeholderChar?: string;
}

export const createPatternMask = (
  pattern: string,
  { definitions, lazy, placeholderChar }: CreatePatternMaskOptions = {},
): FactoryOpts => ({
  mask: pattern,
  ...(definitions !== undefined && { definitions }),
  ...(lazy !== undefined && { lazy }),
  ...(placeholderChar !== undefined && { placeholderChar }),
});
