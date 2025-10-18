export class AttendanceDto {
  admin_id: number;
}

export class AttendanceUpdateDto extends AttendanceDto {
  time: string;
}

