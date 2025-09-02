import { Injectable, Query } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ClassesDtoGet,
  ClassUpdateDto,
  CreateClassDto,
} from './dto/classes-dto';

@Injectable()
export class ClassesService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllClasses(@Query() query: ClassesDtoGet) {
    try {
      const admin_id = query.admin_id ? Number(query.admin_id) : 0;
      const perPage = query.perPage ? Number(query.perPage) : 10;
      const page = query.page && query.page > 0 ? Number(query.page) : 1;

      const adminUser = await this.prismaService.user.findFirst({
        where: { id: admin_id },
      });

      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }

      const skip = (page - 1) * perPage;

      const classrooms = await this.prismaService.classroom.findMany({
        take: perPage && perPage !== 0 ? perPage : undefined,
        skip: perPage !== 0 ? skip : undefined, // Only skip if we're using pagination
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              familyName: true,
              email: true,
              profile_picture: true,
            },
          },
          _count: {
            select: {
              assignments: true, // Count the number of children assigned to this classroom
              schedulePeriods: true,
            },
          },
        },
      });

      const totalClassrooms = await this.prismaService.classroom.count({});

      const tookedClassesNumber = await this.prismaService.classroom.count({
        where: {
          assignments: {
            some: {},
          },
        },
      });

      return {
        message: 'Classrooms retrieved successfully',
        classrooms: classrooms,
        length: classrooms.length,
        pagination: {
          total: totalClassrooms,
          tooked: tookedClassesNumber,
          page: page,
          perPage: perPage || 'All',
          pages: perPage ? Math.ceil(totalClassrooms / perPage) : 1,
        },
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while retrieving children',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async createClass(admin_id: string, classData: CreateClassDto) {
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

      const existingTeacherInClasses =
        await this.prismaService.classroom.findFirst({
          where: { teacherId: Number(classData.teacherId) },
        });

      if (existingTeacherInClasses) {
        return {
          success: false,
          message: 'Teacher is already assigned to another class',
          error: 'A teacher can only be assigned to one class at a time',
          statusCode: 400,
        };
      }

      const rangeByCategory = {
        BEBE: '3-18',
        PETIT: '1-2',
        MOYEN: '3-4',
        GRAND: '5-6',
      };

      const newClass = await this.prismaService.classroom.create({
        data: {
          name: classData.name,
          category: classData.category,
          ageMin: Number(rangeByCategory[classData.category].split('-')[0]),
          ageMax: Number(rangeByCategory[classData.category].split('-')[1]),
          capacity: Number(classData.capacity),
          teacherId: Number(classData.teacherId),
        },
      });

      return {
        message: 'Class created successfully',
        class: newClass,
        success: true,
        statusCode: 201,
      };
    } catch (error) {
      return {
        message: 'An error occurred while creating the class',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async getClassById(id: number, admin_id: string) {
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
      const classroom = await this.prismaService.classroom.findUnique({
        where: { id: Number(id) },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              familyName: true,
              email: true,
              profile_picture: true,
              gender: true,
            },
          },
          _count: {
            select: {
              assignments: true, // Count the number of children assigned to this classroom
            },
          },
        },
      });
      if (!classroom) {
        return {
          message: 'Classroom not found',
          success: false,
          statusCode: 404,
        };
      }
      return {
        message: 'Classroom retrieved successfully',
        classroom,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while retrieving the classroom',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async updateClass(admin_id: string, classData: ClassUpdateDto, id: number) {
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
      const existingClass = await this.prismaService.classroom.findUnique({
        where: { id: Number(id) },
        include: {
          _count: {
            select: {
              assignments: true,
            },
          },
        },
      });
      if (!existingClass) {
        return {
          message: 'Class not found',
          success: false,
          statusCode: 404,
        };
      }

      if (
        classData.category !== existingClass.category &&
        existingClass._count.assignments > 0
      ) {
        return {
          message: 'Cannot change category of a class with assigned children',
          success: false,
          statusCode: 400,
        };
      }

      if (
        classData.capacity &&
        classData.capacity < existingClass._count.assignments
      ) {
        return {
          message:
            'Cannot reduce capacity below the number of assigned children',
          success: false,
          statusCode: 400,
        };
      }

      const updatedClass = await this.prismaService.classroom.update({
        where: { id: Number(id) },
        data: {
          name: classData.name || existingClass.name,
          category: classData.category || existingClass.category,
          capacity: Number(classData.capacity) || existingClass.capacity,
          teacherId: Number(classData.teacherId) || existingClass.teacherId,
        },
      });
      if (!updatedClass) {
        return {
          message: 'Class not found or update failed',
          success: false,
          statusCode: 404,
        };
      }
      return {
        message: 'Class updated successfully',
        class: updatedClass,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while updating the class',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async deleteClass(admin_id: string, id: number) {
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
      const existingClass = await this.prismaService.classroom.findUnique({
        where: { id: Number(id) },
        include: {
          _count: {
            select: {
              assignments: true, // Count the number of children assigned to this classroom
            },
          },
        },
      });
      if (!existingClass) {
        return {
          message: 'Class not found',
          success: false,
          statusCode: 404,
        };
      }
      if (existingClass._count.assignments > 0) {
        return {
          message: 'Cannot delete a class with assigned children',
          success: false,
          statusCode: 400,
        };
      }

      const deletedClassRoom = await this.prismaService.classroom.delete({
        where: { id: Number(id) },
      });

      if (!deletedClassRoom) {
        return {
          message: 'Class not found or deletion failed',
          success: false,
          statusCode: 404,
        };
      }
      return {
        message: 'Class deleted successfully',
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'Internal server error',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async searchClasses(@Query('name') name: string) {
    try {
      // Validation de base
      if (!name || name.trim() === '') {
        return {
          message: 'Search term is required',
          statusCode: 400,
          success: false,
        };
      }

      const searchTerm = name.trim();
      const classRooms = await this.prismaService.classroom.findMany({
        where: {
          OR: [{ name: { contains: searchTerm, mode: 'insensitive' } }],
        },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              familyName: true,
              email: true,
              profile_picture: true,
            },
          },
          _count: {
            select: {
              assignments: true,
            },
          },
        },
      });

      if (classRooms.length === 0) {
        return {
          message: 'No classes found matching the search term',
          statusCode: 404,
          success: false,
        };
      }
      return {
        message: 'Children retrieved successfully',
        classRooms: classRooms,
        length: classRooms.length,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        message: 'An error occurred while searching for classes',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }
}
