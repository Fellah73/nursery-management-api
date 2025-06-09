export class CreateChildDto {
    full_name: string;
    birth_date: string;
    gender: Gender;
    parent_id: number;
    profile_picture?: string;
}

enum Gender{
    H = 'H',
    F = 'F',
}
