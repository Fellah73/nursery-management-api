import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123' })
  @IsOptional()
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message:
      'Password must be minimum eight characters, at least one letter and one number',
  })
  password!: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
}

export class RegisterDto {
  @ApiProperty({ example: 'Mohamed' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Fellah' })
  @IsString()
  familyName!: string;

  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message:
      'Password must be minimum eight characters, at least one letter and one number',
  })
  password!: string;

  @ApiProperty({ example: '0501234567' })
  @IsOptional()
  @IsString()
  @Matches(/^0[567]\d{8}$/, {
    message: 'Phone number must start with 05, 06, or 07 followed by 8 digits',
  })
  phone?: string;

  @ApiProperty({ example: 'ADMIN' })
  @IsOptional()
  @IsEnum(UserRole, { message: 'role must be ADMIN, PARENT, or TEACHER' })
  role?: UserRole;

  @ApiProperty({ example: '16 Rue de la Paix ,Alger Center ,Algeria' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'H' })
  @IsString()
  @IsEnum(['H', 'F'], { message: 'gender must be H or F' })
  gender!: 'H' | 'F';

  @ApiProperty({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  profile_picture?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '5' })
  @IsString()
  questionId!: string;

  @ApiProperty({ example: 'Pink' })
  @IsString()
  answer!: string;
}
