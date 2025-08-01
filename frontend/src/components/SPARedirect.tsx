"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SPARedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams) {
      const path = searchParams.get("path");
      if (path) {
        router.replace(path);
      }
    }
  }, [searchParams, router]);

  return null;
}
