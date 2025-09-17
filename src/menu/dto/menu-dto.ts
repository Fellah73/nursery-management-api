import { Category, DayOfWeek, MenuType } from 'generated/prisma';

export class CreateMenuPeriodDto {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  category: Category;
}

export class CreateMenuMealsDto {
  meals: {
    dayOfWeek: DayOfWeek;
    mealType: MenuType;
    starter?: string;
    main_course?: string;
    side_dish?: string;
    dessert?: string;
    drink?: string;
    snack?: string;
    special_note?: string;
  }[];
  category: Category;
}
