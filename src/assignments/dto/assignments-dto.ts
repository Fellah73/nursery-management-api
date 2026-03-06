import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateAssignmentsDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  childId!: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  classroomId!: number;
}
