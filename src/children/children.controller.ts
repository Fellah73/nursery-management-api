import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { ChildrenDtoGet, CreateChildDto } from './dto/children-dto';
import { Category } from 'generated/prisma';

@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get() // Get /children to retrieve all children
  getChildren(@Query() query: ChildrenDtoGet) {
    return this.childrenService.getChildren(query);
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

  @Get('allergies')
  getAllergies(@Query('admin_id') admin_id: string,@Query('category') category: Category) {
    return this.childrenService.getAllergies(admin_id, category);
  }

  @Get('search') // Get /children/search?name= to search children by name
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

  @Put(':id/:type') // Put /children/:id/type to update a child's type by ID
  updateChildType(@Param('id') id: number, @Param('type') type: string,@Body() body: any) {
    return this.childrenService.updateChildByType(Number(id), type, body);
  }

  @Get('by-parent/:parentId') // Get /children/by-parent/:parentId to retrieve children by parent ID
  getChildrenByParentId(@Param('parentId') parentId: number) {
    return this.childrenService.getChildrenByParentId(Number(parentId));
  }
}
