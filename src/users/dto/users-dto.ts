import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Gender } from 'generated/prisma';
import { UserRole } from 'src/auth/dto/auth-dto';

export class UserDtoGet {
  @ApiProperty({ example: 1 })
  @IsNumberString()
  admin_id!: number;

  @ApiProperty({ example: '10' })
  @IsNumberString()
  perPage!: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: number;
}

export class UserDtoUpdate {
  @ApiPropertyOptional({ example: 'user@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '0501234567' })
  @IsOptional()
  @Matches(/^(5|6|7)[0-9]{8}$/, {
    message:
      'Invalid phone number format, must start with 5, 6 or 7 followed by 8 digits',
  })
  phone?: string;

  @ApiPropertyOptional({ example: '16 Rue de la Paix ,Alger Center ,Algeria' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  profile_picture?: string;
}

export class UserDtoUpdateProfile {
  @ApiPropertyOptional({ example: 'user@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '0501234567' })
  @IsOptional()
  @Matches(/^(5|6|7)[0-9]{8}$/, {
    message:
      'Invalid phone number format, must start with 5, 6 or 7 followed by 8 digits',
  })
  phone?: string;

  @ApiPropertyOptional({ example: '16 Rue de la Paix ,Alger Center ,Algeria' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  profile_picture?: string;

  @ApiPropertyOptional({ example: 'Mohamed' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z].*$/, {
    message: 'name must start with an uppercase letter',
  })
  name?: string;

  @ApiPropertyOptional({ example: 'Fellah' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z].*$/, {
    message: 'family name must start with an uppercase letter',
  })
  familyName?: string;
}

export class UserDtoUpdateStatus {
  @ApiProperty({ example: 'enable' })
  @IsString()
  @Matches(/^(enable|disable)$/, {
    message: 'Invalid status, must be enable or disable',
  })
  status!: 'enable' | 'disable';
}

export class UserGradeUpdateDto {
  @ApiProperty({ example: 'ADMIN' })
  @Matches(/^(ADMIN|SUPER_ADMIN)$/, {
    message: 'Invalid grade, must be ADMIN or SUPER_ADMIN',
  })
  grade!: 'ADMIN' | 'SUPER_ADMIN';
}

export class UserDtoCreate {
  @ApiProperty({ example: 'Mohamed' })
  @IsString()
  @Matches(/^[A-Z].*$/, {
    message: 'name must start with an uppercase letter',
  })
  name!: string;

  @ApiProperty({ example: 'Fellah' })
  @IsString()
  @Matches(/^[A-Z].*$/, {
    message: 'family name must start with an uppercase letter',
  })
  familyName!: string;

  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule, une minuscule et un chiffre',
  })
  password!: string;

  @ApiProperty({ example: '0501234567' })
  @IsOptional()
  @IsString()
  @Matches(/^(5|6|7)[0-9]{8}$/, {
    message:
      'Invalid phone number format, must start with 5, 6 or 7 followed by 8 digits',
  })
  phone?: string;

  @ApiProperty({ example: 'ADMIN' })
  @Matches(/^(ADMIN|PARENT|TEACHER)$/, {
    message: 'Invalid role, must be ADMIN, PARENT, or TEACHER',
  })
  role!: UserRole;

  @ApiProperty({ example: '16 Rue de la Paix ,Alger Center ,Algeria' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'H' })
  @Matches(/^(H|F)$/, {
    message: 'Invalid gender, must be H or F',
  })
  gender!: Gender;

  @ApiProperty({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  profile_picture?: string;
}
