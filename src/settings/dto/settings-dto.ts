import {
    IsEnum,
    IsNumber,
    IsString,
    Matches,
    Max,
    Min
} from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @Matches(/^(0[7-9]):[0-5][0-9]$/, {
    message: 'Opening time must be in HH:MM format and in the morning',
  })
  openingTime: string;

  @IsNumber()
  @Min(5, { message: 'Slot interval must be at least 5 minutes' })
  slotInterval: number;

  @IsNumber()
  @IsEnum([4, 5], {
    message: 'Slots per day must be a 4 or 5',
  })
  slotsPerDay: number;

  @IsNumber()
  @Min(10, { message: 'Slot duration must be at least 10 minutes' })
  slotDuration: number;

  @IsNumber()
  @Min(10, { message: 'Breakfast duration must be at least 10 minutes' })
  breakfastDuration: number;

  @IsNumber()
  @Min(10, { message: 'Lunch duration must be at least 10 minutes' })
  lunchDuration: number;

  @IsNumber()
  @Min(40, { message: 'Nap duration must be at least 40 minutes' })
  napDuration: number;

  @IsNumber()
  @Min(5, { message: 'Snack duration must be at least 5 minutes' })
  @Max(15, { message: 'Snack duration must be at most 15 minutes' })
  snackDuration: number;
}
