import { Body, Injectable, Param } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu-dto';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Injectable()
export class MenuService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTodayMenu() {
    try {
      const today = new Date();
      const todayDate = today.toISOString().split('T')[0];
      const todayMenus = await this.prismaService.menu.findMany({
        where: {
          date: todayDate,
        },
      });

      if (!todayMenus || todayMenus.length === 0) {
        return {
          status: 'error',
          message: 'No menu found for today',
          success: false,
          statusCode: 404,
        };
      }

      // Organize menus by type
      const organizedMenus = {
        BREAKFAST: todayMenus.find((menu) => menu.type === 'Breakfast') || null,
        LUNCH: todayMenus.find((menu) => menu.type === 'Lunch') || null,
        GOUTER: todayMenus.find((menu) => menu.type === 'Gouter') || null,
      };

      return {
        status: 'success',
        success: true,
        data: organizedMenus,
        statusCode: 200,
      };
    } catch (error) {
      return {
        status: 'error',
        message: "An error occurred while fetching today's menu",
        success: false,
        statusCode: 500,
      };
    }
  }

  async getWeekMenu() {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 4);

      const weekMenus = await this.prismaService.menu.findMany({
        where: {
          date: {
            gte: startOfWeek.toISOString().split('T')[0],
            lte: endOfWeek.toISOString().split('T')[0],
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      if (!weekMenus || weekMenus.length === 0) {
        return {
          status: 'error',
          message: 'No menu found for this week',
          success: false,
          statusCode: 404,
        };
      }

      const organizedMenus = weekMenus.reduce((acc, menu) => {
        if (!acc[menu.date]) {
          acc[menu.date] = {
            date: menu.date,
            day: menu.day,
            meals: {
              Breakfast: null,
              Lunch: null,
              Gouter: null,
            },
          };
        }

        acc[menu.date].meals[menu.type] = menu;

        return acc;
      }, {});

      const result = Object.values(organizedMenus);

      return {
        status: 'success',
        success: true,
        data: result,
        statusCode: 200,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'An error occurred while fetching weekly menus',
        success: false,
        statusCode: 500,
      };
    }
  }

  async createMenu(
    @Param('admin_id') admin_id: string,
    @Body() body: CreateMenuDto,
  ) {
    try {
      if (!admin_id) {
        return {
          status: 'error',
          message: 'Admin ID is required',
          success: false,
          statusCode: 400,
        };
      }

      const admin = await this.prismaService.user.findUnique({
        where: { id: Number(admin_id) },
      });

      if (!admin) {
        return {
          status: 'error',
          message: 'Admin not found',
          success: false,
          statusCode: 404,
        };
      }

      if (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN') {
        return {
          status: 'error',
          message: 'Unauthorized access to create menu',
          success: false,
          statusCode: 403,
        };
      }

      const existingMenu = await this.prismaService.menu.findFirst({
        where: {
          date: new Date().toISOString().split('T')[0],
          type: body.type,
        },
      });
      if (existingMenu) {
        return {
          status: 'error',
          message: `${body.type} of today already exists`,
          success: false,
          statusCode: 400,
        };
      }
      const todayMenu = await this.prismaService.menu.create({
        data: {
          date: new Date().toISOString().split('T')[0],
          day: format(new Date(), 'EEEE', { locale: fr }),
          type: body.type,
          starter: body.starter ?? '',
          main_course: body.main_course ?? '',
          side_dish: body.side_dish ?? '',
          dessert: body.dessert ?? '',
          drink: body.drink ?? '',
          snack: body.snack ?? '',
          special_note: body.special_note ?? '',
        },
      });

      if (!todayMenu) {
        return {
          status: 'error',
          message: 'Failed to create menu',
          success: false,
          statusCode: 500,
        };
      }

      return {
        status: 'success',
        message: 'Menu created successfully',
        success: true,
        statusCode: 201,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'An error occurred while creating the menu',
        success: false,
        statusCode: 500,
      };
    }
  }

  async updateMenu(@Param('id') id: string, @Body() body: UpdateMenuDto) {
    try {
      const menu = await this.prismaService.menu.findUnique({
        where: { id: Number(id) },
      });

      if (!menu) {
        return {
          status: 'error',
          message: 'Menu not found',
          success: false,
          statusCode: 404,
        };
      }

      const updatedMenu = await this.prismaService.menu.update({
        where: { id: Number(id) },
        data: {
          starter: body.starter ?? menu.starter,
          main_course: body.main_course ?? menu.main_course,
          side_dish: body.side_dish ?? menu.side_dish,
          dessert: body.dessert ?? menu.dessert,
          drink: body.drink ?? menu.drink,
          snack: body.snack ?? menu.snack,
          special_note: body.special_note ?? menu.special_note,
        },
      });

      return {
        status: 'success',
        message: 'Menu updated successfully',
        success: true,
        data: updatedMenu,
        statusCode: 200,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'An error occurred while updating the menu',
        success: false,
        statusCode: 500,
      };
    }
  }

  async deleteMenu(@Param('id') id: string) {
    try {
      const menu = await this.prismaService.menu.findUnique({
        where: { id: Number(id) },
      });

      if (!menu) {
        return {
          status: 'error',
          message: 'Menu not found',
          success: false,
          statusCode: 404,
        };
      }

      await this.prismaService.menu.delete({
        where: { id: Number(id) },
      });

      return {
        status: 'success',
        message: 'Menu deleted successfully',
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'An error occurred while deleting the menu',
        success: false,
        statusCode: 500,
      };
    }
  }
}
