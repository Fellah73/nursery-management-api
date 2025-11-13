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
  @Matches(
    /^(Allergies alimentaires|Allergies respiratoires|Allergies médicamenteuses|Allergies de contact \/ environnement)$/,
    {
      message:
        'category must be one of the following: Allergies alimentaires, Allergies respiratoires, Allergies médicamenteuses, Allergies de contact / environnement',
    },
  )
  category: string;

  @IsString()
  name: string;
}
export class CreateChildDto {
  @IsString()
  full_name: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'birth_date must be in the format YYYY-MM-DD',
  })
  birth_date: string;

  @IsEnum(Gender, {
    message: 'gender must be H or F',
  })
  gender: Gender;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  emergency_contact_name?: string;

  @IsOptional()
  @Matches(/^(05|06|07)[0-9]{8}$/, {
    message:
      'emergency_contact_phone must be a valid phone number starting with 05, 06, or 07',
  })
  emergency_contact_phone?: string;

  @IsOptional()
  @IsString()
  secondary_emergency_contact_name?: string;

  @IsOptional()
  @Matches(/^(05|06|07)[0-9]{8}$/, {
    message:
      'secondary_emergency_contact_phone must be a valid phone number starting with 05, 06, or 07',
  })
  secondary_emergency_contact_phone?: string;

  @Matches(/^(A\+|A-|B\+|B-|AB\+|AB-|O\+|O-)$/, {
    message:
      'blood_type must be one of the following: A+, A-, B+, B-, AB+, AB-, O+, O-',
  })
  blood_type: string;

  @IsOptional()
  @IsString()
  information?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllergyDto)
  allergies?: AllergyDto[];

  @IsOptional()
  @IsString()
  besoins?: string;

  @IsOptional()
  @Matches(/^(COMPLETE|INCOMPLETE|UNKNOWN)$/, {
    message:
      'vaccination_status must be one of the following: COMPLETE, INCOMPLETE, UNKNOWN',
  })
  vaccination_status?: 'COMPLETE' | 'INCOMPLETE' | 'UNKNOWN';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  profile_picture?: string;
}

export class ChildrenDtoGet {
  @IsNumberString()
  admin_id: number;

  @IsString()
  perPage: string;

  @IsOptional()
  @IsNumberString()
  page?: number;
}
