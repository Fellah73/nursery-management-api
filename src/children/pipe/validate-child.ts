// schedules/pipes/validate-slots.pipe.ts
import { BadRequestException, PipeTransform } from '@nestjs/common';
import { AllergyDto, CreateChildDto } from '../dto/children-dto';

export class ValidateChildCreationPipe implements PipeTransform {
  transform(value: CreateChildDto): any {
    const birthDate = new Date(value.birth_date);
    const today = new Date();

    if (birthDate > today) {
      throw new BadRequestException('Birth date cannot be in the future');
    }

    let allergiesString = '';

    // Handle allergies if provided
    if (
      value.allergies &&
      Array.isArray(value.allergies) &&
      value.allergies.length > 0
    ) {
      // Check for duplicate allergies
      const hasDuplicates = this.checkDuplicateAllergies(value.allergies);
      if (hasDuplicates.duplicate) {
        throw new BadRequestException(
          'Duplicate allergies found :' + hasDuplicates.key,
        );
      }

      // new format for allergies
      allergiesString = value.allergies
        .map((allergy) => `${allergy.category}-${allergy.name}`)
        .join(',');
    }

    let formattedValue = {
      ...value,
      allergies: allergiesString || null,
    };

    return formattedValue;
  }

  private checkDuplicateAllergies(allergies: AllergyDto[]): any {
    const seen = new Set<string>();
    for (const allergy of allergies) {
      const key = `${allergy.category}-${allergy.name}`;
      if (seen.has(key)) {
        return {
          key,
          duplicate: true,
        };
      }
      seen.add(key);
    }
    return false;
  }
}
