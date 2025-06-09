import { Body, Injectable, Query } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChildDto } from './dto/children-dto';

@Injectable()
export class ChildrenService {
  constructor(private readonly prismaService: PrismaService) {}

  async getChildren(@Query() admin_id: string) {
    try {
      if (!admin_id) {
        return {
          status: 'error',
          message: 'Admin ID is required',
          success: false,
          statusCode: 400,
        };
      }

      const adminUser = await this.prismaService.user.findUnique({
        where: { id: parseInt(admin_id) },
      });

      if (
        !adminUser ||
        (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')
      ) {
        return {
          status: 'error',
          message: 'Only admins can access this resource',
          success: false,
          statusCode: 403,
        };
      }
      const children = await this.prismaService.children.findMany();
      return {
        status: 'success',
        data: children,
        length: children.length,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        success: false,
        statusCode: 500,
      };
    }
  }

  async getChildById(id: number) {
    try {
      if (!id) {
        return {
          status: 'error',
          message: 'Child ID is required',
          success: false,
          statusCode: 400,
        };
      }

      const child = await this.prismaService.children.findUnique({
        where: { id: Number(id) },
      });

      if (!child) {
        return {
          status: 'error',
          message: 'Child not found',
          success: false,
          statusCode: 404,
        };
      }

      return {
        status: 'success',
        data: child,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        success: false,
        statusCode: 500,
      };
    }
  }

  async createChild(
    @Query('admin_id') admin_id: string,
    @Body() childData: CreateChildDto,
  ) {
    try {
      if (!admin_id) {
        return {
          status: 'error',
          message: 'Admin ID is required',
          success: false,
          statusCode: 400,
        };
      }

      const adminUser = await this.prismaService.user.findUnique({
        where: { id: parseInt(admin_id) },
      });

      if (
        !adminUser ||
        (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')
      ) {
        return {
          status: 'error',
          message: 'Only admins can create children',
          success: false,
          statusCode: 403,
        };
      }

      // Calculate age
      const birthDate = new Date(childData.birth_date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // crate the child
      const newChild = await this.prismaService.children.create({
        data: {
          full_name: childData.full_name,
          birth_date: childData.birth_date,
          age: age,
          profile_picture: childData.profile_picture || 'null',
          gender: childData.gender,
          parent_id: Number(childData.parent_id),
          entry_date: new Date().toISOString().split('T')[0],
        },
      });

      return {
        status: 'success',
        data: newChild,
        success: true,
        statusCode: 201,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        success: false,
        statusCode: 500,
      };
    }
  }
  async searchChildren(@Query('name') name: string) {
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

      console.log('Search term:', searchTerm);
      const children = await this.prismaService.children.findMany({
        where: {
          OR: [{ full_name: { contains: searchTerm, mode: 'insensitive' } }],
        },
      });

      if (children.length === 0) {
        return {
          message: 'No children found matching the search term',
          statusCode: 404,
          success: false,
        };
      }
      return {
        message: 'Children retrieved successfully',
        data: children,
        length: children.length,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        message: 'An error occurred while searching for children',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }
}
