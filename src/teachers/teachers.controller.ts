import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  TeacherDtoCreate,
  TeacherDtoGet
} from './dto/teachers-dto';
import { TeachersAuthGuard } from './guards/auth/auth.guard';
import { TeachersGuard } from './guards/teacher/teacher.guard';
import { ValidateTeacherCreationPipe } from './pipe/validate.teacher';
import { TeachersService } from './teachers.service';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // guards : done , service : done
  @Get()
  @UseGuards(TeachersAuthGuard)
  getTeachers(@Query() query: TeacherDtoGet) {
    return this.teachersService.getTeachers(query);
  }

  // guards : done , pipe : done , service : done
  @Post()
  @UseGuards(TeachersAuthGuard)
  createTeacher(
    @Query('admin_id') admin_id: number,
    @Body(ValidateTeacherCreationPipe) body: TeacherDtoCreate,
  ) {
    return this.teachersService.createTeacher(body);
  }

  // guards : done , service : done
  @Get('available')
  @UseGuards(TeachersAuthGuard)
  getAvailableTeachers(@Query('admin_id') admin_id: number) {
    return this.teachersService.getAvailableTeachers();
  }

  // guards : done , service : done
  @Get('/search')
  @UseGuards(TeachersAuthGuard)
  searchTeachers(
    @Query('search_query') search_query: string,
    @Query('admin_id') admin_id: number,
  ) {
    return this.teachersService.searchTeachers(search_query, admin_id);
  }

  // guards : done , service : done
  @Get(':id')
  @UseGuards(TeachersAuthGuard, TeachersGuard)
  getTeacherById(
    @Query('admin_id') admin_id: number,
    @Param('id') id: number) {
    return this.teachersService.getTeacherById(id);
  }
}
