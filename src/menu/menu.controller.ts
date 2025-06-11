import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu-dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post() // POST /menu
  createMenu(@Query('admin_id') admin_id: string, @Body() body: CreateMenuDto) {
    return this.menuService.createMenu(admin_id, body);
  }

  @Get('today')  // GET /menu/today
  getTodayMenu() {
    return this.menuService.getTodayMenu();
  }

  @Get('week')  // GET /menu/week
  getWeekMenu() {
    return this.menuService.getWeekMenu();
  }

  @Patch(':id')  // PATCH /menu/:id
  updateMenu(@Param('id') id: string, @Body() body: UpdateMenuDto) {
    return this.menuService.updateMenu(id, body);
  }

  @Delete(':id')  // DELETE /menu/:id
  deleteMenu(@Param('id') id: string) {
    return this.menuService.deleteMenu(id);
  }
}
