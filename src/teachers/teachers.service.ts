import { Body, Injectable, Query } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { env } from 'process';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeacherDtoCreate, TeacherDtoGet } from './dto/teachers-dto';

@Injectable()
export class TeachersService {
  constructor(private readonly prismaService: PrismaService) {}
  async getTeachers(@Query() query: TeacherDtoGet) {
    try {
      const user_id = query.user_id ? Number(query.user_id) : 0;
      const perPage = query.perPage ? Number(query.perPage) : 10;
      const page = query.page && query.page > 0 ? Number(query.page) : 1;

      // check if user is an admin
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: user_id },
      });

      // Check if the user exists and is an admin
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }

      const skip = (page - 1) * perPage;

      const users = await this.prismaService.user.findMany({
        take: perPage && perPage !== 0 ? perPage : undefined,
        skip: perPage !== 0 ? skip : undefined, // Only skip if we're using pagination
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

      // Count total teachers for pagination metadata
      const totalTeachers = await this.prismaService.user.count({
        where: {
          role: {
            in: ['TEACHER'],
          },
        },
      });

      const teachersWithoutPassword = users.map(
        ({ password, ...user }) => user,
      );

      // Return the response
      return {
        message: 'Users retrieved successfully',
        teachers: teachersWithoutPassword,
        length: teachersWithoutPassword.length,
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
        message: 'An error occurred while retrieving users',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async createTeacher(@Body() body: TeacherDtoCreate) {
    try {
      const user_id = Number(body.admin_id);

      // Check if the user is an admin
      const adminUser = await this.prismaService.user.findUnique({
        where: { id: user_id },
      });

      if (
        !adminUser ||
        (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')
      ) {
        return {
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
          success: false,
        };
      }

      // Validate input
      if (!body.email || !body.password) {
        return {
          message: 'Email and password are required',
          statusCode: 400,
          success: false,
        };
      }

      // Check if email already exists
      const existingUser = await this.prismaService.user.findUnique({
        where: { email: body.email },
      });

      if (existingUser) {
        return {
          message: 'Email already in use',
          statusCode: 409,
          success: false,
        };
      }

      if (adminUser.role === 'ADMIN' && body.role !== 'TEACHER') {
        return {
          message: 'ADMIN can only create TEACHER users',
          statusCode: 403,
          success: false,
        };
      }
      // Hash the password
      const saltRounds = parseInt(env.BCRYPT_SALT_ROUNDS as string, 10) || 5;
      const hashedPassword = await bcrypt.hash(body.password, saltRounds);

      // Create new user
      const newTeacher = await this.prismaService.user.create({
        data: {
          name: body.name,
          familyName: body.familyName,
          email: body.email,
          password: hashedPassword,
          phone: Number(body.phone) || undefined,
          role: 'TEACHER',
          address: body.address || undefined,
          profile_picture: body.profile_picture || undefined,
        },
      });

      // Exclude password from the response
      const { password, ...teacherWithoutPassword } = newTeacher;

      return {
        message: 'User created successfully',
        data: teacherWithoutPassword,
        success: true,
        statusCode: 201,
      };
    } catch (error) {
      return {
        message: error.message || 'An error occurred while creating the user',
        statusCode: 500,
        success: false,
      };
    }
  }

  async getAvailableTeachers(admin_id: number) {
    try {
      if (!admin_id || isNaN(admin_id) || admin_id <= 0) {
        return {
          message: 'Invalid admin ID',
          statusCode: 400,
          success: false,
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

      // Exclude password from the response
      const teachersWithoutPassword = availableTeachers.map(
        ({ password, ...user }) => user,
      );

      return {
        message: 'Available teachers retrieved successfully',
        availableTeachers: teachersWithoutPassword,
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

  async searchTeachers(
    @Query('search') search_query: string,
    @Query('only_admin') only_admin: boolean,
    @Query('user_id') user_id: number,
  ) {
    try {
      const adminUser = await this.prismaService.user.findUnique({
        where: { id: Number(user_id) },
      });

      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
          success: false,
        };
      }

      // Validation de base
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
            not: Number(user_id),
          },
          role: {
            in: ['TEACHER'],
          },
        },
      });

      // Exclude password from the response
      const teachersWithoutPassword = teachers.map(
        ({ password, ...user }) => user,
      );

      return {
        message: 'Users retrieved successfully',
        teachers: teachersWithoutPassword,
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

  async getTeacherById(user_id: number) {
    try {
      // Conversion en nombre et vérification
      const id = Number(user_id);

      if (isNaN(id) || id <= 0) {
        return {
          message: 'Invalid user ID',
          statusCode: 400,
          success: false,
        };
      }

      const teacher = await this.prismaService.user.findUnique({
        where: { id }, // Syntaxe simplifiée et correcte
      });

      if (!teacher) {
        return {
          message: 'Teacher not found',
          statusCode: 404,
          success: false,
        };
      }

      const { password, ...teacherWithoutPassword } = teacher;
      return {
        message: 'Teacher retrieved successfully',
        data: teacherWithoutPassword,
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
