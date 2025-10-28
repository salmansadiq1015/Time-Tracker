"use client"

import type { UserRole } from "@/lib/auth"

interface RoleBadgeProps {
  role: UserRole
  className?: string
}

export function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  const roleStyles: Record<UserRole, { bg: string; text: string; label: string }> = {
    admin: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      label: "Admin",
    },
    dispatcher: {
      bg: "bg-accent/10",
      text: "text-accent",
      label: "Dispatcher",
    },
    user: {
      bg: "bg-primary/10",
      text: "text-primary",
      label: "User",
    },
  }

  const style = roleStyles[role]

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${style.bg} ${style.text} ${className}`}>
      {style.label}
    </span>
  )
}
