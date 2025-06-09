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
  @Get('search')
  searchChildren(@Query('name') name: string) {
    return this.childrenService.searchChildren(name);
  }
  @Get(':id') // Get /children/:id to retrieve a child by ID
  getChildById(@Param('id') id: number) {
    return this.childrenService.getChildById(id);
  }
}
