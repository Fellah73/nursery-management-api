import { RegisterDto } from "src/auth/dto/auth-dto";

export class UserDtoGet {
  user_id: number;
  perPage: string;
  page?: number;
}

export class UserDtoUpdate {
  admin_id: number;
  email?: string;
  phone?: string;
  address?: string;
  profile_picture?: string;
}

export class UserDtoUpdateProfile {
  email?: string;
  phone?: string;
  address?: string;
  profile_picture?: string;
  name?: string;
  familyName?: string;
}

export class UserDtoUpdateStatus {
    admin_id: number;
    status: 'enable' | 'disable';
}
export class UserDtoCreate extends RegisterDto {
    admin_id: number;
}




