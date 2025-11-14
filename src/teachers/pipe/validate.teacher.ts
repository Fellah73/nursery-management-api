// schedules/pipes/validate-slots.pipe.ts
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { TeacherDtoUpdate } from '../dto/teachers-dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ValidateTeacherCreationPipe implements PipeTransform {
  constructor(private readonly prismaService: PrismaService) {}
  async transform(value: TeacherDtoUpdate): Promise<TeacherDtoUpdate> {
    
    
    // required fields
    if (!value.password || !value.email) {
      throw new BadRequestException('email & password are required');
    }

    // email checker
    const emailExist = await this.emailExists(value.email!);
    if (emailExist) {
      throw new BadRequestException('Email already exists');
    }

    // if phone passed, check no phone duplication
    if (value.phone) {
      const phoneExist = await this.phoneExists(value.phone!);

      if (phoneExist) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    return value;
  }

  private async emailExists(email: string): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    return !!user;
  }

  private async phoneExists(phone: string): Promise<boolean> {
    const user = await this.prismaService.user.findFirst({
      where: { phone: Number(phone) },
    });
    return !!user;
  }
}
