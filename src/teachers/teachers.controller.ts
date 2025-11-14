import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query
} from '@nestjs/common';
import {
    TeacherDtoCreate,
    TeacherDtoGet
} from './dto/teachers-dto';
import { TeachersService } from './teachers.service';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get() // GET users/ only admin can access this route
  getTeachers(@Query() query: TeacherDtoGet) {
    return this.teachersService.getTeachers(query);
  }

  @Post() // POST users/ to create a new user
  createTeacher(@Body() body: TeacherDtoCreate) {
    return this.teachersService.createTeacher(body);
  }

  @Get('available') // GET users/available to get all available teachers
  getAvailableTeachers(@Query('admin_id') admin_id: number) {
    return this.teachersService.getAvailableTeachers(admin_id);
  }

  @Get('/search') // GET users/search?search_query= to search users by name or email
  searchTeachers(
    @Query('search_query') search_query: string,
    @Query('only_admin') only_admin: string,
    @Query('user_id') user_id: number,
  ) {
    return this.teachersService.searchTeachers(
      search_query,
      only_admin === 'true',
      user_id,
    );
  }

  @Get(':id') // GET users/:id only admin  can access this route
  getTeatcherById(@Param('id') user_id: number) {
    return this.teachersService.getTeacherById(user_id);
  }

}
