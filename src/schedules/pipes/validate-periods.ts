// schedules/pipes/validate-slots.pipe.ts
import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import {
  CreateSchedulePeriodDto,
  UpdateSchedulePeriodDto,
} from '../dto/schedules-dto';

@Injectable()
export class ValidateSchedulePeriodPipe implements PipeTransform {
  transform(value: CreateSchedulePeriodDto): CreateSchedulePeriodDto {
    // check if startDate is before endDate
    const chronologiqueOrder = this.checkDateOrder(
      value.startDate,
      value.endDate!,
    );
    if (!chronologiqueOrder) {
      throw new BadRequestException('endDate must be after startDate');
    }

    const isValid = this.checkSchedulePeriodLogic(value.startDate);
    if (!isValid) {
      throw new BadRequestException(
        'start date must be within 60 days of today',
      );
    }
    return value;
  }

  private checkDateOrder(startDate: string, endDate: string): boolean {
    // (scheduledPeriod case)
    if (startDate) {
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(endDate + 'T00:00:00.000Z');

      // unlimited period time length case
      if (!endDate) {
        return true;
      }

      // order check
      return start < end;

      // no startDate (currentPeriod Case)
    } else {
      const currentDate = new Date();
      const end = new Date(endDate + 'T00:00:00.000Z');

      // unlimited period time length case
      if (!endDate) {
        return true;
      }

      // order check
      return currentDate < end;
    }
  }

  private checkSchedulePeriodLogic(startDate: string): boolean {
    // only for scheduledPeriods
    if (startDate) {
      const currentDate = new Date();

      const start = new Date(startDate + 'T00:00:00.000Z');
      const diffTime = Math.abs(currentDate.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 60) {
        return false;
      }
    }
    return true;
  }
}

export class ValidateSchedulePeriodUpdatePipe implements PipeTransform {
  transform(value: UpdateSchedulePeriodDto): UpdateSchedulePeriodDto {
    // check if startDate is before endDate
    const chronologiqueOrder = this.checkDateOrder(
      value.startDate!,
      value.endDate!,
    );
    if (!chronologiqueOrder) {
      throw new BadRequestException('endDate must be after startDate');
    }

    const isValid = this.checkScheduleTimeLimit(value.startDate!);
    if (!isValid) {
      throw new BadRequestException(
        'start date must be within 60 days of today',
      );
    }

    return value;
  }

  private checkDateOrder(startDate: string, endDate: string): boolean {
    // (update two dates case)
    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(endDate + 'T00:00:00.000Z');

      // order check
      return start < end;
    }
    return true;
  }

  private checkScheduleTimeLimit(startDate: string): boolean {
    // only for scheduledPeriods
    if (startDate) {
      const currentDate = new Date();

      const start = new Date(startDate + 'T00:00:00.000Z');
      const diffTime = Math.abs(currentDate.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 60) {
        return false;
      }
    }
    return true;
  }
}
