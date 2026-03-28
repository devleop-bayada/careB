import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(2, "제목은 2자 이상이어야 합니다.")
    .max(100, "제목은 100자 이하여야 합니다."),
  content: z
    .string()
    .min(10, "내용은 10자 이상이어야 합니다.")
    .max(5000, "내용은 5000자 이하여야 합니다."),
  category: z
    .string()
    .min(1, "카테고리를 선택해주세요.")
    .max(50),
  images: z.array(z.string().url()).optional().default([]),
});

export const updatePostSchema = createPostSchema.partial();

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글을 입력해주세요.")
    .max(500, "댓글은 500자 이하여야 합니다."),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
