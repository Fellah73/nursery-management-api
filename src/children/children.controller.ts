import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/children-dto';

@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get() // Get /children to retrieve all children
  getChildren(@Query('admin_id') admin_id: string) {
    return this.childrenService.getChildren(admin_id);
  }

  @Post() // Post /children to create a new child
  createChild(
    @Query('admin_id') admin_id: string,
    @Body() childData: CreateChildDto,
  ) {
    return this.childrenService.createChild(admin_id, childData);
  }
  @Get('statistics') // Get /children/statistics to retrieve children statistics
  getChildrenStatistics(@Query('admin_id') admin_id: string) {
    return this.childrenService.getChildrenStatistics(admin_id);
  }

  @Get('search')
  searchChildren(@Query('name') name: string) {
    return this.childrenService.searchChildren(name);
  }
  @Get(':id') // Get /children/:id to retrieve a child by ID
  getChildById(@Param('id') id: number) {
    return this.childrenService.getChildById(id);
  }

  @Get(':id/medical-info') // Get /children/:id/medical-info to retrieve medical info by child ID
  getMedicalInfoByChildId(@Param('id') id: number) {
    return this.childrenService.getMedicalInfoByChildId(Number(id));
  }

  @Get('by-parent/:parentId') // Get /children/by-parent/:parentId to retrieve children by parent ID
  getChildrenByParentId(@Param('parentId') parentId: number) {
    return this.childrenService.getChildrenByParentId(Number(parentId));
  }
}
