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
import { Roles } from 'src/guard/decorators/roles.decorator';
import { UserRole } from 'src/guard/enums/user-role.enum';
import { GlobalAuthGuard } from 'src/guard/guards/auth.guard';
import { ClassesService } from './classes.service';
import {
  ClassesDtoGet,
  ClassUpdateDto,
  CreateClassDto,
} from './dto/classes-dto';
import { ClassesGuard } from './guards/class.guard';

@Controller('classes')
@UseGuards(GlobalAuthGuard)
@Roles(UserRole.SUPER_ADMIN)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  //  guards : done , service : done
  @Get()
  getAllClasses(@Query() query: ClassesDtoGet) {
    return this.classesService.getAllClasses(query);
  }

  // guards : done , service : done
  @Post()
  @Roles(UserRole.TEACHER)
  createClass(@Body() classData: CreateClassDto) {
    return this.classesService.createClass(classData);
  }

  // guards : done , service : done
  @Get('search')
  searchClasses(@Query('name') name: string) {
    return this.classesService.searchClasses(name);
  }

  // guards : done , service : done
  @Get(':id')
  @UseGuards(ClassesGuard)
  getClassById(@Param('id') id: number) {
    return this.classesService.getClassById(id);
  }

  // guards : done , service : done
  @Put(':id')
  @UseGuards(ClassesGuard)
  @Roles(UserRole.TEACHER)
  updateClass(@Body() classData: ClassUpdateDto, @Param('id') id: number) {
    return this.classesService.updateClass(classData, id);
  }

  // guards : done , service : done
  @Delete(':id')
  @UseGuards(ClassesGuard)
  deleteClass(@Param('id') id: number) {
    return this.classesService.deleteClass(id);
  }
}
