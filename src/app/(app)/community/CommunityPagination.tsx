"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Pagination from "@/components/ui/Pagination";

interface CommunityPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function CommunityPagination({ currentPage, totalPages }: CommunityPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="pb-4">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
