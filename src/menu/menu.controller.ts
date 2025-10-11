import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Category } from 'generated/prisma';
import { CreateMenuMealsDto, CreateMenuPeriodDto } from './dto/menu-dto';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  getMenuPeriods(@Query('admin_id') admin_id: string) {
    return this.menuService.getMenuPeriods(admin_id);
  }

  @Post()
  createMenuPeriod(
    @Body() body: CreateMenuPeriodDto,
    @Query('admin_id') admin_id: string,
    @Query('type') type: string,
  ) {
    return this.menuService.createMenuPeriod(body, admin_id, type);
  }

  @Get('/programme')
  getProgrammedMenuPeriods(@Query('admin_id') admin_id: string) {
    return this.menuService.getProgrammedMenuPeriods(admin_id);
  }

  @Get('/meals')
  getMenuMeals(
    @Query('admin_id') admin_id: string,
    @Query('category') category: Category,
  ) {
    return this.menuService.getMenuMeals(admin_id, category);
  }

  @Get('meals/:periodId')
  getMenuMealsByPeriod(
    @Query('admin_id') admin_id: string,
    @Param('periodId') periodId: string,
  ) {
    return this.menuService.getMenuMealsByPeriod(admin_id, periodId);
  }

  @Delete('/period/:periodId')
  deleteMenuPeriod(
    @Query('admin_id') admin_id: string,
    @Param('periodId') periodId: string,
  ) {
    return this.menuService.deleteMenuPeriod(admin_id, periodId);
  }

  @Post('/period/:periodId/meals/bulk')
  createMenusBulk(
    @Body() body: CreateMenuMealsDto,
    @Query('admin_id') admin_id: string,
    @Param('periodId') periodId: string,
  ) {
    return this.menuService.createMenusBulk(body, admin_id, periodId);
  }
}
