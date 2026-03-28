import { useMutation } from "@tanstack/react-query";

export function useUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "파일 업로드에 실패했습니다.");
      }
      return res.json() as Promise<{ url: string }>;
    },
  });
}
