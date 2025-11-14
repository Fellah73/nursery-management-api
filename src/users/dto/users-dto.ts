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
  @IsNumberString()
  admin_id: number;

  @IsNumberString()
  perPage: string;

  @IsOptional()
  @IsNumberString()
  page?: number;
}

export class UserDtoUpdate {
  @IsOptional()
  @IsEmail()
  @IsString()
  email?: string;

  @IsOptional()
  @Matches(/^(5|6|7)[0-9]{8}$/, {
    message:
      'Invalid phone number format, must start with 5, 6 or 7 followed by 8 digits',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  profile_picture?: string;
}

export class UserDtoUpdateProfile {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Matches(/^(5|6|7)[0-9]{8}$/, {
    message:
      'Invalid phone number format, must start with 5, 6 or 7 followed by 8 digits',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  profile_picture?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z].*$/, {
    message: 'name must start with an uppercase letter',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z].*$/, {
    message: 'family name must start with an uppercase letter',
  })
  familyName?: string;
}

export class UserDtoUpdateStatus {
  @IsString()
  @Matches(/^(enable|disable)$/, {
    message: 'Invalid status, must be enable or disable',
  })
  status: 'enable' | 'disable';
}

export class UserGradeUpdateDto {
  @Matches(/^(ADMIN|SUPER_ADMIN)$/, {
    message: 'Invalid grade, must be ADMIN or SUPER_ADMIN',
  })
  grade: 'ADMIN' | 'SUPER_ADMIN';
}

export class UserDtoCreate {
  @IsString()
  @Matches(/^[A-Z].*$/, {
    message: 'name must start with an uppercase letter',
  })
  name: string;

  @IsString()
  @Matches(/^[A-Z].*$/, {
    message: 'family name must start with an uppercase letter',
  })
  familyName: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^(5|6|7)[0-9]{8}$/, {
    message:
      'Invalid phone number format, must start with 5, 6 or 7 followed by 8 digits',
  })
  phone?: string;

  @Matches(/^(ADMIN|PARENT|TEACHER)$/, {
    message: 'Invalid role, must be ADMIN, PARENT, or TEACHER',
  })
  role: UserRole;

  @IsOptional()
  @IsString()
  address?: string;

  @Matches(/^(H|F)$/, {
    message: 'Invalid gender, must be H or F',
  })
  gender: Gender;

  @IsOptional()
  @IsString()
  profile_picture?: string;
}
