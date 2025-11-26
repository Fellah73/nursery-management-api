// schedules/pipes/validate-slots.pipe.ts
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from '../dto/auth-dto';

@Injectable()
export class ValidateRegisterUserPipe implements PipeTransform {
  constructor(private readonly prismaService: PrismaService) {}
  async transform(value: RegisterDto): Promise<RegisterDto> {
    // check email duplication
    const emailDuplicate = await this.emailExists(value.email);
    if (emailDuplicate) {
      throw new BadRequestException('Email already exists');
    }

    // if phone passed, check no phone duplication
    if (value.phone) {
      const phoneExist = await this.phoneExists(value.phone);

      if (phoneExist) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    if (value.profile_picture) {
      const isValid = await this.isValidUrl(value.profile_picture);
      if (!isValid) {
        throw new BadRequestException('Invalid profile picture URL');
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

  // validate URL if it actually exists
  private async isValidUrl(url: string): Promise<boolean | undefined> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return (
        response.ok &&
        response.headers.get('content-type')?.startsWith('image/')
      );
    } catch (e) {
      return false;
    }
  }
}
