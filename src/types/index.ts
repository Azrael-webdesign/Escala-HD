
export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  position?: string;
  imageUrl?: string;
}

export interface ShiftType {
  id: string;
  code: string;
  description: string;
  color: string;
  startTime?: string;
  endTime?: string;
  breaks?: { start: string; end: string }[];
}

export interface Shift {
  id: string;
  userId: string;
  date: string; // ISO format YYYY-MM-DD
  shiftTypeId: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  imageUrl?: string;
}
