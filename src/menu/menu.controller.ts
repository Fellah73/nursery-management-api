import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuMealsDto, CreateMenuPeriodDto } from './dto/menu-dto';

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

  @Delete('/period/:periodId')
  deleteMenuPeriod(@Query('admin_id') admin_id: string, @Param('periodId') periodId: string) {
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
