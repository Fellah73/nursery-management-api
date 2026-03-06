import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Category, DayOfWeek, MenuType } from 'generated/prisma';

export class CreateMenuPeriodDto {
  @ApiPropertyOptional({ example: 'Ramdan 2026' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '2026-04-09' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'startDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  startDate?: Date;

  @ApiPropertyOptional({ example: '2026-05-09' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'endDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  endDate?: Date;

  @ApiProperty({ example: 'PETIT' })
  @IsEnum(Category, {
    message: 'category must be BEBE ,PETIT ,MOYEN and GRAND',
  })
  category!: Category;
}

export class UpdateMenuPeriodDto {
  @ApiPropertyOptional({ example: 'Ramdan 2026' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'startDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  startDate?: Date;

  @ApiPropertyOptional({ example: '2026-05-09' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'endDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  endDate?: Date;
}

export class MealSlotDto {
  @ApiPropertyOptional({ example: 'MONDAY' })
  @IsEnum(DayOfWeek, {
    message:
      'dayOfWeek must be MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, or SUNDAY',
  })
  dayOfWeek!: DayOfWeek;

  @ApiPropertyOptional({ example: 'BREAKFAST' })
  @IsEnum(MenuType, {
    message: 'mealType must be BREAKFAST, LUNCH or SNACK',
  })
  mealType!: MenuType;

  @ApiPropertyOptional({ example: 'Salad' })
  @IsOptional()
  @IsString()
  starter?: string;

  @ApiPropertyOptional({ example: 'Chicken Curry' })
  @IsOptional()
  @IsString()
  main_course?: string;

  @ApiPropertyOptional({ example: 'Rice' })
  @IsOptional()
  @IsString()
  side_dish?: string;

  @ApiPropertyOptional({ example: 'Fruit Salad' })
  @IsOptional()
  @IsString()
  dessert?: string;

  @ApiPropertyOptional({ example: 'Orange Juice' })
  @IsOptional()
  @IsString()
  drink?: string;

  @ApiPropertyOptional({ example: 'Apple' })
  @IsOptional()
  @IsString()
  snack?: string;

  @ApiPropertyOptional({ example: 'No nuts' })
  @IsOptional()
  @IsString()
  special_note?: string;
}

export class CreateMenuMealsDto {
  @ApiProperty({ type: [MealSlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealSlotDto)
  meals!: MealSlotDto[];

  @ApiProperty({ example: 'GRAND' })
  @IsEnum(Category, {
    message: 'category must be BEBE ,PETIT ,MOYEN and GRAND',
  })
  category!: Category;
}
