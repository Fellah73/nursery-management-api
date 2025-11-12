// schedules/pipes/validate-slots.pipe.ts
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { CreateMenuPeriodDto } from '../dto/menu-dto';
import { MenuService } from '../menu.service';

// make a abstract class for the two pipes to extend the two classes
@Injectable()
export abstract class ValidateMenuPeriodPipe<T> implements PipeTransform {
  constructor(private readonly menuService: MenuService) {}
  transform(value: T): T {
    // check if startDate is before endDate
    const chronologiqueOrder = this.checkDateOrder(
      value['startDate'],
      value['endDate'],
    );
    if (!chronologiqueOrder) {
      throw new BadRequestException(
        'the menu period endDate must be after startDate',
      );
    }

    const isValid = this.checkScheduleTimeLimit(value['startDate']);
    if (!isValid) {
      throw new BadRequestException(
        'the menu period start date must be within 60 days of today',
      );
    }

    // the menu Activation call
    this.menuService.handleMenusActivation();

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
export class ValidateMenuPeriodCreationPipe
  extends ValidateMenuPeriodPipe<CreateMenuPeriodDto>
  implements PipeTransform
{
  constructor(menuService: MenuService) {
    super(menuService);
  }
  transform(value: CreateMenuPeriodDto): CreateMenuPeriodDto {
    super.transform(value);
    return value;
  }

  // @ override checkDateOrder function
  checkDateOrder(startDate: string, endDate: string): boolean {
    // no date provided case
    if (!startDate && !endDate) {
      return false;
    }
    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00.000Z');
      const end = new Date(endDate + 'T00:00:00.000Z');

      // order check
      return start < end;
    }
    return true;
  }
}

// service : done
export class ValidateMenuPeriodUpdatePipe
  extends ValidateMenuPeriodPipe<CreateMenuPeriodDto>
  implements PipeTransform
{
  constructor(menuService: MenuService) {
    super(menuService);
  }
  transform(value: CreateMenuPeriodDto): CreateMenuPeriodDto {
    if (!value.startDate && !value.endDate) {
      throw new BadRequestException(
        'At least one of startDate or endDate must be provided for update',
      );
    }
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
