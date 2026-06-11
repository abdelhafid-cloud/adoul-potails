import type { User } from "@/types";

export function isSuperAdmin(user: User | null | undefined): boolean {
  return user?.role === "super_admin";
}
