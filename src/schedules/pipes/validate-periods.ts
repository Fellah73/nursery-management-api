// schedules/pipes/validate-slots.pipe.ts
import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import {
  CreateSchedulePeriodDto,
  UpdateSchedulePeriodDto,
} from '../dto/schedules-dto';
import { SchedulesService } from '../schedules.service';


// make a abstract class for the two pipes to extend the two classes
@Injectable()
export abstract class ValidateSchedulePipe<T> implements PipeTransform {
  constructor(private readonly schedulesService: SchedulesService) {}
  transform(value: T): T {
    // check if startDate is before endDate
    const chronologiqueOrder = this.checkDateOrder(
      value['startDate'],
      value['endDate'],
    );
    if (!chronologiqueOrder) {
      throw new BadRequestException('endDate must be after startDate');
    }

    const isValid = this.checkScheduleTimeLimit(value['startDate']);
    if (!isValid) {
      throw new BadRequestException(
        'start date must be within 60 days of today',
      );
    }

    // the schedule Activation call
    this.schedulesService.handleScheduleActivation();

    return value;
  }

  abstract checkDateOrder(startDate: string, endDate: string): boolean;

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


// service : done
export class ValidateSchedulePeriodCreationPipe
  extends ValidateSchedulePipe<CreateSchedulePeriodDto>
  implements PipeTransform
{
  constructor(schedulesService: SchedulesService) {
    super(schedulesService);
  }
  transform(value: CreateSchedulePeriodDto): CreateSchedulePeriodDto {
    super.transform(value);
    return value;
  }

  // @ override checkDateOrder function
  checkDateOrder(startDate: string, endDate: string): boolean {
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
}


// service : done
export class ValidateSchedulePeriodUpdatePipe
  extends ValidateSchedulePipe<UpdateSchedulePeriodDto>
  implements PipeTransform
{
  constructor(schedulesService: SchedulesService) {
    super(schedulesService);
  }
  transform(value: UpdateSchedulePeriodDto): UpdateSchedulePeriodDto {
    super.transform(value);
    return value;
  }

  // @ override checkDateOrder function
  checkDateOrder(startDate: string, endDate: string): boolean {
    // (update two dates case)
    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(endDate + 'T00:00:00.000Z');

      // order check
      return start < end;
    }
    return true;
  }
}
