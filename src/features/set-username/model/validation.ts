import { z } from "zod";

export const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{5,32}$/, "5–32 символа: латиница, цифры и _."),
});

export type TUsernameForm = z.input<typeof usernameSchema>;
