import { z } from "zod";

export const createMatchSchema = z.object({
  caregiverId: z.string().min(1, "요양보호사를 선택해주세요."),
  serviceCategory: z.enum(
    ["HOME_CARE", "HOME_BATH", "HOME_NURSING", "DAY_NIGHT_CARE", "SHORT_TERM_CARE", "HOURLY_CARE", "HOSPITAL_CARE", "DEMENTIA_CARE", "HOSPICE_CARE"],
    { message: "서비스 유형을 선택해주세요." }
  ),
  startDate: z.string().min(1, "시작일을 선택해주세요."),
  endDate: z.string().optional(),
  schedule: z
    .array(
      z.object({
        dayOfWeek: z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, "올바른 시간 형식이 아닙니다."),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, "올바른 시간 형식이 아닙니다."),
      })
    )
    .min(1, "스케줄을 1개 이상 선택해주세요."),
  specialRequests: z.string().max(500, "특별 요청사항은 500자 이하여야 합니다.").optional(),
  estimatedRate: z.number().int().min(0).optional(),
  careRecipientIds: z.array(z.string()).optional(),
});

export const updateMatchStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"], { message: "올바른 상태값이 아닙니다." }),
  cancelReason: z.string().max(500).optional(),
});

export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["ACCEPTED", "REJECTED", "CANCELLED"],
  ACCEPTED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchStatusInput = z.infer<typeof updateMatchStatusSchema>;
