export type UserRole = 'customer' | 'driver' | 'operator';

export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
  fullName: string | null;
  email: string | null;
  phone: string | null;
}

export function isUserRole(value: unknown): value is UserRole {
  return value === 'customer' || value === 'driver' || value === 'operator';
}
