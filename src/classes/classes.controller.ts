import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import {
  ClassesDtoGet,
  ClassUpdateDto,
  CreateClassDto,
} from './dto/classes-dto';
import { ClassesAuthGuard } from './guards/auth.gurad';
import { ClassesTeacherGuard } from './guards/teacher.guard';
import { ClassesGuard } from './guards/class.guard';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  //  guards : done , service : done
  @Get()
  @UseGuards(ClassesAuthGuard)
  getAllClasses(@Query() query: ClassesDtoGet) {
    return this.classesService.getAllClasses(query);
  }

  // guards : done , service : done
  @Post()
  @UseGuards(ClassesAuthGuard, ClassesTeacherGuard)
  createClass(
    @Query('admin_id') admin_id: string,
    @Body() classData: CreateClassDto,
  ) {
    return this.classesService.createClass(classData);
  }

  // guards : done , service : done
  @Get('search')
  @UseGuards(ClassesAuthGuard)
  searchClasses(
    @Query('admin_id') admin_id: string,
    @Query('name') name: string,
  ) {
    return this.classesService.searchClasses(name);
  }

  // guards : done , service : done
  @Get(':id')
  @UseGuards(ClassesAuthGuard,ClassesGuard)
  getClassById(@Param('id') id: number, @Query('admin_id') admin_id: string) {
    return this.classesService.getClassById(id);
  }

  // guards : done , service : done
  @Put(':id')
  @UseGuards(ClassesAuthGuard,ClassesGuard,ClassesTeacherGuard)
  updateClass(
    @Query('admin_id') admin_id: string,
    @Body() classData: ClassUpdateDto,
    @Param('id') id: number,
  ) {
    return this.classesService.updateClass(classData, id);
  }

  // guards : done , service : done
  @Delete(':id')
  @UseGuards(ClassesAuthGuard,ClassesGuard)
  deleteClass(@Query('admin_id') admin_id: string, @Param('id') id: number) {
    return this.classesService.deleteClass(id);
  }
}
