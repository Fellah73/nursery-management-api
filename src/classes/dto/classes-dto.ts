import { Category } from "generated/prisma";

export class CreateClassDto {
  name: string;
  category: Category;
  capacity: number;
  teacherId: number;
}


export class ClassesDtoGet {
  admin_id: number;
  perPage: string;
  page?: number;
}

export class ClassUpdateDto {
  name?: string;
  category?: Category;
  capacity?: number;
  teacherId?: number;
}
