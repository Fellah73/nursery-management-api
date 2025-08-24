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
import { AssignmentsService } from './assignments.service';
import { Category } from 'generated/prisma';
import { CreateAssignmenstDto } from './dto/assignments-dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  createAssignment(
    @Query('admin_id') admin_id: string,
    @Body() body: CreateAssignmenstDto, // Replace 'any' with the appropriate DTO type
  ) {
    return this.assignmentsService.createAssignment(admin_id, body);
  }
  
  @Put(':id')
  updateAssignment(
    @Param('id') id: string,
    @Query('admin_id') admin_id: string,
    @Body() body: { classroomId: string },
  ) {
    return this.assignmentsService.updateAssignment(id, admin_id, body);
  }

  @Delete(':id')
  deleteAssignment(
    @Param('id') id: string,
    @Query('admin_id') admin_id: string,
  ) {
    return this.assignmentsService.deleteAssignment(id, admin_id);
  }

  @Get('/children/not-assigned')
  getChildrenNotAssigned(
    @Query('admin_id') admin_id: string,
    @Query('category') category?: Category,
  ) {
    return this.assignmentsService.getChildrenNotAssigned(admin_id, category);
  }

  @Get('/classes/available')
  getAvailableClasses(
    @Query('admin_id') admin_id: string,
    @Query('class_id') class_id?: string,
  ) {
    return this.assignmentsService.getAvailableClasses(admin_id, class_id);
  }

  @Get('/classes/:id')
  findAssignmentsByClass(
    @Param('id') id: string,
    @Query('admin_id') status: string,
  ) {
    return this.assignmentsService.getAssignmentsByClass(Number(id), status);
  }
}
