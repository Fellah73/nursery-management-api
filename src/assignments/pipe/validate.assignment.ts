// schedules/pipes/validate-slots.pipe.ts
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssignmentsDto } from '../dto/assignments-dto';

@Injectable()
export class ValidateAssignmentsPipe implements PipeTransform {
  constructor(private prismaService: PrismaService) {}
  async transform(value: CreateAssignmentsDto): Promise<CreateAssignmentsDto> {
    const classroomExists = await this.checkClassRoomExistence(
      value.classroomId,
    );
    if (!classroomExists.success) {
      throw new BadRequestException(classroomExists.message);
    }

    const childExists = await this.checkChildExistence(value.childId);
    if (!childExists.success) {
      throw new BadRequestException(childExists.message);
    }

    return value;
  }

  // method to check classroom existence
  private async checkClassRoomExistence(classroomId: number) {
    try {
      const classroom = this.prismaService.classroom.findUnique({
        where: { id: classroomId },
      });

      if (!classroom) {
        return {
          message: 'Classroom does not exist',
          success: false,
        };
      }

      return {
        message: 'Classroom exists',
        success: true,
      };
    } catch (error) {
      return {
        message: 'Error checking classroom existence: ' + error.message,
        success: false,
      };
    }
  }

  // method to check child existence
  private async checkChildExistence(childId: number) {
    try {
      const child = await this.prismaService.children.findUnique({
        where: { id: childId },
      });

      if (!child) {
        return {
          message: 'Child does not exist',
          success: false,
        };
      }

      return {
        message: 'Child exists',
        success: true,
      };
    } catch (error) {
      return {
        message: 'Error checking child existence: ' + error.message,
        success: false,
      };
    }
  }


}
