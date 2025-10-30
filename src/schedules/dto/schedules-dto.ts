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
  @IsOptional()
  @IsString()
  name?: string;

  admin_id?: number;

  // Option plus stricte avec message d'erreur personnalisé
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'startDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  startDate: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'endDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  endDate?: string;
}

export class UpdateSchedulePeriodDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'startDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  startDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'endDate must be in YYYY-MM-DD format (e.g., 2025-12-25)',
  })
  endDate?: string;
}

export class DeleteSlotDto {
  @IsEnum(DayOfWeek, {
    message:
      'dayOfWeek must be a valid day (SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY)',
  })
  dayOfWeek: DayOfWeek;

  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM format (e.g., 09:30)',
  })
  startTime: string;

  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM format (e.g., 17:30)',
  })
  endTime: string;
}

export class SlotDto extends DeleteSlotDto {
  
  @IsString()
  activity: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateSlotDto extends SlotDto {
  @IsOptional()
  @IsString()
  category?: string;
}

export class CreateScheduleSlotsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  slots: SlotDto[];
}

export class UpdateScheduleSlotDto {    
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSlotDto)
  slots: UpdateSlotDto[];
}

export class DeleteScheduleSlotDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeleteSlotDto)
  slots: DeleteSlotDto[];
}

export class ScheduleDtoGet {
  admin_id: number;
  perPage: string;
  page?: number;
}
