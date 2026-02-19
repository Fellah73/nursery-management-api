import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @Matches(/^(0[7-9]):[0-5][0-9]$/, {
    message: 'Opening time must be in HH:MM format and in the morning',
  })
  openingTime!: string;

  @IsNumber()
  @Min(5, { message: 'Slot interval must be at least 5 minutes' })
  slotInterval!: number;

  @IsNumber()
  @IsEnum([4, 5], {
    message: 'Slots per day must be a 4 or 5',
  })
  slotsPerDay!: number;

  @IsNumber()
  @Min(10, { message: 'Slot duration must be at least 10 minutes' })
  slotDuration!: number;

  @IsNumber()
  @Min(10, { message: 'Breakfast duration must be at least 10 minutes' })
  breakfastDuration!: number;

  @IsNumber()
  @Min(10, { message: 'Lunch duration must be at least 10 minutes' })
  lunchDuration!: number;

  @IsNumber()
  @Min(40, { message: 'Nap duration must be at least 40 minutes' })
  napDuration!: number;

  @IsNumber()
  @Min(5, { message: 'Snack duration must be at least 5 minutes' })
  @Max(15, { message: 'Snack duration must be at most 15 minutes' })
  snackDuration!: number;
}

class SocialLinksDto {
  @IsOptional()
  @IsString()
  @Matches(
    /^https:\/\/www\.facebook\.com\/([\w.%-]+|profile\.php\?id=\d+|pages\/[\w.%-]+\/\d+)$/,
    {
      message:
        'Facebook URL must be a valid Facebook profile, page, or ID URL starting with https://www.facebook.com/',
    },
  )
  facebook!: string;

  @IsOptional()
  @IsString()
  @Matches(/^https:\/\/(www\.)?(x\.com|twitter\.com)\/[A-Za-z0-9_]+$/, {
    message: 'Twitter/X URL must be a valid profile URL (x.com or twitter.com)',
  })
  twitter!: string;

  @IsOptional()
  @IsString()
  @Matches(/^https:\/\/www\.instagram\.com\/[A-Za-z0-9._%+-]+$/, {
    message: 'Instagram URL must be a valid Instagram profile URL',
  })
  instagram!: string;

  @IsOptional()
  @IsString()
  @Matches(/^https:\/\/www\.linkedin\.com\/in\/[A-Za-z0-9._%+-]+\/?$/, {
    message: 'LinkedIn URL must be a valid LinkedIn profile URL',
  })
  linkedin!: string;

  @IsOptional()
  @IsString()
  @Matches(
    /^https:\/\/www\.youtube\.com\/(c\/|channel\/|user\/|@)[A-Za-z0-9._%+-]+\/?$/,
    {
      message: 'YouTube URL must be a valid YouTube channel URL',
    },
  )
  youtube!: string;

  @IsOptional()
  @IsString()
  @Matches(/^https:\/\/www\.tiktok\.com\/@[A-Za-z0-9._%+-]+\/?$/, {
    message:
      'TikTok URL must be a valid TikTok profile URL starting with https://www.tiktok.com/@',
  })
  tiktok!: string;

  @IsOptional()
  @IsString()
  website!: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  slogan!: string;

  @IsOptional()
  @IsString()
  logo!: string;

  @IsOptional()
  @Matches(/^(05|06|07)\d{8}$/, {
    message:
      'Phone number must start with 05, 06, or 07 followed by 8 digits (example: 0612345678)',
  })
  phone!: string;

  @IsOptional()
  @Matches(/^(05|06|07)\d{8}$/, {
    message:
      'Phone number must start with 05, 06, or 07 followed by 8 digits (example: 0612345678)',
  })
  phone2!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks!: SocialLinksDto;
}
