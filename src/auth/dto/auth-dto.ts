export class LoginDto {
  email: string;
  password: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
}

export enum Gender {
  H = 'H',
  F = 'F',
}

export class RegisterDto {
  name: string;
  familyName: string;
  email: string;
  password: string;
  phone?: number;
  role?: UserRole;
  address?: string;
  gender: Gender;
  profile_picture?: string;
}