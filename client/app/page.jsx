"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("Ttoken");
    const user = localStorage.getItem("Tuser");
    if (token) {
      router.push(
        user.role === "user" ? "/dashboard/time-tracker": user.role === "client" ? "/dashboard/projects" : "/dashboard/users"
      );
    } else {
      router.push("/login");
    }
  }, [router]);

  return null;
}
