import {
  IsArray,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { EventType } from 'generated/prisma';

export class GetEventsDto {
  @IsEnum(EventType, {
    message:
      'Invalid eventType, must be one of: ' +
      Object.values(EventType).join(', '),
  })
  eventType?: EventType;

  @IsOptional()
  @IsString()
  @IsEnum(['true', 'false'], {
    message: 'isPublished must be a boolean value',
  })
  isPublished?: string;
}

export class EventSoonestBirthdaysDto {
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @IsOptional()
  @IsNumberString()
  range?: number;
}

export class EventDtoGet {
  @IsString()
  perPage: string;

  @IsOptional()
  @IsNumberString()
  page?: number;
}

export class CreateEventDto {
  @IsString()
  @Matches(/^[A-Z]/, {
    message: 'Title must begin with capital letter',
  })
  title: string;

  @IsString()
  description: string;

  @IsEnum(EventType, {
    message:
      'Invalid eventType, must be one of: ' +
      Object.values(EventType).join(', '),
  })
  eventType: EventType;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'eventDate must be YYYY-MM-DD format',
  })
  eventDate: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  childId?: string | undefined;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]/, {
    message: 'Title must begin with capital letter',
  })
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['OTHER'], {
    message: 'Invalid eventType, must be OTHER ',
  })
  eventType?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'eventDate must be YYYY-MM-DD format',
  })
  eventDate?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class HandleEventMediaDto {
  @IsArray()
  @IsString({ each: true })
  @Matches(/^(https?:\/\/[^\s]+)$/, {
    each: true,
    message: 'Each media URL must be a valid URL',
  })
  media: string[];
}

export class ReorderEventMediaDto {
  @IsArray()
  @IsNumber({}, { each: true })
  reorderIndexes: number[];
}
