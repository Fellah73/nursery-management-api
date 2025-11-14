import { Body, Injectable, Param, Query } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { env } from 'process';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  TeacherDtoCreate,
  TeacherDtoGet
} from './dto/teachers-dto';

@Injectable()
export class TeachersService {
  constructor(private readonly prismaService: PrismaService) {}

  // service : done
  async getTeachers(@Query() query: TeacherDtoGet) {
    try {
      const perPage = query.perPage ? Number(query.perPage) : 10;
      const page = query.page && query.page > 0 ? Number(query.page) : 1;

      const skip = (page - 1) * perPage;

      const users = await this.prismaService.user.findMany({
        take: perPage && perPage !== 0 ? perPage : undefined,
        skip: perPage !== 0 ? skip : undefined,
        where: {
          role: {
            in: ['TEACHER'],
          },
        },
        include: {
          classroom: {
            select: {
              id: true,
              name: true,
              category: true,
              _count: {
                select: {
                  assignments: true,
                },
              },
            },
          },
        },
      });

      // pagination metadata
      const totalTeachers = await this.prismaService.user.count({
        where: {
          role: {
            in: ['TEACHER'],
          },
        },
      });

      const formattedTeachers = users.map(
        ({ password, created_at, updated_at, speciality, ...user }) => user,
      );

      return {
        message: 'Teachers retrieved successfully',
        teachers: formattedTeachers,
        length: formattedTeachers.length,
        pagination: {
          total: totalTeachers,
          page: page,
          perPage: perPage || 'All',
          pages: perPage ? Math.ceil(totalTeachers / perPage) : 1,
        },
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while retrieving teachers',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async createTeacher(@Body() body: TeacherDtoCreate) {
    try {
      // Hash the password
      const saltRounds = parseInt(env.BCRYPT_SALT_ROUNDS as string, 10) || 5;
      const hashedPassword = await bcrypt.hash(body.password, saltRounds);

      // Create new user
      const newTeacher = await this.prismaService.user.create({
        data: {
          name: body.name,
          familyName: body.familyName,
          email: body.email!,
          password: hashedPassword,
          phone: Number(body.phone) || undefined,
          role: 'TEACHER',
          address: body.address || undefined,
          profile_picture: body.profile_picture || undefined,
        },
      });

      // formatted teacher response
      const {
        password,
        created_at,
        updated_at,
        speciality,
        ...formattedTeacher
      } = newTeacher;

      return {
        message: 'teacher created successfully',
        data: formattedTeacher,
        success: true,
        statusCode: 201,
      };
    } catch (error) {
      return {
        message:
          error.message || 'An error occurred while creating the teacher',
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async getAvailableTeachers() {
    try {
      const availableTeachers = await this.prismaService.user.findMany({
        where: {
          role: 'TEACHER',
          classroom: null,
        },
      });

      if (availableTeachers.length === 0) {
        return {
          message: 'No available teachers found',
          success: true,
          statusCode: 204,
          availableTeachers: [],
        };
      }

      const formatedTeachers = availableTeachers.map(
        ({ password, created_at, updated_at, speciality, ...user }) => user,
      );

      return {
        message: 'Available teachers retrieved successfully',
        availableTeachers: formatedTeachers,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while retrieving available teachers',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async searchTeachers(
    @Query('search') search_query: string,
    @Query('admin_id') admin_id: number,
  ) {
    try {
      if (!search_query || search_query.trim() === '') {
        return {
          message: 'Search term is required',
          statusCode: 400,
          success: false,
        };
      }

      const searchTerm = search_query.trim();

      let teachers = await this.prismaService.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { familyName: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
          id: {
            not: Number(admin_id),
          },
          role: {
            in: ['TEACHER'],
          },
        },
      });

      const formatedTeachers = teachers.map(
        ({ password, created_at, updated_at, speciality, ...user }) => user,
      );

      return {
        message: 'Users retrieved successfully',
        teachers: formatedTeachers,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        message: 'An error occurred while searching for teachers',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async getTeacherById(@Param('id') id: number) {
    try {
      const teacher = await this.prismaService.user.findUnique({
        where: { id: Number(id) },
      });

      if (!teacher) {
        return {
          message: 'teacher not found',
          statusCode: 404,
          success: false,
        };
      }

      const {
        password,
        created_at,
        updated_at,
        speciality,
        ...formatedTeacher
      } = teacher;

      return {
        message: 'Teacher retrieved successfully',
        data: formatedTeacher,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while retrieving the teacher',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }
}
