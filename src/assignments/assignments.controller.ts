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
import { AssignmentsService } from './assignments.service';
import { Category } from 'generated/prisma';
import { CreateAssignmentsDto } from './dto/assignments-dto';
import { AssignmentsAuthGuard } from './gurads/auth/auth.gard';
import { AssignmentsClassRoomGuard } from './gurads/classroom/classroom.gurad';
import { AssignmentsGuard } from './gurads/assignment/assignment.guard';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  // guards : done , service : done
  @Post()
  @UseGuards(AssignmentsAuthGuard, AssignmentsClassRoomGuard)
  createAssignment(
    @Query('admin_id') admin_id: string,
    @Body() body: CreateAssignmentsDto,
  ) {
    return this.assignmentsService.createAssignment(body);
  }

  // guards : done , service : done
  @Put(':id')
  @UseGuards(AssignmentsAuthGuard, AssignmentsClassRoomGuard, AssignmentsGuard)
  updateAssignment(
    @Param('id') id: string,
    @Query('admin_id') admin_id: string,
    @Body() body: { classroomId: string },
  ) {
    return this.assignmentsService.updateAssignment(id, body);
  }


  // guards : done , service : done
  @Delete(':id')
  @UseGuards(AssignmentsAuthGuard,AssignmentsGuard)
  deleteAssignment(
    @Param('id') id: string,
    @Query('admin_id') admin_id: string,
  ) {
    return this.assignmentsService.deleteAssignment(id);
  }

  // guards : done , service : done
  @Get('/children/not-assigned')
  @UseGuards(AssignmentsAuthGuard)
  getChildrenNotAssigned(
    @Query('admin_id') admin_id: string,
    @Query('category') category?: Category,
  ) {
    return this.assignmentsService.getChildrenNotAssigned(category);
  }

  // guards : done , service : done
  @Get('/classes/available')
  @UseGuards(AssignmentsAuthGuard)
  getAvailableClasses(
    @Query('admin_id') admin_id: string,
    @Query('class_id') class_id?: string,
  ) {
    return this.assignmentsService.getAvailableClasses(class_id);
  }

  // guards : done , service : done
  @Get('/classes/:classroomId')
  @UseGuards(AssignmentsAuthGuard,AssignmentsClassRoomGuard)
  findAssignmentsByClass(
    @Param('classroomId') classroomId: string,
    @Query('admin_id') admin_id: string,
  ) {
    return this.assignmentsService.getAssignmentsByClass(Number(classroomId));
  }
}
