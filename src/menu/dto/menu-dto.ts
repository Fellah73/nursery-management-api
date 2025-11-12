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
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'startDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  startDate?: Date;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'endDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  endDate?: Date;

  @IsEnum(Category, {
    message: 'category must be BEBE ,PETIT ,MOYEN and GRAND',
  })
  category: Category;
}

export class UpdateMenuPeriodDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'startDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  startDate?: Date;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'endDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  endDate?: Date;
}

export class MealSlotDto {
  @IsEnum(DayOfWeek, {
    message:
      'dayOfWeek must be MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, or SUNDAY',
  })
  dayOfWeek: DayOfWeek;

  @IsEnum(MenuType, {
    message: 'mealType must be BREAKFAST, LUNCH or SNACK',
  })
  mealType: MenuType;

  @IsOptional()
  @IsString()
  starter?: string;

  @IsOptional()
  @IsString()
  main_course?: string;

  @IsOptional()
  @IsString()
  side_dish?: string;

  @IsOptional()
  @IsString()
  dessert?: string;

  @IsOptional()
  @IsString()
  drink?: string;

  @IsOptional()
  @IsString()
  snack?: string;

  @IsOptional()
  @IsString()
  special_note?: string;
}

export class CreateMenuMealsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealSlotDto)
  meals: MealSlotDto[];

  @IsEnum(Category, {
    message: 'category must be BEBE ,PETIT ,MOYEN and GRAND',
  })
  category: Category;
}
