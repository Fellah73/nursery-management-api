import {
  IsEmail,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class TeacherDtoGet {
  @IsNumberString()
  admin_id: number;

  @IsNumberString()
  perPage: string;

  @IsOptional()
  @IsNumberString()
  page?: number;
}

export class TeacherDtoUpdate {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule, une minuscule et un chiffre',
  })
  password: string;

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

export class TeacherDtoCreate extends TeacherDtoUpdate {
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
}
