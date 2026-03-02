import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Category } from 'generated/prisma';
import { Roles } from 'src/guard/decorators/roles.decorator';
import { UserRole } from 'src/guard/enums/user-role.enum';
import { GlobalAuthGuard } from 'src/guard/guards/auth.guard';
import { ChildrenService } from './children.service';
import { ChildrenDtoGet, CreateChildDto, updateType } from './dto/children-dto';
import { ChildrenGuard } from './gurads/child.guard';
import { ValidateChildCreationPipe } from './pipe/validate-child';
import { ValidateChildUpdatePipe } from './pipe/validate-update';

@Controller('children')
@UseGuards(GlobalAuthGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  // guards : done , service : done
  @Get()
  getChildren(@Query() query: ChildrenDtoGet) {
    return this.childrenService.getChildren(query);
  }

  // guards : done , pipe : done , service : done
  @Post()
  createChild(@Body(ValidateChildCreationPipe) childData: CreateChildDto) {
    return this.childrenService.createChild(childData);
  }

  // guards : done , service : done
  @Get('statistics')
  getChildrenStatistics(@Query('limit') limit: number) {
    return this.childrenService.getChildrenStatistics(limit);
  }

  // guards : done , service : done
  @Get('allergies')
  getAllergies(@Query('category') category: Category) {
    return this.childrenService.getAllergies(category);
  }

  // guards : done , service : done
  @Get('search')
  searchChildren(@Query('name') name: string) {
    return this.childrenService.searchChildren(name);
  }

  // guards : done , service : done
  @Get(':id')
  @UseGuards(ChildrenGuard)
  getChildById(@Param('id') id: number) {
    return this.childrenService.getChildById(id);
  }

  // guards : done , service : done
  @Get(':id/medical-info')
  @UseGuards(ChildrenGuard)
  getMedicalInfoByChildId(@Param('id') id: number) {
    return this.childrenService.getMedicalInfoByChildId(Number(id));
  }

  // guards : done , pipe : done , service : done
  @Put(':id/:type')
  @UseGuards(ChildrenGuard)
  updateChildType(
    @Param('id') id: number,
    @Param('type') type: updateType,
    @Body(ValidateChildUpdatePipe) body: any,
  ) {
    return this.childrenService.updateChildByType(Number(id), type, body);
  }
}
