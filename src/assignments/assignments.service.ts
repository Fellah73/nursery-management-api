import { Injectable } from '@nestjs/common';
import { Category } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssignmenstDto } from './dto/assignments-dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAssignment(admin_id: string, body: CreateAssignmenstDto) {
    try {
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(admin_id) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }
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
      const classroom = await this.prismaService.classroom.findUnique({
        where: { id: Number(classroomId) },
      });
      if (!classroom) {
        return {
          success: false,
          message: 'Classroom not found',
          error: 'The specified classroom does not exist',
          statusCode: 404,
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
      return {
        message: 'Assignment created successfully',
        assignment,
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

  async deleteAssignment(id: string, admin_id: string) {
    try {
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(admin_id) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }

      const assignmentExists = await this.prismaService.assignment.findUnique({
        where: { id: Number(id) },
      });

      if (!assignmentExists) {
        return {
          success: false,
          message: 'Assignment not found',
          error: 'The specified assignment does not exist',
          statusCode: 404,
        };
      }

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

  async getAssignmentsByClass(id: number, admin_id: string) {
    try {
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(admin_id) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }

      const classExists = await this.prismaService.classroom.findUnique({
        where: { id: Number(id) },
      });

      if (!classExists) {
        return {
          success: false,
          message: 'Classroom not found',
          error: 'The specified classroom does not exist',
          statusCode: 404,
        };
      }

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

  async getChildrenNotAssigned(admin_id: string, category?: Category) {
    try {
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(admin_id) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }
      const classRoom = await this.prismaService.classroom.findFirst({
        where: { category: category },
      });
      if (!classRoom) {
        return {
          success: false,
          message: 'no category of this type',
          error: 'The specified classroom does not exist',
          statusCode: 404,
        };
      }

      const minAge = classRoom.ageMin;
      const maxAge = classRoom.ageMax;

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

  async getAvailableClasses(admin_id: string, class_id?: string) {
    try {
      

      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(admin_id) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }

      const currentClass = await this.prismaService.classroom.findUnique({
        where: { id: Number(class_id) },
      });

      const classQuery = currentClass ? { category: currentClass.category } : {};

      const classes = await this.prismaService.classroom.findMany({
        where: {
          ...classQuery,
          ...(class_id ? { id: { not: Number(class_id) } } : {})
        },
        include: {
          _count: {
        select: { assignments: true },
          },
        },
      });

      // Filter classes where the number of assignments is less than capacity
      const availableClasses = classes.filter(
        (classroom) => classroom._count.assignments < classroom.capacity!
      );

      return {
        message: 'Available classes retrieved successfully',
        classes: availableClasses,
        success: true,
        statusCode: 200,
      };

      return {
        message: 'Available classes retrieved successfully',
        classes,
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

  async updateAssignment(
    id: string,
    admin_id: string,
    body: { classroomId: string },
  ) {
    try {
      if (!body.classroomId) {
        return {
          success: false,
          message: 'Invalid request',
          error: 'Classroom ID is required',
          statusCode: 400,
        };
      }

      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(admin_id) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }

      const assignmentExists = await this.prismaService.assignment.findUnique({
        where: { id: Number(id) },
      });

      if (!assignmentExists) {
        return {
          success: false,
          message: 'Assignment not found',
          error: 'The specified assignment does not exist',
          statusCode: 404,
        };
      }

      const classroom = await this.prismaService.classroom.findUnique({
        where: { id: Number(body.classroomId) },
      });

      if (!classroom) {
        return {
          success: false,
          message: 'Classroom not found',
          error: 'The specified classroom does not exist',
          statusCode: 404,
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

      return {
        message: 'Assignment updated successfully',
        assignment: updatedAssignment,
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
}
