import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import {
  ClassesDtoGet,
  ClassUpdateDto,
  CreateClassDto,
} from './dto/classes-dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  getAllClasses(@Query() query: ClassesDtoGet) {
    return this.classesService.getAllClasses(query);
  }

  @Post()
  createClass(
    @Query('admin_id') admin_id: string,
    @Body() classData: CreateClassDto,
  ) {
    return this.classesService.createClass(admin_id, classData);
  }

  @Get('search') 
  searchClasses(@Query('name') name: string) {
    return this.classesService.searchClasses(name);
  }

  @Get(':id')
  getClassById(@Param('id') id: number, @Query('admin_id') admin_id: string) {
    return this.classesService.getClassById(id, admin_id);
  }

  @Put(':id')
  updateClass(
    @Query('admin_id') admin_id: string,
    @Body() classData: ClassUpdateDto,
    @Param('id') id: number,
  ) {
    return this.classesService.updateClass(admin_id, classData, id);
  }

  @Delete(':id')
  deleteClass(@Query('admin_id') admin_id: string, @Param('id') id: number) {
    return this.classesService.deleteClass(admin_id, id);
  }
}
