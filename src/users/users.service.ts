import { Body, Injectable, Query, Res } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  UserDtoCreate,
  UserDtoGet,
  UserDtoUpdate,
  UserDtoUpdateStatus,
} from './dto/users-dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUsers(@Query() query: UserDtoGet) {
    try {
      const user_id = query.user_id ? Number(query.user_id) : 0;
      const perPage = query.perPage ? Number(query.perPage) : 10;
      const page = query.page && query.page > 0 ? Number(query.page) : 1;

      // check if user is an admin
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: user_id },
      });

      // Check if the user exists and is an admin
      if (
        !adminUser ||
        (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')
      ) {
        return {
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }

      const skip = (page - 1) * perPage;

      let roleFilter = {};
      if (adminUser.role === 'ADMIN') {
        roleFilter = {
          role: {
            notIn: ['ADMIN', 'SUPER_ADMIN'],
          },
        };
      }

      const users = await this.prismaService.user.findMany({
        take: perPage && perPage !== 0 ? perPage : undefined,
        skip: perPage !== 0 ? skip : undefined, // Only skip if we're using pagination
        where: {
          id: {
            not: user_id,
          },
          ...roleFilter,
        },
      });

      // Count total users for pagination metadata
      const totalUsers = await this.prismaService.user.count({
        where: {
          id: {
            not: user_id,
          },
        },
      });

      const usersWithoutPassword = users.map(({ password, ...user }) => user);

      // Return the response
      return {
        message: 'Users retrieved successfully',
        data: usersWithoutPassword,
        length: usersWithoutPassword.length,
        pagination: {
          total: totalUsers,
          page: page,
          perPage: perPage || 'All',
          pages: perPage ? Math.ceil(totalUsers / perPage) : 1,
        },
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      // Handle errors
      return {
        message: 'An error occurred while retrieving users',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async getUsersById(user_id: number) {
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

      const user = await this.prismaService.user.findUnique({
        where: { id }, // Syntaxe simplifiée et correcte
      });

      if (!user) {
        return {
          message: 'User not found',
          statusCode: 404,
          success: false,
        };
      }

      const { password, ...userWithoutPassword } = user;
      return {
        message: 'User retrieved successfully',
        data: userWithoutPassword,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while retrieving the user',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async updateUser(user_id: number, body: UserDtoUpdate) {
    try {
      user_id = Number(user_id);

      // Validate admin_id
      if (!body.admin_id) {
        return {
          message: 'Admin ID is required',
          statusCode: 400,
          success: false,
        };
      }
      const adminId = Number(body.admin_id);

      // Check if the admin exists and is an admin
      const adminUser = await this.prismaService.user.findUnique({
        where: { id: adminId },
      });

      // authenticate admin user
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
      if (!body.email && !body.password) {
        return {
          message: 'No fields to update',
          statusCode: 400,
          success: false,
        };
      }

      // Check if user exists
      const user = await this.prismaService.user.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        return {
          message: 'User not found',
          statusCode: 404,
          success: false,
        };
      }

      // Check if the user is trying to update an admin user
      if (
        (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') &&
        adminUser.role === 'ADMIN'
      ) {
        return {
          message: 'You cannot update an admin user',
          statusCode: 403,
          success: false,
        };
      }

      // Check if email already exists (only if email is being updated)
      if (body.email) {
        const existingUser = await this.prismaService.user.findUnique({
          where: { email: body.email },
        });

        // if email already exists
        if (existingUser) {
          return {
            message: 'Email already in use',
            statusCode: 409,
            success: false,
          };
        }
      }

      // Update user in the database
      const updatedUser = await this.prismaService.user.update({
        where: { id: user_id },
        data: {
          email: body.email || undefined,
          password: body.password || undefined,
        },
      });

      // Exclude password from the response
      const { password: _, ...userWithoutPassword } = updatedUser;

      // Return success response
      return {
        message: 'User updated successfully',
        data: userWithoutPassword,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      // Handle errors
      return {
        message: 'An error occurred while updating the user',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async updateUserStatus(user_id: number, body: UserDtoUpdateStatus) {
    try {
      const adminId = Number(body.admin_id);

      // Check if the admin exists and is an admin
      const adminUser = await this.prismaService.user.findUnique({
        where: { id: adminId },
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
      const userToUpdate = await this.prismaService.user.findUnique({
        where: { id: user_id },
      });

      if (!userToUpdate) {
        return {
          message: 'User not found',
          statusCode: 404,
          success: false,
        };
      }

      if (
        (userToUpdate.role === 'ADMIN' ||
          userToUpdate.role === 'SUPER_ADMIN') &&
        adminUser.role === 'ADMIN'
      ) {
        return {
          message: 'You cannot update an admin user',
          statusCode: 403,
          success: false,
        };
      }

      await this.prismaService.user.update({
        where: { id: user_id },
        data: { isActive: body.status === 'enable' },
      });

      return {
        message: `User status updated to ${body.status}`,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while updating user status',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async createUser(@Body() body: UserDtoCreate) {
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

      if (
        adminUser.role === 'ADMIN' &&
        body.role &&
        body.role !== 'PARENT' &&
        body.role !== 'TEACHER'
      ) {
        return {
          message: 'ADMIN can only create PARENT or TEACHER users',
          statusCode: 403,
          success: false,
        };
      }

      // Create new user
      const newUser = await this.prismaService.user.create({
        data: {
          name: body.name,
          familyName: body.familyName,
          email: body.email,
          password: body.password, // Hash the password before saving in production
          phone: body.phone || undefined,
          role: body.role || 'PARENT', // Default role is PARENT
          address: body.address || undefined,
        },
      });

      // Exclude password from the response
      const { password, ...userWithoutPassword } = newUser;

      return {
        message: 'User created successfully',
        data: userWithoutPassword,
        success: true,
        statusCode: 201,
      };
    } catch (error) {
      return {
        message: 'An error occurred while creating the user',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }
  async getUserStatistics(@Res() res) {
    try {
      const totalUsers = await this.prismaService.user.count();
      if (totalUsers === 0) {
        return res.status(404).json({
          message: 'No users found',
          success: false,
          statusCode: 404,
        });
      }

      const parents = await this.prismaService.user.count({
        where: { role: 'PARENT' },
      });
      const teachers = await this.prismaService.user.count({
        where: { role: 'TEACHER' },
      });
      const admins = await this.prismaService.user.count({
        where: { role: 'ADMIN' },
      });
      const superAdmins = await this.prismaService.user.count({
        where: { role: 'SUPER_ADMIN' },
      });

      return res.status(200).json({
        message: 'User statistics retrieved successfully',
        users: {
          totalUsers : totalUsers,
          byRole: {
            parents: parents,
            teachers: teachers,
            admins: admins,
            superAdmins: superAdmins,
          },
        },
        success: true,
        statusCode: 200,
      });
    } catch (error) {
      console.error('Error retrieving user statistics:', error);
      return res.status(500).json({
        message: 'An error occurred while retrieving user statistics',
        error: error.message,
        statusCode: 500,
        success: false,
      });
    }
  }

  async searchUsers(@Query('search') search_query: string) {
    try {
      // Validation de base
      if (!search_query || search_query.trim() === '') {
        return {
          message: 'Search term is required',
          statusCode: 400,
          success: false,
        };
      }

      const searchTerm = search_query.trim();

      const users = await this.prismaService.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { familyName: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      });

      // Exclude password from the response
      const usersWithoutPassword = users.map(({ password, ...user }) => user);

      return {
        message: 'Users retrieved successfully',
        data: usersWithoutPassword,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        message: 'An error occurred while searching for users',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }
}
