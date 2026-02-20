import { Body, Injectable, Param, Query } from '@nestjs/common';
import { Category } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateMenuMealsDto,
  CreateMenuPeriodDto,
  UpdateMenuPeriodDto,
} from './dto/menu-dto';

@Injectable()
export class MenuService {
  constructor(private readonly prismaService: PrismaService) {}

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // service : done
  async getMenuPeriods() {
    try {
      await this.handleMenusActivation();

      const menuPeriods = await this.prismaService.menuPeriod.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          category: true,
          menus: {
            select: {
              dayOfWeek: true,
            },
            orderBy: { dayOfWeek: 'asc' },
          },
        },
        orderBy: { category: 'asc' },
      });

      // Add unique day count for each menu period
      const menuPeriodsWithDayCount = menuPeriods.map((period) => ({
        ...period,
        _count: {
          menus: period.menus.length,
          uniqueDays: new Set(period.menus.map((menu) => menu.dayOfWeek)).size,
        },
      }));

      // menu periods grouped by category
      const groupedMenuPeriods = menuPeriodsWithDayCount.reduce(
        (acc, period) => {
          if (!acc[period.category]) {
            acc[period.category] = [];
          }
          acc[period.category].push(period);
          return acc;
        },
        {},
      );

      return {
        status: 200,
        message: 'Menu periods retrieved successfully',
        success: true,
        menuPeriodsByCategory: groupedMenuPeriods,
      };
    } catch (error) {
      return {
        status: 500,
        message: error.message || 'Internal server error',
        success: false,
      };
    }
  }

  // service : done
  async createMenuPeriod(
    @Body() body: CreateMenuPeriodDto,
    @Query('type') type: string,
  ) {
    try {
      const category = body.category;

      if (!(category in Category)) {
        return {
          status: 400,
          message: `Invalid category. Valid categories are: ${Object.values(Category).join(', ')}`,
          success: false,
        };
      }

      const existingPeriod = await this.prismaService.menuPeriod.findFirst({
        where: {
          category: category,
          isActive: true,
        },
      });

      if (existingPeriod && type === 'current') {
        return {
          status: 400,
          message: `An active menu period for category ${category} already exists.`,
          success: false,
        };
      }

      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const newMenuPeriod = await this.prismaService.menuPeriod.create({
        data: {
          name:
            type === 'current'
              ? `${category}-${body.startDate || new Date().toISOString().split('T')[0]}--${body.endDate || new Date().toISOString().split('T')[0]}`
              : body.name!,
          startDate: new Date(
            (body.startDate || new Date().toISOString().split('T')[0]) +
              'T00:00:00.000Z',
          ),
          endDate: body.endDate
            ? new Date(body.endDate + 'T00:00:00.000Z')
            : null,
          category: body.category!,
          isActive: type === 'current' ? true : false,
        },
      });
      if (!newMenuPeriod) {
        return {
          status: 500,
          message: 'Failed to update menu period',
          success: false,
        };
      }

      return {
        status: 200,
        message: 'Menu period updated successfully',
        success: true,
        data: newMenuPeriod.id,
      };
    } catch (error) {
      return {
        status: 500,
        message: error.message || 'Internal server error',
        success: false,
      };
    }
  }

  // service : done
  async updateMenuPeriod(
    @Body() body: UpdateMenuPeriodDto,
    @Param('periodId') periodId: string,
  ) {
    try {
      const existingPeriod = await this.prismaService.menuPeriod.findFirst({
        where: {
          id: Number(periodId),
        },
      });

      const updatedMenuPeriod = await this.prismaService.menuPeriod.update({
        where: { id: Number(periodId) },
        data: {
          startDate: body.startDate
            ? new Date(body.startDate + 'T00:00:00.000Z')
            : existingPeriod!.startDate,
          endDate: body.endDate
            ? new Date(body.endDate + 'T00:00:00.000Z')
            : existingPeriod!.endDate,
        },
      });

      if (!updatedMenuPeriod) {
        return {
          status: 500,
          message: 'Failed to create menu period',
          success: false,
        };
      }

      return {
        status: 201,
        message: 'Menu period created successfully',
        success: true,
      };
    } catch (error) {
      return {
        status: 500,
        message: error.message || 'Internal server error',
        success: false,
      };
    }
  }

  // service : done
  async getProgrammedMenuPeriods() {
    try {
      await this.handleMenusActivation();

      const inactiveMenuPeriods = await this.prismaService.menuPeriod.findMany({
        where: {
          isActive: false,
        },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          category: true,
        },
        orderBy: { category: 'asc' },
      });

      // pas de menu periods found
      if (!inactiveMenuPeriods || inactiveMenuPeriods.length === 0) {
        return {
          status: 200,
          message: 'No inactive menu periods found',
          programmedMenuPeriods: [],
          success: true,
        };
      }

      // the inactive menu periods found should be ordered by category and in each one contain the number of associated menuPeriods
      const inactiveMenuPeriodsByCategory = inactiveMenuPeriods.reduce(
        (acc, period) => {
          if (!acc[period.category]) {
            acc[period.category] = {
              category: period.category,
              periods: [],
              count: 0,
            };
          }
          acc[period.category].periods.push(period);
          acc[period.category].count++;
          return acc;
        },
        {} as Record<
          string,
          { category: string; periods: any[]; count: number }
        >,
      );

      return {
        status: 200,
        message: 'Inactive menu periods retrieved successfully',
        programmedMenuPeriods: inactiveMenuPeriodsByCategory,
        success: true,
      };
    } catch (error) {
      return {
        status: 500,
        message: error.message || 'Internal server error',
        success: false,
      };
    }
  }

  // service : done
  async getMenuMeals(category: Category) {
    try {
      if (!(category in Category)) {
        return {
          status: 400,
          message: `Invalid category. Valid categories are: ${Object.values(Category).join(', ')}`,
          success: false,
        };
      }

      await this.handleMenusActivation();

      const activeMenuPeriods = await this.prismaService.menuPeriod.findMany({
        where: {
          isActive: true,
          category: category,
        },
      });

      const menuMeals = await this.prismaService.menu.findMany({
        where: {
          menuPeriodId: {
            in: activeMenuPeriods.map((period) => period.id),
          },
        },
        select: {
          id: true,
          dayOfWeek: true,
          mealType: true,
          starter: true,
          main_course: true,
          side_dish: true,
          dessert: true,
          drink: true,
          snack: true,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
      });

      const personalizedMeals = menuMeals.map((meal) => {
        if (meal.mealType === 'Breakfast' || meal.mealType === 'Gouter') {
          return {
            ...meal,
            side_dish: undefined,
            main_course: undefined,
            starter: undefined,
            dessert: undefined,
          };
        }
        if (meal.mealType === 'Lunch') {
          return {
            ...meal,
            snack: undefined,
          };
        }
        return meal;
      });

      // return the meals grouped by day of the week
      const mealsByDay = personalizedMeals.reduce((acc, meal) => {
        const day = meal.dayOfWeek;
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(meal);
        return acc;
      }, {});

      return {
        status: 200,
        message: 'Menu meals retrieved successfully',
        success: true,
        meals: mealsByDay,
      };
    } catch (error) {
      return {
        status: 500,
        message: error.message || 'Internal server error',
        success: false,
      };
    }
  }

  // service : done
  async getMenuMealTimes() {
    try {
      const nurserySettings =
        await this.prismaService.nurserySettings.findFirst({});

      if (!nurserySettings) {
        return {
          status: 404,
          message: 'Nursery settings not found',
          success: false,
        };
      }

      let mealTimes = new Map<string, string>();
      mealTimes.set('Breakfast', nurserySettings?.openingTime);

      let time = this.timeToMinutes(nurserySettings.openingTime);
      time += nurserySettings.breakfastDuration + nurserySettings.slotInterval;

      // iterate over the slots per day
      for (let i = 1; i <= nurserySettings.slotsPerDay!; i++) {
        // the time of a meal (Lunch) is after half of the slots
        if (i === nurserySettings.slotsPerDay / 2 + 1) {
          mealTimes.set('Lunch', `${Math.floor(time / 60)}:${time % 60}`);

          // add lunch duration + interval
          time += nurserySettings.lunchDuration + nurserySettings.slotInterval;

          // add nap duration + interval
          time += nurserySettings.napDuration + nurserySettings.slotInterval;
        }

        time += nurserySettings.slotDuration + nurserySettings.slotInterval;
      }

      mealTimes.set('Gouter', `${Math.floor(time / 60)}:${time % 60}`);

      return {
        status: 200,
        message: 'Menu meal times retrieved successfully',
        success: true,
        mealTimes: Object.fromEntries(mealTimes),
      };
    } catch (error) {
      return {
        status: 500,
        message: error.message || 'Internal server error',
        success: false,
      };
    }
  }

  // service : done
  async getMenuMealsByPeriod(@Param('periodId') periodId: string) {
    try {
      const menuPeriod = await this.prismaService.menuPeriod.findUnique({
        where: { id: Number(periodId) },
      });
      if (!menuPeriod) {
        return {
          status: 404,
          message: 'Menu period not found',
          success: false,
        };
      }

      await this.handleMenusActivation();

      const menuMeals = await this.prismaService.menu.findMany({
        where: {
          menuPeriodId: {
            equals: menuPeriod.id,
          },
        },
        select: {
          id: true,
          dayOfWeek: true,
          mealType: true,
          starter: true,
          main_course: true,
          side_dish: true,
          dessert: true,
          drink: true,
          snack: true,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
      });

      // if the meal type is breakfast or snack ,only return snack and drink
      // if the meal type is lunch  return : starter, main_course, side_dish, dessert, drink
      const personalizedMeals = menuMeals.map((meal) => {
        if (meal.mealType === 'Breakfast' || meal.mealType === 'Gouter') {
          return {
            ...meal,
            side_dish: undefined,
            main_course: undefined,
            starter: undefined,
            dessert: undefined,
          };
        }
        if (meal.mealType === 'Lunch') {
          return {
            ...meal,
            snack: undefined,
          };
        }
        return meal;
      });

      // return the meals grouped by day of the week
      const mealsByDay = personalizedMeals.reduce((acc, meal) => {
        const day = meal.dayOfWeek;
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(meal);
        return acc;
      }, {});

      return {
        status: 200,
        message: 'Menu meals retrieved successfully',
        success: true,
        category: menuPeriod.category,
        meals: mealsByDay,
        menuInfos: {
          startDate: menuPeriod.startDate.toISOString().split('T')[0],
          endDate: menuPeriod.endDate?.toISOString().split('T')[0] || null,
        },
      };
    } catch (error) {
      return {
        status: 500,
        message: error.message || 'Internal server error',
        success: false,
      };
    }
  }

  // service : done
  async deleteMenuPeriod(@Param('periodId') periodId: string) {
    try {
      await this.handleMenusActivation();

      // delete all the meals associated with this period
      await this.prismaService.menu.deleteMany({
        where: { menuPeriodId: Number(periodId) },
      });

      // delete the period
      await this.prismaService.menuPeriod.delete({
        where: { id: Number(periodId) },
      });

      return {
        status: 200,
        message: 'Menu period deleted successfully',
        success: true,
      };
    } catch (error) {
      return {
        status: 500,
        message: error.message || 'Internal server error',
        success: false,
      };
    }
  }

  // service : done
  async createMenusBulk(
    @Body() body: CreateMenuMealsDto,
    @Param('periodId') periodId: string,
  ) {
    try {
      let newPeriodId: string = '';
      if (periodId === 'new') {
        // create a new current period for the specified category
        const newPeriod = await this.createMenuPeriod(
          {
            category: body.category,
          },
          'current',
        );

        if (!newPeriod.success) {
          console.error('Error creating new menu period:', newPeriod.message);
        }

        newPeriodId = await this.prismaService.menuPeriod
          .findFirst({
            where: {
              category: body.category,
              isActive: true,
            },
            select: { id: true },
            orderBy: { createdAt: 'desc' },
          })
          .then((period) => (period ? period.id.toString() : ''));
      }
      const finalPeriodId = periodId === 'new' ? newPeriodId : periodId;

      const menuPeriod = await this.prismaService.menuPeriod.findUnique({
        where: { id: Number(finalPeriodId) },
      });
      if (!menuPeriod) {
        return {
          status: 404,
          message: 'Menu period not found',
          success: false,
        };
      }

      const existingMeals = await this.prismaService.menu.findMany({
        where: { menuPeriodId: Number(finalPeriodId) },
      });

      // delete all existing meals for this period
      if (existingMeals.length > 0) {
        await this.prismaService.menu.deleteMany({
          where: { menuPeriodId: Number(finalPeriodId) },
        });
      }

      const menusToCreate = body.meals.map((meal) => ({
        dayOfWeek: meal.dayOfWeek!,
        mealType: meal.mealType!,
        starter: meal.starter!,
        main_course: meal.main_course!,
        side_dish: meal.side_dish!,
        dessert: meal.dessert!,
        drink: meal.drink!,
        snack: meal.snack!,
        special_note: meal.special_note!,
      }));

      const createdMenus = await this.prismaService.menu.createMany({
        data: menusToCreate.map((menu) => ({
          ...menu,
          menuPeriodId: menuPeriod.id,
          isActive: true,
        })),
        skipDuplicates: true,
      });
      if (!createdMenus || createdMenus.count === 0) {
        return {
          status: 400,
          message: 'No new menus were created. They might already exist.',
          success: true,
        };
      }
      return {
        status: 201,
        message: `${createdMenus.count} meals created successfully`,
        success: true,
      };
    } catch (error) {
      return {
        status: 500,
        message: error.message || 'Internal server error',
        success: false,
      };
    }
  }

  // service : done
  async updateMenusBulk(
    @Body() body: CreateMenuMealsDto,
    @Param('periodId') periodId: string,
  ) {
    try {
      const finalPeriodId = periodId;

      const menuPeriod = await this.prismaService.menuPeriod.findUnique({
        where: { id: Number(finalPeriodId) },
      });

      if (!menuPeriod) {
        return {
          status: 404,
          message: 'Menu period not found',
          success: false,
        };
      }

      if (body.category && body.category !== menuPeriod.category) {
        return {
          status: 400,
          message:
            'Category in request body does not match menu period category',
          success: false,
        };
      }

      if (!body.meals || body.meals.length === 0) {
        return {
          status: 400,
          message: 'No meals provided',
          success: false,
        };
      }

      // make sure no duplicate from the request body
      // but it's already check in the pipeline, just to be sure
      const newMeals = new Map<string, any>();
      for (const meal of body.meals) {
        const key = `${meal.dayOfWeek}-${meal.mealType}`;
        if (!newMeals.has(key)) {
          newMeals.set(key, meal);
        }
      }

      let uniqueMealsArray = Array.from(newMeals.values());

      const existingMeals = await this.prismaService.menu.findMany({
        where: { menuPeriodId: Number(finalPeriodId) },
      });

      if (existingMeals.length > 0) {
        // delete all existing meals for this period to avoid duplicates
        await this.prismaService.menu.deleteMany({
          where: { menuPeriodId: Number(finalPeriodId) },
        });
      }

      let updatedIndexes = 0,
        createdIndexes = 0;
      // add new meals to existing ones (and replace a meal if it's duplicated with the new one)
      uniqueMealsArray.forEach((meal) => {
        const index = existingMeals.findIndex(
          (m) => m.dayOfWeek === meal.dayOfWeek && m.mealType === meal.mealType,
        );

        // If the meal doesn't exist, add it
        if (index === -1) {
          existingMeals.push(meal);
          createdIndexes++;
          // If it exists, update it
        } else {
          existingMeals[index] = meal;
          updatedIndexes++;
        }
      });

      const menusToUpdate = existingMeals.map((meal) => ({
        dayOfWeek: meal.dayOfWeek!,
        mealType: meal.mealType!,
        starter: meal.starter!,
        main_course: meal.main_course!,
        side_dish: meal.side_dish!,
        dessert: meal.dessert!,
        drink: meal.drink!,
        snack: meal.snack!,
        special_note: meal.special_note!,
      }));

      // create updated meals (original + new)
      const updatedMenus = await this.prismaService.menu.createMany({
        data: menusToUpdate.map((menu) => ({
          ...menu,
          menuPeriodId: menuPeriod.id,
          isActive: true,
        })),
        skipDuplicates: true,
      });
      if (!updatedMenus || updatedMenus.count === 0) {
        return {
          status: 400,
          message: 'No new menus were created. They might already exist.',
          success: false,
        };
      }
      return {
        status: 201,
        message:
          (createdIndexes > 0
            ? `${createdIndexes} menus created successfully. `
            : '') +
          (updatedIndexes > 0
            ? `${updatedIndexes} menus updated successfully`
            : ''),

        success: true,
      };
    } catch (error) {
      return {
        status: 500,
        message: error.message || 'Internal server error',
        success: false,
      };
    }
  }

  async handleMenusActivation() {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of day for date-only comparison

    // delete meals of periods that ended one day ago
    await this.prismaService.menu.deleteMany({
      where: {
        menuPeriod: {
          endDate: {
            lt: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    // delete periods that ended 1 day ago
    await this.prismaService.menuPeriod.deleteMany({
      where: {
        endDate: { lt: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000) },
      },
    });

    // Activate periods that are starting today
    await this.prismaService.menuPeriod.updateMany({
      where: {
        startDate: {
          gte: currentDate,
          lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000), // Next day
        },
        isActive: false,
      },
      data: { isActive: true },
    });

    // activate periods that have started but were not activated (missed activation)
    // this can happen if the backend was down for a few days
    await this.prismaService.menuPeriod.updateMany({
      where: {
        startDate: { lt: currentDate },
        isActive: false,
      },
      data: { isActive: true },
    });

    // if two periods are active for one category, delete the older one (with its menus)
    const activePeriods = await this.prismaService.menuPeriod.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'asc' },
    });

    const categoryActiveMap = new Map<string, any[]>();
    for (const period of activePeriods) {
      if (!categoryActiveMap.has(period.category)) {
        categoryActiveMap.set(period.category, [period]);
      } else {
        categoryActiveMap.get(period.category)!.push(period);
      }
    }

    for (const [category, periods] of categoryActiveMap.entries()) {
      if (periods.length > 1) {
        // More than one active period for this category
        // Delete all but the most recent one
        const periodsToDelete = periods.slice(0, -1); // All but the last one
        const periodIdsToDelete = periodsToDelete.map((p) => p.id);

        // Delete menus first
        await this.prismaService.menu.deleteMany({
          where: { menuPeriodId: { in: periodIdsToDelete } },
        });

        // Then delete the periods
        await this.prismaService.menuPeriod.deleteMany({
          where: { id: { in: periodIdsToDelete } },
        });
      }
    }
    return;
  }
}
