import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import { Category } from 'generated/prisma';

export class CreateClassDto {
  @ApiProperty({ example: 'Class A' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'PETIT' })
  @IsEnum(Category, {
    message: 'category must be BEBE ,PETIT ,MOYEN and GRAND',
  })
  category!: Category;

  @ApiProperty({ example: 20 })
  @IsNumber()
  capacity!: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  teacherId!: number;
}

export class ClassesDtoGet {
  @ApiProperty({ example: '10' })
  @IsOptional()
  @IsString()
  perPage?: string;

  @ApiProperty({ example: '1' })
  @IsOptional()
  @IsString()
  page?: number;
}

export class ClassUpdateDto {
  @ApiPropertyOptional({ example: 'Class B' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'MOYEN' })
  @IsOptional()
  @IsEnum(Category, {
    message: 'category must be BEBE ,PETIT ,MOYEN and GRAND',
  })
  category?: Category;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  teacherId?: number;
}
