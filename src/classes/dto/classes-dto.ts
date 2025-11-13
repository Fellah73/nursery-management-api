import {
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Category } from 'generated/prisma';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsEnum(Category, {
    message: 'category must be BEBE ,PETIT ,MOYEN and GRAND',
  })
  category: Category;

  @IsNumber()
  capacity: number;

  @IsNumber()
  teacherId: number;
}

export class ClassesDtoGet {
  @IsNumberString()
  admin_id: number;

  @IsOptional()
  @IsString()
  perPage: string;

  @IsOptional()
  @IsString()
  page?: number;
}

export class ClassUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Category, {
    message: 'category must be BEBE ,PETIT ,MOYEN and GRAND',
  })
  category?: Category;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsNumber()
  teacherId?: number;
}
