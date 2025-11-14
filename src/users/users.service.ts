import { Body, Injectable, Param, Query } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { env } from 'process';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  UserDtoCreate,
  UserDtoGet,
  UserDtoUpdate,
  UserDtoUpdateProfile,
  UserDtoUpdateStatus,
  UserGradeUpdateDto,
} from './dto/users-dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  // service : done
  async getUsers(@Query() query: UserDtoGet) {
    try {
      const perPage = query.perPage ? Number(query.perPage) : 10;
      const page = query.page && query.page > 0 ? Number(query.page) : 1;

      const skip = (page - 1) * perPage;

      let roleFilter = {};

      roleFilter = {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN'],
        },
      };

      const users = await this.prismaService.user.findMany({
        take: perPage && perPage !== 0 ? perPage : undefined,
        skip: perPage !== 0 ? skip : undefined,
        where: {
          id: {
            not: Number(query.admin_id),
          },
          ...roleFilter,
        },
      });

      // Count total users for pagination metadata
      const totalUsers = await this.prismaService.user.count({
        where: {
          id: {
            not: Number(query.admin_id),
          },
          ...roleFilter,
        },
      });

      const formatedUsers = users.map(
        ({ password, created_at, updated_at, speciality, ...user }) => user,
      );

      // Return the response
      return {
        message: 'Users retrieved successfully',
        users: formatedUsers,
        length: formatedUsers.length,
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
      return {
        message: 'An error occurred while retrieving users',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async createUser(
    @Query('admin_id') admin_id: number,
    @Body() body: UserDtoCreate,
  ) {
    try {
      const adminUser = await this.prismaService.user.findUnique({
        where: { id: Number(admin_id) },
      });

      // creation authorization
      if (
        adminUser!.role === 'ADMIN' &&
        body.role !== 'PARENT' &&
        body.role !== 'TEACHER'
      ) {
        return {
          message:
            'ADMIN can only create PARENT or TEACHER users , admins are created by SUPER_ADMIN only',
          statusCode: 403,
          success: false,
        };
      }

      const saltRounds = parseInt(env.BCRYPT_SALT_ROUNDS as string, 10) || 5;
      const hashedPassword = await bcrypt.hash(body.password, saltRounds);

      const newUser = await this.prismaService.user.create({
        data: {
          name: body.name,
          familyName: body.familyName,
          email: body.email,
          password: hashedPassword,
          phone: Number(body.phone) || undefined,
          role: body.role,
          address: body.address || undefined,
          profile_picture: body.profile_picture || undefined,
          gender: body.gender,
        },
      });

      const { password, created_at, updated_at, speciality, ...formatedUser } =
        newUser;

      return {
        message: 'User created successfully',
        data: formatedUser,
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

  // service : done
  async getUserStatistics() {
    try {
      const totalUsers = await this.prismaService.user.count();
      if (totalUsers === 0) {
        return {
          message: 'No users found',
          success: false,
          statusCode: 404,
        };
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

      return {
        message: 'User statistics retrieved successfully',
        users: {
          totalUsers: totalUsers,
          byRole: {
            parents: parents,
            teachers: teachers,
            admins: admins,
            superAdmins: superAdmins,
          },
        },
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      console.error('Error retrieving user statistics:', error);
      return {
        message: 'An error occurred while retrieving user statistics',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async searchUsers(
    @Query('search') search_query: string,
    @Query('only_admin') only_admin: boolean,
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

      let users = await this.prismaService.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { familyName: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
          id: {
            not: Number(admin_id),
          },
        },
      });

      if (only_admin && only_admin === true) {
        const adminUsers = users.filter(
          (user) => user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
        );
        users = adminUsers;
      }

      const formatedUsers = users.map(
        ({ password, created_at, updated_at, speciality, ...user }) => user,
      );

      return {
        message: 'Users retrieved successfully',
        users: formatedUsers,
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

  // service : done
  async getUsersById(@Param('id') id: number) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: Number(id) },
      });

      if (!user) {
        return {
          message: 'User not found',
          statusCode: 404,
          success: false,
        };
      }

      const { password, created_at, updated_at, speciality, ...formatedUser } =
        user;
      return {
        message: 'User retrieved successfully',
        data: formatedUser,
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

  // service : done
  async updateUser(@Param('id') id: number, @Body() body: UserDtoUpdate) {
    try {
      const currentUser = await this.prismaService.user.findUnique({
        where: { id: Number(id) },
      });

      const updatedUser = await this.prismaService.user.update({
        where: { id: Number(id) },
        data: {
          email: body.email || currentUser?.email!,
          phone: Number(body.phone) || currentUser?.phone,
          address: body.address || currentUser?.address,
          profile_picture: body.profile_picture || currentUser?.profile_picture,
        },
      });

      if (!updatedUser) {
        return {
          message: 'An error occurred while updating the user 1',
          statusCode: 500,
          success: false,
        };
      }

      const { password, created_at, updated_at, speciality, ...formatedUser } =
        updatedUser;

      return {
        message: 'User updated successfully',
        data: formatedUser,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: error.message || 'An error occurred while updating the user',
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async updateUserProfile(
    @Param('id') id: number,
    @Body() body: UserDtoUpdateProfile,
  ) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: Number(id) },
      });

      const updatedUser = await this.prismaService.user.update({
        where: { id: Number(id) },
        data: {
          email: body.email || user!.email,
          phone: Number(body.phone) || user!.phone,
          address: body.address || user!.address,
          profile_picture: body.profile_picture || user!.profile_picture,
          name: body.name || user!.name,
          familyName: body.familyName || user!.familyName,
        },
      });

      if (!updatedUser) {
        return {
          message: 'An error occurred while updating the user profile',
          statusCode: 500,
          success: false,
        };
      }

      const {
        password,
        created_at,
        updated_at,
        speciality,
        ...formatedUserProfile
      } = updatedUser;

      return {
        message: 'User profile updated successfully',
        updatedUser: formatedUserProfile,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while updating the user profile',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async updateUserPassword(
    @Param('id') id: number,
    @Body() body: { newPassword: string },
  ) {
    try {
      const saltRounds = parseInt(env.BCRYPT_SALT_ROUNDS as string, 10) || 5;
      const hashedPassword = await bcrypt.hash(body.newPassword, saltRounds);

      if (!hashedPassword) {
        return {
          message: 'Error in updating password process',
          statusCode: 500,
          success: false,
        };
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id: Number(id) },
        data: { password: hashedPassword },
      });

      if (!updatedUser) {
        return {
          message: 'An error occurred while updating the user password',
          statusCode: 500,
          success: false,
        };
      }

      return {
        message: 'User password updated successfully',
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while updating the user password',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async updateUserStatus(@Param('id') id: number, @Body() body: UserDtoUpdateStatus) {
    try {
      const updatedUser = await this.prismaService.user.update({
        where: { id: Number(id) },
        data: { isActive: body.status === 'enable' },
      });

      if (!updatedUser) {
        return {
          message: 'An error occurred while updating user status',
          statusCode: 500,
          success: false,
        };
      }

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

  // service : done
  async updateUserGrade(
    @Param('id') id: number,
    @Body() body: UserGradeUpdateDto,
  ) {
    try {
      const userToUpdate = await this.prismaService.user.findUnique({
        where: { id: Number(id) },
      });

      if (userToUpdate!.role === 'TEACHER' || userToUpdate!.role === 'PARENT') {
        return {
          message: 'Only ADMIN and SUPER_ADMIN roles can be updated',
          statusCode: 400,
          success: false,
        };
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id: Number(id) },
        data: { role: body.grade === 'ADMIN' ? 'ADMIN' : 'SUPER_ADMIN' },
      });

      if (!updatedUser) {
        return {
          message: 'An error occurred while updating the user grade',
          statusCode: 500,
          success: false,
        };
      }

      const {
        password,
        created_at,
        updated_at,
        speciality,
        role,
        ...formatedUser
      } = updatedUser;

      return {
        message: 'User role updated successfully',
        data: formatedUser,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while updating the user grade',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }
}
