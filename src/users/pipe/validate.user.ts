// schedules/pipes/validate-slots.pipe.ts
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDtoCreate, UserDtoUpdate } from '../dto/users-dto';

@Injectable()
export class ValidateUserPipe<T> implements PipeTransform {
  constructor(private readonly prismaService: PrismaService) {}
  async transform(value: T): Promise<T> {
    // if phone passed, check no phone duplication
    if (value['phone']) {
      const phoneExist = await this.phoneExists(value['phone']);

      if (phoneExist) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    return value;
  }

  protected async emailExists(email: string): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    return !!user;
  }

  protected async phoneExists(phone: string): Promise<boolean> {
    const user = await this.prismaService.user.findFirst({
      where: { phone: Number(phone) },
    });
    return !!user;
  }
}

// Validate user creation pipe 
@Injectable()
export class ValidateUserCreationPipe
  extends ValidateUserPipe<UserDtoCreate>
  implements PipeTransform
{
  async transform(value: UserDtoCreate): Promise<UserDtoCreate> {
    // required fields
    if (!value.password || !value.email) {
      throw new BadRequestException('email & password are required');
    }

    // email checker
    const emailExist = await this.emailExists(value['email']);
    if (emailExist) {
      throw new BadRequestException('Email already exists');
    }

    // check phone duplication if phone passed in parent class
    await super.transform(value);

    return value;
  }
}

// Validate user update pipe
@Injectable()
export class ValidateUserUpdatePipe
  extends ValidateUserPipe<UserDtoUpdate>
  implements PipeTransform
{
  async transform(value: UserDtoUpdate): Promise<UserDtoUpdate> {
    // email checker if mail is passed
    if (value.email) {
      const emailExist = await this.emailExists(value['email']);
      if (emailExist) {
        throw new BadRequestException('Email already exists');
      }
    }

    // check phone duplication if phone passed in parent class
    await super.transform(value);

    return value;
  }
}
