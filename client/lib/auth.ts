export type UserRole = "user" | "dispatcher" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthContext {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Permission definitions for each role
export const rolePermissions: Record<UserRole, string[]> = {
  user: ["view_own_time_entries", "create_time_entries", "view_own_profile"],
  dispatcher: [
    "view_own_time_entries",
    "create_time_entries",
    "view_own_profile",
    "view_all_users",
    "manage_users",
    "view_all_time_entries",
  ],
  admin: [
    "view_own_time_entries",
    "create_time_entries",
    "view_own_profile",
    "view_all_users",
    "manage_users",
    "view_all_time_entries",
    "manage_time_entries",
    "view_admin_dashboard",
    "generate_reports",
    "manage_system_settings",
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: UserRole,
  permissions: string[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(
  role: UserRole,
  permissions: string[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

export function getAuthFromStorage(): AuthContext {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false };
  }

  const token = localStorage.getItem("Ttoken");
  const userStr = localStorage.getItem("Tuser");

  if (!token || !userStr) {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    const user = JSON.parse(userStr);
    return { user, token, isAuthenticated: true };
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
}

export function clearAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}
