import { RegisterDto } from "src/auth/dto/auth-dto";

export class TeacherDtoGet {
  user_id: number;
  perPage: string;
  page?: number;
}

export class TeacherDtoUpdate {
  admin_id: number;
  email?: string;
  phone?: string;
  address?: string;
  profile_picture?: string;
  speciality?: string; // Optional field for teacher's speciality
}

export class TeacherDtoCreate extends RegisterDto {
    admin_id: number;
    speciality?: string; // Optional field for teacher's speciality
}




