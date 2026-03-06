import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { DayOfWeek } from 'generated/prisma';

export class CreateSchedulePeriodDto {
  @ApiPropertyOptional({ example: 'Ramdan 2026' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '2026-04-09' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'startDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-05-09' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'endDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  endDate?: string;
}

export class UpdateSchedulePeriodDto {
  @ApiPropertyOptional({ example: 'Ramdan 2027' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'startDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  startDate?: string;

  @ApiPropertyOptional({ example: '2027-05-09' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'endDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  endDate?: string;
}

export class DeleteSlotDto {
  @ApiProperty({ example: 'MONDAY', type: String })
  @IsEnum(DayOfWeek, {
    message:
      'dayOfWeek must be a valid day (SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY)',
  })
  dayOfWeek!: DayOfWeek;

  @ApiProperty({ example: '09:30' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM format (e.g., 09:30)',
  })
  startTime!: string;

  @ApiProperty({ example: '11:30' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM format (e.g., 11:30)',
  })
  endTime!: string;
}

export class SlotDto extends DeleteSlotDto {
  @ApiProperty({ example: 'Planting' })
  @IsString()
  activity!: string;

  @ApiPropertyOptional({ example: 'Garden' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateSlotDto extends SlotDto {
  @ApiPropertyOptional({ example: 'Music' })
  @IsOptional()
  @IsString()
  category?: string;
}

export class CreateScheduleSlotsDto {
  @ApiProperty({ type: [UpdateSlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSlotDto)
  slots!: UpdateSlotDto[];
}

export class UpdateScheduleSlotDto {
  @ApiProperty({ type: [UpdateSlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSlotDto)
  slots!: UpdateSlotDto[];
}

export class DeleteScheduleSlotDto {
  @ApiProperty({ type: [DeleteSlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeleteSlotDto)
  slots!: DeleteSlotDto[];
}

export class ScheduleDtoGet {
  @ApiProperty({ example: '10' })
  @IsOptional()
  perPage!: string;

  @ApiPropertyOptional({ example: '1' })
  page?: number;
}
