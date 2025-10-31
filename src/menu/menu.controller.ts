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
import {
  CreateMenuMealsDto,
  CreateMenuPeriodDto,
  MealSlotDto,
} from './dto/menu-dto';
import { AuthGuard } from './guards/auth/auth.guard';
import { MenuService } from './menu.service';
import { ValidateMealsPipe } from './pipes/validate-menu-meals';
import { ValidateMenuPeriodCreationPipe } from './pipes/validate-menu-period';
import { MenuPeriodsGuard } from './guards/period/period.guard';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // guards : done , service : done , handleCall : done
  @Get()
  @UseGuards(AuthGuard)
  getMenuPeriods(@Query('admin_id') admin_id: string) {
    return this.menuService.getMenuPeriods();
  }

  // guards : done , service : done , pipe : done , handleCall : done
  @Post()
  @UseGuards(AuthGuard)
  createMenuPeriod(
    @Body(ValidateMenuPeriodCreationPipe) body: CreateMenuPeriodDto,
    @Query('admin_id') admin_id: string,
    @Query('type') type: string,
  ) {
    return this.menuService.createMenuPeriod(body, type);
  }

  // guards : done , service : done , handleCall : done
  @Get('/programme')
  @UseGuards(AuthGuard)
  getProgrammedMenuPeriods(@Query('admin_id') admin_id: string) {
    return this.menuService.getProgrammedMenuPeriods();
  }

  // guards : done , service : done , handleCall : done
  @Get('/meals')
  @UseGuards(AuthGuard)
  getMenuMeals(
    @Query('admin_id') admin_id: string,
    @Query('category') category: Category,
  ) {
    return this.menuService.getMenuMeals(category);
  }

  // guards : done , service : done , handleCall : done
  @Get('meals/:periodId')
  @UseGuards(AuthGuard, MenuPeriodsGuard)
  getMenuMealsByPeriod(
    @Query('admin_id') admin_id: string,
    @Param('periodId') periodId: string,
  ) {
    return this.menuService.getMenuMealsByPeriod(periodId);
  }

  // guards : done , service : done , handleCall : done
  @Delete('/period/:periodId')
  @UseGuards(AuthGuard, MenuPeriodsGuard)
  deleteMenuPeriod(
    @Query('admin_id') admin_id: string,
    @Param('periodId') periodId: string,
  ) {
    return this.menuService.deleteMenuPeriod(periodId);
  }

  // guards : done , service : done , pipe : done , handleCall : done
  @Post('/period/:periodId/meals/bulk')
  @UseGuards(AuthGuard, MenuPeriodsGuard)
  createMenusBulk(
    @Body(ValidateMealsPipe<CreateMenuMealsDto, MealSlotDto>)
    body: CreateMenuMealsDto,
    @Query('admin_id') admin_id: string,
    @Param('periodId') periodId: string,
  ) {
    return this.menuService.createMenusBulk(body, periodId);
  }

  // guards : done , service : done , pipe : done , handleCall : done
  @Patch('/period/:periodId/meals/bulk')
  @UseGuards(AuthGuard, MenuPeriodsGuard)
  updateMenusBulk(
    @Body(ValidateMealsPipe<CreateMenuMealsDto, MealSlotDto>)
    body: CreateMenuMealsDto,
    @Query('admin_id') admin_id: string,
    @Param('periodId') periodId: string,
  ) {
    return this.menuService.updateMenusBulk(body, periodId);
  }
}
