"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthFromStorage, type AuthContext, type UserRole, hasPermission } from "@/lib/auth"

export function useAuth() {
  const router = useRouter()
  const [auth, setAuth] = useState<AuthContext>({ user: null, token: null, isAuthenticated: false })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authContext = getAuthFromStorage()
    setAuth(authContext)
    setIsLoading(false)
  }, [])

  const requireAuth = (redirectTo = "/login") => {
    if (!isLoading && !auth.isAuthenticated) {
      router.push(redirectTo)
    }
  }

  const requireRole = (role: UserRole | UserRole[], redirectTo = "/dashboard") => {
    if (!isLoading && auth.isAuthenticated) {
      const roles = Array.isArray(role) ? role : [role]
      if (!roles.includes(auth.user?.role as UserRole)) {
        router.push(redirectTo)
      }
    }
  }

  const requirePermission = (permission: string | string[], redirectTo = "/dashboard") => {
    if (!isLoading && auth.isAuthenticated && auth.user) {
      const permissions = Array.isArray(permission) ? permission : [permission]
      const hasPerms = permissions.some((perm) => hasPermission(auth.user!.role as UserRole, perm))
      if (!hasPerms) {
        router.push(redirectTo)
      }
    }
  }

  return {
    ...auth,
    isLoading,
    requireAuth,
    requireRole,
    requirePermission,
  }
}
