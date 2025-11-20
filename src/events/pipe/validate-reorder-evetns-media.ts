// schedules/pipes/validate-slots.pipe.ts
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ReorderEventMediaDto } from '../dto/events-dto';

@Injectable()
export class ValidateEventMediaReorderPipe implements PipeTransform {
  transform(value: ReorderEventMediaDto): ReorderEventMediaDto {
    // check duplicates
    this.checkDuplicates(value.reorderIndexes);

    // check no gaps
    this.checkNoGaps(value.reorderIndexes);

    // check values in range
    this.isValuesInRange(value.reorderIndexes);

    return value;
  }

  // Check for duplicate medias
  private checkDuplicates(indexes: number[]) {
    const seen = new Set<number>();

    for (const index of indexes) {
      if (seen.has(index)) {
        throw new BadRequestException(
          `index: ${index}. ` + 'duplicate detected',
        );
      }
      seen.add(index);
    }
  }

  private checkNoGaps(indexes: number[]) {
    const sortedIndexes = [...indexes].sort((a, b) => a - b);
    for (let i = 0; i < sortedIndexes.length - 1; i++) {
      if (sortedIndexes[i + 1] - sortedIndexes[i] > 1) {
        throw new BadRequestException(
          `index: ${sortedIndexes[i]}-${sortedIndexes[i + 1]} ` +
            'gaps detected',
        );
      }
    }
  }

  private isValuesInRange(indexes: number[]) {
    for (const index of indexes) {
      if (index < 1 || index > indexes.length) {
        throw new BadRequestException(`index: ${index} is out of range`);
      }
    }
  }
}
