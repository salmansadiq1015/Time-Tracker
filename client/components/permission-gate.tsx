"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { hasAnyPermission, hasAllPermissions } from "@/lib/auth"

interface PermissionGateProps {
  children: React.ReactNode
  permission?: string | string[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

export function PermissionGate({ children, permission, requireAll = false, fallback = null }: PermissionGateProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!user) {
    return fallback
  }

  if (!permission) {
    return <>{children}</>
  }

  const permissions = Array.isArray(permission) ? permission : [permission]

  const hasAccess = requireAll ? hasAllPermissions(user.role, permissions) : hasAnyPermission(user.role, permissions)

  if (!hasAccess) {
    return fallback
  }

  return <>{children}</>
}
