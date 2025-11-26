import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message:
      'Password must be minimum eight characters, at least one letter and one number',
  })
  password: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
}

export class RegisterDto {
  @IsString()
  name: string;

  @IsString()
  familyName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message:
      'Password must be minimum eight characters, at least one letter and one number',
  })
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^0[567]\d{8}$/, {
    message: 'Phone number must start with 05, 06, or 07 followed by 8 digits',
  })
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'role must be ADMIN, PARENT, or TEACHER' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  @IsEnum(['H', 'F'], { message: 'gender must be H or F' })
  gender: 'H' | 'F';

  @IsOptional()
  @IsString()
  profile_picture?: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  questionId: string;

  @IsString()
  answer: string;
}
