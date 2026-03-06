import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({ example: 'BIRTHDAY' })
  @IsOptional()
  @IsEnum(EventType, {
    message:
      'Invalid eventType, must be one of: ' +
      Object.values(EventType).join(', '),
  })
  eventType?: EventType;

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @IsString()
  @IsEnum(['true', 'false'], {
    message: 'isPublished must be a boolean value',
  })
  isPublished?: string;
}

export class MonthlyEventDtoGet {
  @ApiPropertyOptional({ example: '5' })
  @IsNumberString()
  @Matches(/^(1[0-2]|[1-9])$/, {
    message: 'Month must be between 1 and 12',
  })
  month?: number;

  @ApiPropertyOptional({ example: '2026' })
  @IsNumberString()
  @Matches(/^20\d{2}$/, {
    message: 'Year must be in format 20XX',
  })
  year?: number;
}

export class EventSoonestBirthdaysDto {
  @ApiPropertyOptional({ example: '5' })
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional({ example: '30' })
  @IsOptional()
  @IsNumberString()
  range?: number;
}

export class EventDtoGet {
  @ApiProperty({ example: '10' })
  @IsString()
  perPage!: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: number;
}

export class CreateEventDto {
  @ApiProperty({ example: 'Execursion to ZOO' })
  @IsString()
  @Matches(/^[A-Z]/, {
    message: 'Title must begin with capital letter',
  })
  title!: string;

  @ApiProperty({ example: 'We are going to visit ZOO' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'FIELD_TRIP' })
  @IsEnum(EventType, {
    message:
      'Invalid eventType, must be one of: ' +
      Object.values(EventType).join(', '),
  })
  eventType!: EventType;

  @ApiProperty({ example: '2025-06-15' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'eventDate must be YYYY-MM-DD format',
  })
  eventDate!: string;

  @ApiProperty({ example: 'Central Park' })
  @IsString()
  location!: string;

  @ApiPropertyOptional({ example: '23' })
  @IsOptional()
  @IsString()
  childId?: string | undefined;
}

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Execursion to Mesuem' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]/, {
    message: 'Title must begin with capital letter',
  })
  title?: string;

  @ApiPropertyOptional({ example: 'We are going to visit Museum' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'FIELD_TRIP' })
  @IsOptional()
  eventType?: string;

  @ApiPropertyOptional({ example: '2025-06-15' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'eventDate must be YYYY-MM-DD format',
  })
  eventDate?: string;

  @ApiPropertyOptional({ example: 'Bardou Museum' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class HandleEventMediaDto {
  @ApiProperty({ example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'] })
  @IsArray()
  @IsString({ each: true })
  @Matches(/^(https?:\/\/[^\s]+)$/, {
    each: true,
    message: 'Each media URL must be a valid URL',
  })
  media!: string[];
}

export class ReorderEventMediaDto {
  @ApiProperty({ example: [2, 0, 1] })
  @IsArray()
  @IsNumber({}, { each: true })
  reorderIndexes!: number[];
}
