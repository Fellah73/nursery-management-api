import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/guard/decorators/roles.decorator';
import { UserRole } from 'src/guard/enums/user-role.enum';
import { GlobalAuthGuard } from 'src/guard/guards/auth.guard';
import { TeacherDtoCreate, TeacherDtoGet } from './dto/teachers-dto';
import { ValidateTeacherCreationPipe } from './pipe/validate.teacher';
import { TeachersService } from './teachers.service';

@Controller('teachers')
@UseGuards(GlobalAuthGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // guards : done , service : done
  @Get()
  getTeachers(@Query() query: TeacherDtoGet) {
    return this.teachersService.getTeachers(query);
  }

  // guards : done , pipe : done , service : done
  @Post()
  createTeacher(@Body(ValidateTeacherCreationPipe) body: TeacherDtoCreate) {
    return this.teachersService.createTeacher(body);
  }

  // guards : done , service : done
  @Get('available')
  getAvailableTeachers() {
    return this.teachersService.getAvailableTeachers();
  }

  // guards : done , service : done
  @Get('/search')
  searchTeachers(
    @Query('search_query') search_query: string,
    @Query('admin_id') admin_id: number,
  ) {
    return this.teachersService.searchTeachers(search_query, admin_id);
  }

  // guards : done , service : done
  @Get(':id')
  @Roles(UserRole.TEACHER)
  getTeacherById(@Param('id') id: number) {
    return this.teachersService.getTeacherById(id);
  }
}
