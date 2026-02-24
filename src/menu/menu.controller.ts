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
import { Roles } from 'src/guard/decorators/roles.decorator';
import { UserRole } from 'src/guard/enums/user-role.enum';
import { GlobalAuthGuard } from 'src/guard/guards/auth.guard';
import {
  CreateMenuMealsDto,
  CreateMenuPeriodDto,
  MealSlotDto,
  UpdateMenuPeriodDto,
} from './dto/menu-dto';
import { MenuPeriodsGuard } from './guards/period.guard';
import { MenuService } from './menu.service';
import { ValidateMealsPipe } from './pipes/validate-menu-meals';
import {
  ValidateMenuPeriodCreationPipe,
  ValidateMenuPeriodUpdatePipe,
} from './pipes/validate-menu-period';

@Controller('menu')
@UseGuards(GlobalAuthGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // guards : done , service : done , handleCall : done
  @Get()
  getMenuPeriods() {
    return this.menuService.getMenuPeriods();
  }

  // guards : done , service : done , pipe : done , handleCall : done
  @Post()
  createMenuPeriod(
    @Body(ValidateMenuPeriodCreationPipe) body: CreateMenuPeriodDto,
    @Query('type') type: string,
  ) {
    return this.menuService.createMenuPeriod(body, type);
  }

  // guards : done , service : done , handleCall : done
  @Get('/programme')
  getProgrammedMenuPeriods() {
    return this.menuService.getProgrammedMenuPeriods();
  }

  // guards : done , service : done , handleCall : done
  @Get('/meals')
  getMenuMeals(@Query('category') category: Category) {
    return this.menuService.getMenuMeals(category);
  }

  // guards : done , service : done
  @Get('/meals/times')
  getMenuMealTimes() {
    return this.menuService.getMenuMealTimes();
  }

  // guards : done , pipe : done , service : done , handleCall : done
  @Patch('/:periodId')
  @UseGuards(MenuPeriodsGuard)
  updateMenuPeriod(
    @Body(ValidateMenuPeriodUpdatePipe) body: UpdateMenuPeriodDto,
    @Param('periodId') periodId: string,
  ) {
    return this.menuService.updateMenuPeriod(body, periodId);
  }

  // guards : done , service : done , handleCall : done
  @Get('meals/:periodId')
  @UseGuards(MenuPeriodsGuard)
  getMenuMealsByPeriod(@Param('periodId') periodId: string) {
    return this.menuService.getMenuMealsByPeriod(periodId);
  }

  // guards : done , service : done , handleCall : done
  @Delete('/period/:periodId')
  @UseGuards(MenuPeriodsGuard)
  deleteMenuPeriod(@Param('periodId') periodId: string) {
    return this.menuService.deleteMenuPeriod(periodId);
  }

  // guards : done , service : done , pipe : done , handleCall : done
  @Post('/period/:periodId/meals/bulk')
  @UseGuards(MenuPeriodsGuard)
  createMenusBulk(
    @Body(ValidateMealsPipe<CreateMenuMealsDto, MealSlotDto>)
    body: CreateMenuMealsDto,
    @Param('periodId') periodId: string,
  ) {
    return this.menuService.createMenusBulk(body, periodId);
  }

  // guards : done , service : done , pipe : done , handleCall : done
  @Patch('/period/:periodId/meals/bulk')
  @UseGuards(MenuPeriodsGuard)
  updateMenusBulk(
    @Body(ValidateMealsPipe<CreateMenuMealsDto, MealSlotDto>)
    body: CreateMenuMealsDto,
    @Param('periodId') periodId: string,
  ) {
    return this.menuService.updateMenusBulk(body, periodId);
  }
}
