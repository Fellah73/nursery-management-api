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
import { ChildrenService } from './children.service';
import { ChildrenDtoGet, CreateChildDto, updateType } from './dto/children-dto';
import { ChildrenAuthGuard } from './gurads/auth/auth.guard';
import { ChildrenGuard } from './gurads/child/child.guard';
import { ValidateChildCreationPipe } from './pipe/validate-child';
import { ValidateChildUpdatePipe } from './pipe/validate-update';

@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  // guards : done , service : done
  @Get()
  @UseGuards(ChildrenAuthGuard)
  getChildren(@Query() query: ChildrenDtoGet) {
    return this.childrenService.getChildren(query);
  }

  // guards : done , pipe : done , service : done
  @Post()
  @UseGuards(ChildrenAuthGuard)
  createChild(
    @Query('admin_id') admin_id: string,
    @Body(ValidateChildCreationPipe) childData: CreateChildDto,
  ) {
    return this.childrenService.createChild(childData);
  }

  // guards : done , service : done
  @Get('statistics')
  @UseGuards(ChildrenAuthGuard)
  getChildrenStatistics(@Query('admin_id') admin_id: string) {
    return this.childrenService.getChildrenStatistics();
  }

  // guards : done , service : done
  @Get('allergies')
  @UseGuards(ChildrenAuthGuard)
  getAllergies(
    @Query('admin_id') admin_id: string,
    @Query('category') category: Category,
  ) {
    return this.childrenService.getAllergies(category);
  }

  // guards : done , service : done
  @Get('search')
  @UseGuards(ChildrenAuthGuard)
  searchChildren(
    @Query('admin_id') admin_id: string,
    @Query('name') name: string,
  ) {
    return this.childrenService.searchChildren(name);
  }

  // guards : done , service : done
  @Get(':id')
  @UseGuards(ChildrenAuthGuard, ChildrenGuard)
  getChildById(@Query('admin_id') admin_id: string, @Param('id') id: number) {
    return this.childrenService.getChildById(id);
  }

  // guards : done , service : done
  @Get(':id/medical-info')
  @UseGuards(ChildrenAuthGuard, ChildrenGuard)
  getMedicalInfoByChildId(
    @Query('admin_id') admin_id: string,
    @Param('id') id: number,
  ) {
    return this.childrenService.getMedicalInfoByChildId(Number(id));
  }

  // guards : done , pipe : done , service : done
  @Put(':id/:type')
  @UseGuards(ChildrenAuthGuard, ChildrenGuard)
  updateChildType(
    @Query('admin_id') admin_id: string,
    @Param('id') id: number,
    @Param('type') type: updateType,
    @Body(ValidateChildUpdatePipe) body: any,
  ) {
    return this.childrenService.updateChildByType(Number(id), type, body);
  }
}
