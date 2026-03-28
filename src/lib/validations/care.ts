import { z } from "zod";

export const createCareSessionSchema = z.object({
  matchId: z.string().min(1, "매칭을 선택해주세요."),
  scheduledDate: z.string().min(1, "날짜를 선택해주세요."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "올바른 시간 형식이 아닙니다. (HH:mm)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "올바른 시간 형식이 아닙니다. (HH:mm)"),
  hourlyRate: z.number().int().min(10000, "시급은 10,000원 이상이어야 합니다."),
  careRecipientIds: z.array(z.string()).min(1, "돌봄 대상 어르신을 1명 이상 선택해주세요."),
  notes: z.string().max(500).optional(),
});

export const createJournalSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요.").max(100, "제목은 100자 이하여야 합니다."),
  content: z
    .string()
    .min(10, "일지 내용은 10자 이상 작성해주세요.")
    .max(5000, "일지 내용은 5000자 이하여야 합니다."),
  activities: z.array(z.string()),
  mood: z.string().optional(),
  meals: z.string().optional(),
  bloodPressure: z.string().optional(),
  bloodSugar: z.number().int().min(0).max(600).optional(),
  temperature: z.number().min(34).max(42).optional(),
  waterIntake: z.number().int().min(0).max(5000).optional(),
  bowelMovement: z.string().optional(),
  medicationTaken: z.boolean().default(false),
  exerciseLog: z.string().optional(),
  mentalState: z.string().optional(),
  sleepQuality: z.string().optional(),
  images: z.array(z.string()),
});

export type CreateCareSessionInput = z.infer<typeof createCareSessionSchema>;
export type CreateJournalInput = z.infer<typeof createJournalSchema>;
