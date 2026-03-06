import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class TeacherDtoGet {
  @ApiProperty({ example: '10' })
  @IsNumberString()
  perPage!: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: number;
}

export class TeacherDtoUpdate {
  @ApiPropertyOptional({ example: 'teacher@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule, une minuscule et un chiffre',
  })
  password!: string;

  @ApiPropertyOptional({ example: '0555441134' })
  @IsOptional()
  @Matches(/^(5|6|7)[0-9]{8}$/, {
    message:
      'Invalid phone number format, must start with 5, 6 or 7 followed by 8 digits',
  })
  phone?: string;

  @ApiPropertyOptional({ example: '16 Rue La Paix ,Alger Centre , Alger' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  profile_picture?: string;
}

export class TeacherDtoCreate extends TeacherDtoUpdate {
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
}
