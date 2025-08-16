export class CreateChildDto {
  full_name: string;
  birth_date: string;
  gender: 'H' | 'F';
  address: string;
  city: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  secondary_emergency_contact_name?: string;
  secondary_emergency_contact_phone?: string;
  class_group: string;
  blood_type: string;
  information?: string;
  allergies?: {
    category: string;
    name: string;
  }[];
  besoins?: string;
  vaccination_status?: string;
  notes?: string;
  profile_picture?: string;
}

export class ChildrenDtoGet {
  admin_id: number;
  perPage: string;
  page?: number;
}

