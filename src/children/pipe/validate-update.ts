// schedules/pipes/validate-slots.pipe.ts
import {
    BadRequestException,
    PipeTransform
} from '@nestjs/common';

export class ValidateChildUpdatePipe implements PipeTransform {
  private readonly validFeildsLogique = {
    contact: [
      'emergency_contact',
      'emergency_phone',
      'secondary_emergency_contact',
      'secondary_emergency_phone',
    ],
    address: ['address', 'city'],
    medical_info: ['medical_info'],
    special_needs: ['special_needs'],
    notes: ['notes'],
    vaccination_status: ['vaccination_status'],
  };

  transform(value: any): any {

    if (!value.type) {
      throw new BadRequestException('Type is required for update validation');
    }

    if(!Object.keys(this.validFeildsLogique).includes(value.type)) {
      throw new BadRequestException(`Invalid type ${value.type}. Allowed types are: ${Object.keys(this.validFeildsLogique).join(', ')}`);
    }

    const feildsPertinence = this.checkFieldsPertinence(
      value.type,
      Object.keys(value).filter((key) => key !== 'type'),
    );

    if (!feildsPertinence.fieldLogique) {
      throw new BadRequestException(feildsPertinence.message);
    }

    return value;
  }

  private checkFieldsPertinence(type: string, properties: any): any {
    const validFields = this.validFeildsLogique[type];
    if (!validFields) {
      return {
        fieldLogique: false,
        message: `Invalid type ${type}. Allowed types are: ${Object.keys(
          this.validFeildsLogique,
        ).join(', ')}`,
      };
    }

    for (const field of properties) {
      if (!validFields.includes(field)) {
        return {
          fieldLogique: false,
          message: `Invalid field ${field} for type ${type}. Allowed fields are: ${validFields.join(', ')}`,
        };
      }
    }

    return {
      fieldLogique: true,
    };
  }
}
