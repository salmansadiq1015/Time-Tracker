"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("Ttoken");
    if (token) {
      router.push("/dashboard/time-tracker");
    } else {
      router.push("/login");
    }
  }, [router]);

  return null;
}
