export class CreateMenuDto {
  type: MenuType;
  starter?: string;
  main_course?: string;
  side_dish?: string;
  dessert?: string;
  drink?: string;
  snack?: string;
  special_note?: string;
}
export class UpdateMenuDto {
  starter?: string;
  main_course?: string;
  side_dish?: string;
  dessert?: string;
  drink?: string;
  snack?: string;
  special_note?: string;
}

enum MenuType {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Gouter = 'Gouter',
}
