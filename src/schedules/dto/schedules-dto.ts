import { DayOfWeek } from 'generated/prisma';

export class CreateSchedulePeriodDto {
    name?: string;
    adminId?: number;
    startDate: string;
    endDate?: string;
}

export class UpdateSchedulePeriodDto {
    startDate?: string;
    endDate?: string;
}

export class CreateScheduleSlotsDto {
    slots: {
        dayOfWeek: DayOfWeek;
        startTime: string;
        endTime: string;
        activity: string;
        location?: string;
    }[];
}

export class UpdateScheduleSlotDto {
    slots: {
        dayOfWeek: DayOfWeek;
        startTime: string;
        endTime: string;
        activity: string;
        location?: string;
        category?: string;
    }[];
}

export class ScheduleDtoGet {
  admin_id: number;
  perPage: string;
  page?: number;
}
