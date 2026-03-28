import { z } from "zod";

export const caregiverSearchSchema = z.object({
  region: z.string().optional(),
  serviceCategory: z
    .enum(["HOME_CARE", "HOME_BATH", "HOME_NURSING", "DAY_NIGHT_CARE", "SHORT_TERM_CARE", "HOURLY_CARE", "HOSPITAL_CARE", "DEMENTIA_CARE", "HOSPICE_CARE"])
    .optional(),
  caregiverType: z.enum(["CARE_WORKER", "NURSING_AIDE", "SOCIAL_WORKER", "NURSE"]).optional(),
  careLevel: z.enum(["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "LEVEL_5", "COGNITIVE_SUPPORT"]).optional(),
  specialty: z.string().optional(),
  minRate: z.coerce.number().int().min(0).optional(),
  maxRate: z.coerce.number().int().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  sortBy: z
    .enum(["rating", "rate_low", "rate_high", "reviews", "experience"])
    .default("rating"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type CaregiverSearchInput = z.infer<typeof caregiverSearchSchema>;
