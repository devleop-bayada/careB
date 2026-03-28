import { z } from "zod";

export const createReviewSchema = z.object({
  careSessionId: z.string().min(1, "돌봄 세션을 선택해주세요."),
  overallRating: z
    .number()
    .int()
    .min(1, "평점은 1점 이상이어야 합니다.")
    .max(5, "평점은 5점 이하여야 합니다."),
  punctuality: z.number().int().min(1).max(5).optional(),
  attitude: z.number().int().min(1).max(5).optional(),
  professionalism: z.number().int().min(1).max(5).optional(),
  communication: z.number().int().min(1).max(5).optional(),
  healthCareSkill: z.number().int().min(1).max(5).optional(),
  content: z
    .string()
    .min(10, "리뷰는 10자 이상 작성해주세요.")
    .max(1000, "리뷰는 1000자 이하여야 합니다."),
  images: z.array(z.string().url()),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
