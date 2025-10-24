import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Category } from 'generated/prisma';
import { CreateMenuMealsDto, CreateMenuPeriodDto } from './dto/menu-dto';
import { MenuService } from './menu.service';
import { AuthGuard } from './guards/auth/auth.guard';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // guards : done , service : done
  @Get()
  @UseGuards(AuthGuard)
  getMenuPeriods(@Query('admin_id') admin_id: string) {
    return this.menuService.getMenuPeriods();
  }

  // guards : done , service : done
  @Post()
  @UseGuards(AuthGuard)
  createMenuPeriod(
    @Body() body: CreateMenuPeriodDto,
    @Query('admin_id') admin_id: string,
    @Query('type') type: string,
  ) {
    return this.menuService.createMenuPeriod(body, type);
  }

  // guards : done , service : done
  @Get('/programme')
  @UseGuards(AuthGuard)
  getProgrammedMenuPeriods(@Query('admin_id') admin_id: string) {
    return this.menuService.getProgrammedMenuPeriods();
  }

  // guards : done , service : done
  @Get('/meals')
  @UseGuards(AuthGuard)
  getMenuMeals(
    @Query('admin_id') admin_id: string,
    @Query('category') category: Category,
  ) {
    return this.menuService.getMenuMeals(category);
  }

  // guards : done , service : done
  @Get('meals/:periodId')
  @UseGuards(AuthGuard)
  getMenuMealsByPeriod(
    @Query('admin_id') admin_id: string,
    @Param('periodId') periodId: string,
  ) {
    return this.menuService.getMenuMealsByPeriod(periodId);
  }

  // guards : done , service : done
  @Delete('/period/:periodId')
  @UseGuards(AuthGuard)
  deleteMenuPeriod(
    @Query('admin_id') admin_id: string,
    @Param('periodId') periodId: string,
  ) {
    return this.menuService.deleteMenuPeriod(periodId);
  }


  // guards : done , service : done
  @Post('/period/:periodId/meals/bulk')
  @UseGuards(AuthGuard)
  createMenusBulk(
    @Body() body: CreateMenuMealsDto,
    @Query('admin_id') admin_id: string,
    @Param('periodId') periodId: string,
  ) {
    return this.menuService.createMenusBulk(body, periodId);
  }

  // guards : done , service : done
   @Patch('/period/:periodId/meals/bulk')
    @UseGuards(AuthGuard)
    updateMenusBulk(
      @Body() body: CreateMenuMealsDto,
      @Query('admin_id') admin_id: string,
      @Param('periodId') periodId: string,
    ) {
      return this.menuService.updateMenusBulk(body, periodId);
    }
}
