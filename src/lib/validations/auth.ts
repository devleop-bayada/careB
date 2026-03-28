import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export const signupSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요."),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .max(100, "비밀번호는 100자 이하여야 합니다."),
  name: z
    .string()
    .min(2, "이름은 2자 이상이어야 합니다.")
    .max(50, "이름은 50자 이하여야 합니다."),
  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, "올바른 전화번호 형식을 입력해주세요. (010-XXXX-XXXX)")
    .optional(),
  role: z.enum(["GUARDIAN", "CAREGIVER"], { message: "역할을 선택해주세요." }),
});

export const guardianProfileSchema = z.object({
  region: z.string().min(1, "지역을 선택해주세요."),
  address: z.string().optional(),
  introduction: z.string().max(1000, "소개는 1000자 이하여야 합니다.").optional(),
  relationship: z.string().optional(),
});

export const caregiverProfileSchema = z.object({
  gender: z.enum(["MALE", "FEMALE"], { message: "성별을 선택해주세요." }),
  birthDate: z.string().optional(),
  region: z.string().min(1, "지역을 선택해주세요."),
  address: z.string().optional(),
  introduction: z.string().max(2000, "소개는 2000자 이하여야 합니다.").optional(),
  experience: z.string().optional(),
  experienceYears: z.number().int().min(0).max(50).default(0),
  education: z.string().optional(),
  hourlyRate: z.number().int().min(10000, "시급은 10,000원 이상이어야 합니다.").max(100000),
  additionalRate: z.number().int().min(0).default(0),
  caregiverType: z.enum(["CARE_WORKER", "NURSING_AIDE", "SOCIAL_WORKER", "NURSE"]).default("CARE_WORKER"),
  serviceCategories: z.array(
    z.enum(["HOME_CARE", "HOME_BATH", "HOME_NURSING", "DAY_NIGHT_CARE", "SHORT_TERM_CARE", "HOURLY_CARE", "HOSPITAL_CARE", "DEMENTIA_CARE", "HOSPICE_CARE"])
  ),
  specialties: z.array(z.string()).default([]),
  maxRecipients: z.number().int().min(1).max(5).default(1),
  canDrive: z.boolean().default(false),
  nonsmoker: z.boolean().default(true),
  licenseNumber: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type GuardianProfileInput = z.infer<typeof guardianProfileSchema>;
export type CaregiverProfileInput = z.infer<typeof caregiverProfileSchema>;
