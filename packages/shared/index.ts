export type UserRole = "ADMIN" | "SUPERVISOR" | "OPERADOR";

export interface User {
  id: string;
  fullName: string;
  email: string;
  cpf: string;
  role: UserRole;
  status: string;
}

export interface Employee {
  id: string;
  name: string;
  cpf: string;
  position: string;
  unit: string;
  bond: string;
  phone?: string;
  registrationType: "PERMANENTE" | "PROVISORIO";
  expirationDate?: string;
  status: string;
}

export interface Vehicle {
  id: string;
  employeeId: string;
  plate: string;
  stickerNumber?: number;
  model: string;
  color: string;
  isPrimary: boolean;
  status: string;
}