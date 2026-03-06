import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Gender } from 'generated/prisma';

export class AllergyDto {
  @ApiProperty({ example : 'alimentaires' })
  @Matches(/^(alimentaires|respiratoires|médicamenteuses|contact)$/, {
    message:
      'category must be one of the following: alimentaires, respiratoires, médicamenteuses or contact',
  })
  category!: string;

  @ApiProperty({ example : 'arachides' })
  @IsString()
  name!: string;
}

export class CreateChildDto {
  @ApiProperty({ example: 'Fellah_Mohamed' })
  @IsString()
  full_name!: string;

  @ApiProperty({ example: '2020-01-01' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'birth_date must be in the format YYYY-MM-DD',
  })
  birth_date!: string;

  @ApiProperty({ example: 'H' })
  @IsEnum(Gender, {
    message: 'gender must be H or F',
  })
  gender!: Gender;

  @ApiProperty({ example: '16 Rue de la Paix ,Alger Center ,Algeria' })
  @IsString()
  address!: string;

  @ApiProperty({ example: 'Alger Center' })
  @IsString()
  city!: string;

  @ApiPropertyOptional({ example: 'Dad' })
  @IsOptional()
  @IsString()
  emergency_contact_name?: string;

  @ApiPropertyOptional({ example: '0501234567' })
  @IsOptional()
  @Matches(/^(05|06|07)[0-9]{8}$/, {
    message:
      'emergency_contact_phone must be a valid phone number starting with 05, 06, or 07',
  })
  emergency_contact_phone?: string;

  @ApiPropertyOptional({ example: 'Mom' })
  @IsOptional()
  @IsString()
  secondary_emergency_contact_name?: string;

  @ApiPropertyOptional({ example: '0501234568' })
  @IsOptional()
  @Matches(/^(05|06|07)[0-9]{8}$/, {
    message:
      'secondary_emergency_contact_phone must be a valid phone number starting with 05, 06, or 07',
  })
  secondary_emergency_contact_phone?: string;

  @ApiProperty({ example: 'A+' })
  @Matches(/^(A\+|A-|B\+|B-|AB\+|AB-|O\+|O-)$/, {
    message:
      'blood_type must be one of the following: A+, A-, B+, B-, AB+, AB-, O+, O-',
  })
  blood_type!: string;

  @ApiPropertyOptional({ example: 'No allergies' })
  @IsOptional()
  @IsString()
  information?: string;

  @ApiPropertyOptional({ example: 'No special needs' })
  @IsOptional()
  @IsString()
  special_needs?: string;

  @ApiPropertyOptional({ example: 'No allergies' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllergyDto)
  allergies?: AllergyDto[];

  @ApiPropertyOptional({ example: 'Glasses ...' })
  @IsOptional()
  @IsString()
  besoins?: string;

  @ApiPropertyOptional({ example: 'COMPLETE' })
  @IsOptional()
  @Matches(/^(COMPLETE|INCOMPLETE|UNKNOWN)$/, {
    message:
      'vaccination_status must be one of the following: COMPLETE, INCOMPLETE, UNKNOWN',
  })
  vaccination_status?: 'COMPLETE' | 'INCOMPLETE' | 'UNKNOWN';

  @ApiPropertyOptional({ example: 'Like music ,dance' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  profile_picture?: string;
}

export class ChildrenDtoGet {
  @ApiPropertyOptional({ example: '4' })
  @IsString()
  perPage!: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: number;
}

export enum updateType {
  CONTACT = 'contact',
  ADDRESS = 'address',
  MEDICAL_INFO = 'medical_info',
  SPECIAL_NEEDS = 'special_needs',
  NOTES = 'notes',
  VACCINATION_STATUS = 'vaccination_status',
}
