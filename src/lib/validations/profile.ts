import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다.").max(50).optional(),
  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, "올바른 전화번호 형식을 입력해주세요.")
    .optional(),
  profileImage: z.string().url("올바른 이미지 URL이 아닙니다.").optional(),
  region: z.string().optional(),
  address: z.string().optional(),
  introduction: z.string().max(2000).optional(),
  // Guardian specific
  relationship: z.string().optional(),
  // Caregiver specific
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  birthDate: z.string().optional(),
  experience: z.string().optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  education: z.string().optional(),
  hourlyRate: z.number().int().min(10000).max(100000).optional(),
  additionalRate: z.number().int().min(0).optional(),
  caregiverType: z.enum(["CARE_WORKER", "NURSING_AIDE", "SOCIAL_WORKER", "NURSE"]).optional(),
  serviceCategories: z
    .array(
      z.enum(["HOME_CARE", "HOME_BATH", "HOME_NURSING", "DAY_NIGHT_CARE", "SHORT_TERM_CARE", "HOURLY_CARE", "HOSPITAL_CARE", "DEMENTIA_CARE", "HOSPICE_CARE"])
    )
    .optional(),
  specialties: z.array(z.string()).optional(),
  maxRecipients: z.number().int().min(1).max(5).optional(),
  canDrive: z.boolean().optional(),
  nonsmoker: z.boolean().optional(),
  licenseNumber: z.string().optional(),
});

export const careRecipientSchema = z.object({
  name: z.string().min(1, "어르신 성함을 입력해주세요.").max(50),
  gender: z.enum(["MALE", "FEMALE"], { message: "성별을 선택해주세요." }),
  birthYear: z.number().int().min(1920).max(2010),
  careLevel: z.enum(["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "LEVEL_5", "COGNITIVE_SUPPORT"]).optional(),
  diseases: z.array(z.string()).default([]),
  mobilityLevel: z.enum(["INDEPENDENT", "PARTIALLY_DEPENDENT", "FULLY_DEPENDENT", "BEDRIDDEN"]).default("INDEPENDENT"),
  weight: z.number().min(20).max(200).optional(),
  height: z.number().min(100).max(200).optional(),
  specialNotes: z.string().max(500).optional(),
  medications: z.string().max(500).optional(),
  emergencyContact: z.string().optional(),
  address: z.string().optional(),
  profileImage: z.string().url().optional(),
});

export const certificateSchema = z.object({
  name: z.string().min(1, "자격증 이름을 입력해주세요.").max(100),
  issuingOrganization: z.string().min(1, "발급 기관을 입력해주세요.").max(100),
  issueDate: z.string().min(1, "발급일을 입력해주세요."),
  expirationDate: z.string().optional(),
  certificateNumber: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CareRecipientInput = z.infer<typeof careRecipientSchema>;
export type CertificateInput = z.infer<typeof certificateSchema>;
