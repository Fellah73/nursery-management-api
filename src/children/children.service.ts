import { Body, Injectable, Query } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChildrenDtoGet, CreateChildDto } from './dto/children-dto';

@Injectable()
export class ChildrenService {
  constructor(private readonly prismaService: PrismaService) {}

  async getChildren(@Query() query: ChildrenDtoGet) {
    try {
      const admin_id = query.admin_id ? Number(query.admin_id) : 0;
      const perPage = query.perPage ? Number(query.perPage) : 10;
      const page = query.page && query.page > 0 ? Number(query.page) : 1;

      // check if user is an admin
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: admin_id },
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

      let roleFilter = {};

      const children = await this.prismaService.children.findMany({
        take: perPage && perPage !== 0 ? perPage : undefined,
        skip: perPage !== 0 ? skip : undefined, // Only skip if we're using pagination,
      });

      // Count total users for pagination metadata
      const totalChildren = await this.prismaService.children.count({});

      // Return the response
      return {
        message: 'Children retrieved successfully',
        children: children,
        length: children.length,
        pagination: {
          total: totalChildren,
          page: page,
          perPage: perPage || 'All',
          pages: perPage ? Math.ceil(totalChildren / perPage) : 1,
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
      // Transform allergies array to string format: "name1-category1, name2-category2"
      let allergiesString = '';
      if (
        childData.allergies &&
        Array.isArray(childData.allergies) &&
        childData.allergies.length > 0
      ) {
        allergiesString = childData.allergies
          .map((allergy) => `${allergy.category}-${allergy.name}`)
          .join(',');
      }

      const newChild = await this.prismaService.children.create({
        data: {
          full_name: childData.full_name,
          birth_date: childData.birth_date,
          age: age,
          profile_picture: childData.profile_picture || null,
          address: childData.address,
          city: childData.city,
          gender: childData.gender,
          parent_id: Number(adminUser.id),
          entry_date: new Date().toISOString().split('T')[0],
          emergency_contact: childData.emergency_contact_name || null,
          emergency_phone: childData.emergency_contact_phone || null,
          secondary_emergency_contact:
            childData.secondary_emergency_contact_name || null,
          secondary_emergency_phone:
            childData.secondary_emergency_contact_phone || null,
          class_group: childData.class_group,
          blood_type: childData.blood_type,
          medical_info: childData.information || null,
          allergies: allergiesString,
          special_needs: childData.besoins || null,
          vaccination_status: childData.vaccination_status || null,
          notes: childData.notes || null,
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
        children: children,
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
  async updateChildByType(id: number, type: string, body: any) {
    try {
      if (!id || !type) {
        return {
          status: 'error',
          message: 'Child ID and type are required',
          success: false,
          statusCode: 400,
        };
      }

      // Check if child exists
      const existingChild = await this.prismaService.children.findUnique({
        where: { id: Number(id) },
      });

      if (!existingChild) {
        return {
          status: 'error',
          message: 'Child not found',
          success: false,
          statusCode: 404,
        };
      }

      // Prepare update data based on type
      let updateData = {};

      switch (type.toLowerCase()) {
        case 'contact':
          updateData = {
            emergency_contact:
              body.emergency_contact || existingChild.emergency_contact,
            emergency_phone:
              body.emergency_phone || existingChild.emergency_phone,
            secondary_emergency_contact:
              body.secondary_emergency_contact ||
              existingChild.secondary_emergency_contact,
            secondary_emergency_phone:
              body.secondary_emergency_phone ||
              existingChild.secondary_emergency_phone,
          };
          break;
        case 'address':
          updateData = {
            address: body.address || existingChild.address,
            city: body.city || existingChild.city,
          };
          break;
        case 'medical_info':
          updateData = {
            medical_info: body.medical_info ,
          };
          break;
        case 'special_needs':
          updateData = {
            special_needs: body.special_needs ,
          };
          break;
        case 'notes':
          updateData = {
            notes: body.notes,
          };
          break;
        case 'vaccination_status':
          updateData = {
            vaccination_status:
              body.vaccination_status,
          };
          break;
        default:
          return {
            status: 'error',
            message:
              'Invalid update type. Supported types: contact, address, medical, personal',
            success: false,
            statusCode: 400,
          };
      }

      const updatedChild = await this.prismaService.children.update({
        where: { id: Number(id) },
        data: updateData,
      });

      return {
        status: 'success',
        data: updatedChild,
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
