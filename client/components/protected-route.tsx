"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthFromStorage, type UserRole, hasPermission } from "@/lib/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
  requiredPermission?: string | string[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, requiredRole, requiredPermission, fallback }: ProtectedRouteProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const auth = getAuthFromStorage()

    if (!auth.isAuthenticated) {
      router.push("/login")
      return
    }

    let authorized = true

    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      authorized = roles.includes(auth.user?.role as UserRole)
    }

    if (authorized && requiredPermission) {
      const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]
      authorized = permissions.some((perm) => hasPermission(auth.user?.role as UserRole, perm))
    }

    if (!authorized) {
      router.push("/dashboard")
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [router, requiredRole, requiredPermission])

  if (isLoading) {
    return fallback || <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAuthorized) {
    return fallback || null
  }

  return <>{children}</>
}
