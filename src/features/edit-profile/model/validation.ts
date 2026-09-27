import { z } from "zod";

export const profileFormValidationSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  gender: z.string().optional(),
  birthDate: z.date().optional(),
});

export type TProfileForm = z.infer<typeof profileFormValidationSchema>;
