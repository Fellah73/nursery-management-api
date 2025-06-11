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

  async getChildrenByParentId(parentId: number) {
    try {
      if (!parentId) {
        return {
          status: 'error',
          message: 'Parent ID is required',
          success: false,
          statusCode: 400,
        };
      }

      // Get all children for the parent
      const children = await this.prismaService.children.findMany({
        where: { parent_id: parentId },
      });

      if (children.length === 0) {
        return {
          status: 'error',
          message: 'No children found for this parent',
          success: false,
          statusCode: 404,
        };
      }

      // Group children by gender
      const groupedByGender = children.reduce(
        (acc, child) => {
          if (!acc[child.gender]) {
            acc[child.gender] = [];
          }
          acc[child.gender].push(child);
          return acc;
        },
        {} as Record<string, typeof children>,
      );

      return {
        status: 'success',
        data: groupedByGender,
        length: children.length,
        boysLength: groupedByGender['H']?.length || 0,
        girlsLength: groupedByGender['F']?.length || 0,
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

  async getMedicalInfoByChildId(id: number) {
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
        where: { id },
      });

      if (!child) {
        return {
          status: 'error',
          message: 'No child found with this ID',
          success: false,
          statusCode: 404,
        };
      }

      const medicalInfo = {
        medical_info: child.medical_info || 'No medical information available',
        allergies: child.allergies || 'No allergies information available',
        vaccination_status:
          child.vaccination_status || 'No vaccination status available',
        special_needs:
          child.special_needs || 'No special needs information available',
        emergency_contact:
          child.emergency_contact ||
          'No emergency contact information available',
      };

      return {
        status: 'success',
        data: medicalInfo,
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
  async getChildrenStatistics(admin_id: string) {
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

      const totalChildren = await this.prismaService.children.count();
      const boysCount = await this.prismaService.children.count({
        where: { gender: 'H' },
      });
      const girlsCount = await this.prismaService.children.count({
        where: { gender: 'F' },
      });

      // By age group
      const children = await this.prismaService.children.findMany({
        select: { age: true },
      });

      const byAgeGroup = {
        '2-3': 0,
        '4-5': 0,
        '6+': 0,
      };

      for (const child of children) {
        if (child.age >= 2 && child.age <= 3) {
          byAgeGroup['2-3']++;
        } else if (child.age >= 4 && child.age <= 5) {
          byAgeGroup['4-5']++;
        } else if (child.age >= 6) {
          byAgeGroup['6+']++;
        }
      }

      return {
        status: 'success',
        data: {
          totalChildren,
          byGender: {
            boysCount,
            girlsCount,
          },
          byAgeGroup,
        },
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
}
