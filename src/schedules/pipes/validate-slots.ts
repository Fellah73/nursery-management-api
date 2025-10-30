// schedules/pipes/validate-slots.pipe.ts
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { NurserySettings } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateScheduleSlotsDto, ScheduleSlotDto } from '../dto/schedules-dto';

@Injectable()
export class ValidateScheduleSlotsPipe implements PipeTransform {
  constructor(private prismaService: PrismaService) {}
  async transform(
    value: CreateScheduleSlotsDto,
  ): Promise<CreateScheduleSlotsDto> {
    const configNursery = await this.getNurseryConfig();
    if (!configNursery) {
      throw new BadRequestException('Nursery configuration not found');
    }

    const allowedStartTimes = this.getSlotsStartTimes(configNursery);
    console.log('Allowed Start Times:', allowedStartTimes);

    const groupedSlots: Record<string, ScheduleSlotDto[]> = this.groupByDay(
      value.slots,
    );
    console.log('Grouped Slots:', groupedSlots);

    // iterate over each day's slots to perform validations
    for (const [day, slots] of Object.entries(groupedSlots)) {
      if (slots.length > configNursery.slotsPerDay) {
        throw new BadRequestException(
          `Le nombre de créneaux pour ${day} dépasse la limite autorisée de ${configNursery.slotsPerDay}`,
        );
      }

      // check duplicated slots
      this.checkDuplicates(slots);

      // check slot duration and interval
      this.checkTimeHandler(slots, configNursery.slotDuration);

      // check slots start times according to interval and durations
      this.checkSlotsTiming(slots, allowedStartTimes);
    }

    return value;
  }

  // Group slots per dayOfWeek
  private groupByDay(
    slots: ScheduleSlotDto[],
  ): Record<string, ScheduleSlotDto[]> {
    return slots.reduce(
      (acc: Record<string, ScheduleSlotDto[]>, slot: ScheduleSlotDto) => {
        if (!acc[slot.dayOfWeek]) {
          acc[slot.dayOfWeek] = [];
        }
        acc[slot.dayOfWeek].push(slot);
        return acc;
      },
      {},
    );
  }

  // Fetch nursery configuration
  private async getNurseryConfig() {
    return this.prismaService.nurserySettings.findFirst();
  }

  // Check for duplicate slots
  private checkDuplicates(slots: ScheduleSlotDto[]) {
    const seen = new Set<string>();

    for (const slot of slots) {
      const key = `${slot.startTime}-${slot.endTime}`;

      if (seen.has(key)) {
        throw new BadRequestException(
          `Slot dupliqué détecté: ${slot.dayOfWeek} de ${slot.startTime} à ${slot.endTime}`,
          'Veuillez supprimer les doublons et réessayer.',
        );
      }
      seen.add(key);
    }
  }

  // check slot duration and interval
  private checkTimeHandler(slots: ScheduleSlotDto[], slotDuration: number) {
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const startMinutes = this.timeToMinutes(slot.startTime);
      const endMinutes = this.timeToMinutes(slot.endTime);

      if (startMinutes >= endMinutes) {
      throw new BadRequestException(
        `Horaire invalide pour ${slot.dayOfWeek} (slot ${i + 1}): l'heure de début (${slot.startTime}) doit être avant l'heure de fin (${slot.endTime})`,
      );
      }

      const duration = endMinutes - startMinutes;
      if (duration !== slotDuration) {
      throw new BadRequestException(
        `Durée de créneau invalide pour ${slot.dayOfWeek} (slot ${i + 1}): la durée doit être de ${slotDuration} minutes.`,
      );
      }
    }
  }

  // check slots start times according to interval and durations
  private checkSlotsTiming(
    slots: ScheduleSlotDto[],
    slotsStartTimes: string[],
  ) {
    for (let i=0 ; i < slots.length ; i++) {
      const slot = slots[i];
      // check starting time
      if (!slotsStartTimes.includes(slot.startTime)) {
        throw new BadRequestException(
          `Heure de début de créneau invalide pour ${slot.dayOfWeek} (slot ${i + 1}): ${slot.startTime},les heures de début autorisées sont: ${slotsStartTimes.join(', ')}`,
        );
      }
    }
  }

  // get slots startingTimes
  private getSlotsStartTimes(nurseryConfig: NurserySettings): string[] {
    let startTimes: number[] = [];
    // opening time + breakfast_duration
    const firstSlotStart =
      this.timeToMinutes(nurseryConfig.openingTime!) +
      (nurseryConfig.breakfastDuration || 0);

    let nextStart = firstSlotStart;
    for (let i = 1; i <= nurseryConfig.slotsPerDay!; i++) {
      // put the breakfast break after the first slot
      if (i === nurseryConfig.slotsPerDay / 2 + 1) {
        // lunch break + interval
        nextStart += nurseryConfig.lunchDuration + nurseryConfig.slotInterval;

        // add nap duration + interval
        nextStart += nurseryConfig.napDuration + nurseryConfig.slotInterval;
      }

      // push the next start time of the slot
      startTimes.push(nextStart);

      // increment by the slot duration
      nextStart += nurseryConfig.slotDuration + nurseryConfig.slotInterval;
    }

    // convert the minutes to HH:mm format
    const formattedStartTimes: string[] = startTimes.map((minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    });

    return formattedStartTimes;
  }

  // Convertit une heure HH:mm en minutes depuis minuit
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
