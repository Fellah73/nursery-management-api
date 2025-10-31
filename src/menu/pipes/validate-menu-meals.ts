// schedules/pipes/validate-slots.pipe.ts
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { MenuService } from '../menu.service';

@Injectable()
export class ValidateMealsPipe<T, U> implements PipeTransform {
  constructor(private menuService: MenuService) {}
  async transform(value: T): Promise<T> {
    const groupedMeals: Record<string, U[]> = this.groupByDay(value['meals']);

    // iterate over each day's meals to perform validations
    for (const [day, meals] of Object.entries(groupedMeals)) {
      if (meals.length > 3) {
        throw new BadRequestException(
          `Le nombre de repas pour ${day} dépasse la limite autorisée de 3`,
        );
      }

      // check duplicated meals per day
      this.checkDuplicates(meals);

      // check meal structure
      this.checkMealsStructure(meals);
    }

    // handle menu activation call
    this.menuService.handleMenusActivation();

    return value;
  }

  // Group meals per dayOfWeek
  private groupByDay(meals: U[]): Record<string, U[]> {
    return meals.reduce((acc: Record<string, U[]>, meal: U) => {
      if (!acc[meal['dayOfWeek']]) {
        acc[meal['dayOfWeek']] = [];
      }
      acc[meal['dayOfWeek']].push(meal);
      return acc;
    }, {});
  }

  // Check for duplicate meals
  private checkDuplicates(meals: U[]) {
    const seen = new Set<string>();

    for (const meal of meals) {
      const key = `${meal['dayOfWeek']}-${meal['mealType']}`;

      if (seen.has(key)) {
        throw new BadRequestException(
          `Repas dupliqué détecté: ${meal['mealType']} du ${meal['dayOfWeek']}`,
          'Veuillez supprimer les doublons et réessayer.',
        );
      }
      seen.add(key);
    }
  }

  // check meal structure
  private checkMealStructure(meal: U): boolean | { message: string } {
    if (meal) {
      // in case of breakfast and snack , drink and snack are mandatory
      if (meal['mealType'] === 'Breakfast' || meal['mealType'] === 'Gouter') {
        if (!meal['drink'] || !meal['snack']) {
          return {
            message: `Le champ ${['drink', 'snack'].filter((field) => !meal[field]).join(', ')} est obligatoire pour le type de repas 'SNACK'`,
          };
        }
        if (
          meal['starter'] ||
          meal['main_course'] ||
          meal['side_dish'] ||
          meal['dessert']
        ) {
          return {
            message: `Les champs ${['starter', 'main_course', 'side_dish', 'dessert'].filter((field) => meal[field]).join(', ')} sont interdits pour le type de repas ${meal['mealType']}`,
          };
        }

        return true;
        // Lunch case
      } else {
        // for other meal types , starter , main_course , side_dish and dessert are obligatory
        if (
          !meal['starter'] ||
          !meal['main_course'] ||
          !meal['side_dish'] ||
          !meal['dessert'] ||
          !meal['drink']
        ) {
          return {
            message: `Les champs ${['starter', 'main_course', 'side_dish', 'dessert', 'drink'].filter((field) => !meal[field]).join(', ')} sont obligatoires pour le type de repas ${meal['mealType']}`,
          };
        }

        if (meal['snack']) {
          return {
            message: `snack is not authorized for ${meal['mealType']}`,
          };
        }

        return true;
      }
    }
    return true;
  }

  // check meals structure
  private checkMealsStructure(meals: U[]) {
    if (meals && meals.length > 0) {
      for (const meal of meals) {
        const isValid = this.checkMealStructure(meal);
        if (isValid['message']) {
          throw new BadRequestException(
            isValid['message'] + ` for ${meal['dayOfWeek']}`,
          );
        }
      }
    }
  }
}
