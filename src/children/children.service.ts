import { Body, Injectable, Param, Query } from '@nestjs/common';
import { Category } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChildrenDtoGet } from './dto/children-dto';

@Injectable()
export class ChildrenService {
  constructor(private readonly prismaService: PrismaService) {}

  private calculateAge(birthDateStr: string): number {
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // service : done
  async getChildren(@Query() query: ChildrenDtoGet) {
    try {
      const perPage = query.perPage ? Number(query.perPage) : 10;
      const page = query.page && query.page > 0 ? Number(query.page) : 1;

      const skip = (page - 1) * perPage;

      const children = await this.prismaService.children.findMany({
        take: perPage && perPage !== 0 ? perPage : undefined,
        skip: perPage !== 0 ? skip : undefined, // Only skip if we're using pagination,
      });

      // supprimer certaine propery pour des raisons de sécurité
      children.forEach((child) => {
        delete (child as any).entry_date;
        delete (child as any).created_at;
        delete (child as any).parent_id;
      });

      const totalChildren = await this.prismaService.children.count({});

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

  // service : done
  async createChild(@Body() childData: any) {
    try {
      const age = this.calculateAge(childData.birth_date);

      if (age < 1) {
        return {
          status: 'error',
          message: 'Child must be at least 1 year old',
          success: false,
          statusCode: 400,
        };
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
          parent_id: 8,
          entry_date: new Date().toISOString().split('T')[0],
          emergency_contact: childData.emergency_contact_name || null,
          emergency_phone: childData.emergency_contact_phone || null,
          secondary_emergency_contact:
            childData.secondary_emergency_contact_name || null,
          secondary_emergency_phone:
            childData.secondary_emergency_contact_phone || null,
          class_group: 'fefe',
          blood_type: childData.blood_type,
          medical_info: childData.information || null,
          allergies: childData.allergies || null,
          special_needs: childData.besoins || null,
          vaccination_status: childData.vaccination_status || null,
          notes: childData.notes || null,
        },
      });

      delete (newChild as any).entry_date;
      delete (newChild as any).created_at;
      delete (newChild as any).parent_id;
      delete (newChild as any).class_group;

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

  // service : done
  async getChildrenStatistics() {
    try {
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

  // service : done
  async getAllergies(@Query('category') category: Category) {
    try {
      if (!category || !Object.values(Category).includes(category)) {
        return {
          status: 'error',
          message: 'Category is required and must be a valid Category',
          success: false,
          statusCode: 400,
        };
      }

      // Fetch all allergies from children
      const childrenWithAllergies = await this.prismaService.children.findMany({
        where: {
          allergies: {
            not: '',
          },
          assignments: {
            some: {
              classroom: {
                category: category!,
              },
            },
          },
        },
        select: {
          allergies: true,
          full_name: true,
          gender: true,
          profile_picture: true,
          assignments: {
            select: {
              classroom: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      const allergiesAlimentaires = childrenWithAllergies
        .filter((child) => {
          // Check if child has any alimentaires allergy
          return child.allergies && child.allergies.includes('alimentaires-');
        })
        .map((child) => {
          // Extract only alimentaires allergies from the string
          const allergiesList = child.allergies!.split(',');
          const alimentairesAllergies = allergiesList
            .filter((allergy) => allergy.trim().startsWith('alimentaires-'))
            .map((allergy) => allergy.replace('alimentaires-', '').trim());

          return {
            child_name: child.full_name,
            gender: child.gender,
            profile_picture: child.profile_picture,
            classroom: child.assignments[0]?.classroom.name || 'No classroom',
            allergies: alimentairesAllergies,
          };
        });

      // group the children by the allergies
      const groupedByAllergy = allergiesAlimentaires.reduce(
        (acc, child) => {
          child.allergies.forEach((allergy) => {
            if (!acc[allergy]) {
              acc[allergy] = [];
            }
            acc[allergy].push(child);
          });
          return acc;
        },
        {} as Record<string, typeof allergiesAlimentaires>,
      );

      return {
        status: 'success',
        childrenWithAllergies: groupedByAllergy,
        length: allergiesAlimentaires.length,
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

  // service : done
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

      children.forEach((child) => {
        delete (child as any).entry_date;
        delete (child as any).class_group;
      });

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

  // service : done
  async getChildById(@Param('id') id: number) {
    try {
      const child = await this.prismaService.children.findUnique({
        where: { id: Number(id) },
      });

      delete (child as any).created_at;
      delete (child as any).parent_id;
      delete (child as any).class_group;

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

  // service : done
  async getMedicalInfoByChildId(id: number) {
    try {
      const child = await this.prismaService.children.findUnique({
        where: { id },
      });

      const medicalInfo = {
        medical_info: child!.medical_info || 'No medical information available',
        allergies: child!.allergies || 'No allergies information available',
        vaccination_status:
          child!.vaccination_status || 'No vaccination status available',
        special_needs:
          child!.special_needs || 'No special needs information available',
        emergency_contact:
          child!.emergency_contact ||
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

  // service : done
  async updateChildByType(@Param('id') id: number, @Body() body: any) {
    try {
      const existingChild = await this.prismaService.children.findUnique({
        where: { id: Number(id) },
      });

      let updateData = {};

      if (body.type == 'contact') {
        updateData = {
          emergency_contact:
            body.emergency_contact || existingChild!.emergency_contact,
          emergency_phone:
            body.emergency_phone || existingChild!.emergency_phone,
          secondary_emergency_contact:
            body.secondary_emergency_contact ||
            existingChild!.secondary_emergency_contact,
          secondary_emergency_phone:
            body.secondary_emergency_phone ||
            existingChild!.secondary_emergency_phone,
        };
      } else if (body.type == 'address') {
        updateData = {
          address: body.address || existingChild!.address,
          city: body.city || existingChild!.city,
        };
      } else if (body.type == 'medical_info') {
        updateData = {
          medical_info: body.medical_info,
        };
      } else if (body.type == 'special_needs') {
        updateData = {
          special_needs: body.special_needs,
        };
      } else if (body.type == 'notes') {
        updateData = {
          notes: body.notes,
        };
      } else if (body.type == 'vaccination_status') {
        updateData = {
          vaccination_status: body.vaccination_status,
        };
      } else {
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

      delete (updatedChild as any).created_at;
      delete (updatedChild as any).parent_id;
      delete (updatedChild as any).class_group;

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
