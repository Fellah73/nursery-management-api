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
import { Category } from 'generated/prisma';
import { Roles } from 'src/guard/decorators/roles.decorator';
import { UserRole } from 'src/guard/enums/user-role.enum';
import { GlobalAuthGuard } from 'src/guard/guards/auth.guard';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentsDto } from './dto/assignments-dto';
import { AssignmentsGuard } from './gurads/assignment.guard';
import { AssignmentsClassRoomGuard } from './gurads/classroom.gurad';

@Controller('assignments')
@UseGuards(GlobalAuthGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  // guards : done , service : done
  @Post()
  @UseGuards(AssignmentsClassRoomGuard)
  createAssignment(@Body() body: CreateAssignmentsDto) {
    return this.assignmentsService.createAssignment(body);
  }

  // guards : done , service : done
  @Put(':id')
  @UseGuards(AssignmentsClassRoomGuard, AssignmentsGuard)
  updateAssignment(
    @Param('id') id: string,
    @Body() body: { classroomId: string },
  ) {
    return this.assignmentsService.updateAssignment(id, body);
  }

  // guards : done , service : done
  @Delete(':id')
  @UseGuards(AssignmentsGuard)
  deleteAssignment(@Param('id') id: string) {
    return this.assignmentsService.deleteAssignment(id);
  }

  // guards : done , service : done
  @Get('/children/not-assigned')
  getChildrenNotAssigned(@Query('category') category?: Category) {
    return this.assignmentsService.getChildrenNotAssigned(category);
  }

  // guards : done , service : done
  @Get('/classes/available')
  getAvailableClasses(@Query('class_id') class_id?: string) {
    return this.assignmentsService.getAvailableClasses(class_id);
  }

  // guards : done , service : done
  @Get('/classes/:classroomId')
  @UseGuards(AssignmentsClassRoomGuard)
  findAssignmentsByClass(@Param('classroomId') classroomId: string) {
    return this.assignmentsService.getAssignmentsByClass(Number(classroomId));
  }
}
