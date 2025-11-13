import { Body, Injectable, Param, Query } from '@nestjs/common';
import { Category } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssignmentsDto } from './dto/assignments-dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prismaService: PrismaService) {}

  private static ageRangeByCategory = {
    BEBE: { min: 1, max: 2 },
    PETIT: { min: 2, max: 3 },
    MOYEN: { min: 3, max: 4 },
    GRAND: { min: 4, max: 5 },
  };

  // service : done
  async createAssignment(@Body() body: CreateAssignmentsDto) {
    try {
      const { childId, classroomId } = body;

      const child = await this.prismaService.children.findUnique({
        where: { id: Number(childId) },
      });

      if (!child) {
        return {
          success: false,
          message: 'Child not found',
          error: 'The specified child does not exist',
          statusCode: 404,
        };
      }

      const existingAssignment = await this.prismaService.assignment.count({
        where: { childId: Number(childId) },
      });

      // check if child is already assigned
      if (existingAssignment > 0) {
        return {
          success: false,
          message: 'Child is already assigned to a classroom',
          error: 'Each child can only have one assignment at a time',
          statusCode: 400,
        };
      }

      const classroomAssignments = await this.prismaService.assignment.count({
        where: { classroomId: Number(classroomId) },
      });

      const classroom = await this.prismaService.classroom.findUnique({
        where: { id: Number(classroomId) },
      });

      // check if child's age is appropriate for the classroom
      if (child.age < classroom!.ageMin || child.age > classroom!.ageMax) {
        return {
          success: false,
          message: 'Child age not appropriate for this classroom',
          error: `Child age ${child.age} is not within the classroom age range of ${classroom!.ageMin} to ${classroom!.ageMax} (category: ${classroom!.category})`,
          statusCode: 400,
        };
      }

      // check if classroom can be assigned more children
      if (classroomAssignments >= (classroom!.capacity || 0)) {
        return {
          success: false,
          message: 'Classroom capacity reached',
          error: 'Cannot assign more children to this classroom',
          statusCode: 400,
        };
      }

      const assignment = await this.prismaService.assignment.create({
        data: {
          childId: Number(childId),
          classroomId: Number(classroomId),
        },
      });

      if (!assignment) {
        return {
          success: false,
          message: 'Failed to create assignment',
          error: 'An error occurred while creating the assignment',
          statusCode: 500,
        };
      }

      const formattedAssignment = {
        id: assignment.id,
        childId: assignment.childId,
        classroomId: assignment.classroomId,
      };

      return {
        message: 'Assignment created successfully',
        assignment: formattedAssignment,
        success: true,
        statusCode: 201,
      };
    } catch (error) {
      return {
        message: 'An error occurred while creating the assignment',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async updateAssignment(@Param('id') id: string, @Body() body: { classroomId: string }) {
    try {
      const classRoom = await this.prismaService.classroom.findUnique({
        where: { id: Number(body.classroomId) },
      });

      const assignmentExists = await this.prismaService.assignment.findUnique({
        where: { id: Number(id) },
        include: { child: true },
      });

      // check if child's age is appropriate for the classroom
      if (
        assignmentExists!.child.age < classRoom!.ageMin ||
        assignmentExists!.child.age > classRoom!.ageMax
      ) {
        return {
          success: false,
          message: 'Child age not appropriate for this classroom',
          error: `Child age ${assignmentExists!.child.age} is not within the classroom age range of ${classRoom!.ageMin} to ${classRoom!.ageMax} (category: ${classRoom!.category})`,
          statusCode: 400,
        };
      }

      const classroomAssignments = await this.prismaService.assignment.count({
        where: { classroomId: Number(body.classroomId) },
      });

      // check if classroom can be assigned more children
      if (classroomAssignments >= (classRoom!.capacity || 0)) {
        return {
          success: false,
          message: 'Classroom capacity reached',
          error: 'Cannot assign more children to this classroom',
          statusCode: 400,
        };
      }

      const updatedAssignment = await this.prismaService.assignment.update({
        where: { id: Number(id) },
        data: { classroomId: Number(body.classroomId) },
      });

      if (!updatedAssignment) {
        return {
          success: false,
          message: 'Failed to update assignment',
          error: 'cannot update assignment',
          statusCode: 500,
        };
      }

      const formattedAssignment = {
        id: updatedAssignment.id,
        childId: updatedAssignment.childId,
        classroomId: updatedAssignment.classroomId,
      };

      return {
        message: 'Assignment updated successfully',
        assignment: formattedAssignment,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message:
          error.message || 'An error occurred while updating the assignment',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async deleteAssignment(@Param('id') id: string) {
    try {
      const assignment = await this.prismaService.assignment.delete({
        where: { id: Number(id) },
      });

      if (!assignment) {
        return {
          success: false,
          message: 'Assignment not found',
          error: 'The specified assignment does not exist',
          statusCode: 404,
        };
      }

      return {
        message: 'Assignment deleted successfully',
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while deleting the assignment',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async getChildrenNotAssigned(@Query('category') category?: Category) {
    try {
      // get the category age range
      const minAge = AssignmentsService.ageRangeByCategory[category!].min;
      const maxAge = AssignmentsService.ageRangeByCategory[category!].max;

      const children = await this.prismaService.children.findMany({
        where: {
          assignments: {
            none: {},
          },
          age: {
            gte: minAge,
            lte: maxAge,
          },
        },
        select: {
          id: true,
          full_name: true,
          profile_picture: true,
          gender: true,
          birth_date: true,
          entry_date: true,
        },
      });

      return {
        message: 'Children not assigned retrieved successfully',
        children,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while retrieving the children not assigned',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async getAvailableClasses(@Query('class_id') class_id?: string) {
    try {
      let currentClassCategory: Category | undefined = undefined;

      // get current class category if class_id is provided
      if (class_id) {
        currentClassCategory = await this.prismaService.classroom
          .findUnique({
            where: { id: Number(class_id) },
          })
          .then((c) => c?.category);

        // if need the classroom but it doesn't exist
        if (!currentClassCategory) {
          return {
            success: false,
            message: 'Classroom not found',
            error: 'The specified classroom does not exist',
            statusCode: 404,
          };
        }
      }

      const classQuery = currentClassCategory
        ? { category: currentClassCategory }
        : {};

      // get available classes (except current class if class_id provided)
      const classes = await this.prismaService.classroom.findMany({
        where: {
          ...classQuery,
          ...(class_id ? { id: { not: Number(class_id) } } : {}),
        },
        include: {
          _count: {
            select: { assignments: true },
          },
        },
      });

      // Filter classes where the number of assignments is less than capacity
      const availableClasses = classes.filter(
        (classroom) => classroom._count.assignments < classroom.capacity!,
      );

      const formatedClasses = availableClasses.map((classroom) => ({
        id: classroom.id,
        name: classroom.name,
        category: classroom.category,
        ageMin: classroom.ageMin,
        ageMax: classroom.ageMax,
        capacity: classroom.capacity,
        teacher: classroom.teacherId,
        _count: {
          assignments: classroom._count.assignments,
        },
      }));

      return {
        message: 'Available classes retrieved successfully',
        classes: formatedClasses,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while retrieving the available classes',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async getAssignmentsByClass(@Param('id') id: number) {
    try {
  
      const allAssignments = await this.prismaService.assignment.findMany({
        where: { classroomId: Number(id) },
        include: {
          child: {
            select: {
              id: true,
              full_name: true,
              profile_picture: true,
              gender: true,
              birth_date: true,
              entry_date: true,
            },
          },
        },
      });

      return {
        message: 'assignments retrieved successfully',
        assignments: allAssignments,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while retrieving the assignments',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }
}
