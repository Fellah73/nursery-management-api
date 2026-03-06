import { ApiProperty } from '@nestjs/swagger';

export class AttendanceDto {
  @ApiProperty({ example: '5' })
  admin_id!: number;
}

export class AttendanceUpdateDto extends AttendanceDto {
  @ApiProperty({ example: '15:30' })
  time!: string;
}
