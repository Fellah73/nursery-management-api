import { IsNumber } from "class-validator";

export class CreateAssignmentsDto {
  @IsNumber()
  childId: number;

  @IsNumber()
  classroomId: number;
}
