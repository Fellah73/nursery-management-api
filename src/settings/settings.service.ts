import { Body, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings-dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly defaultSettings = {
    openingTime: '08:00',
    slotInterval: 15,
    slotsPerDay: 4,
    slotDuration: 30,
    breakfastDuration: 30,
    lunchDuration: 30,
    napDuration: 60,
    snackDuration: 15,
  };

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private getSlotsStartTimes(nurseryConfig: UpdateSettingsDto): string[] {
    let startTimes: number[] = [];
    // opening time + breakfast_duration
    const firstSlotStart =
      this.timeToMinutes(nurseryConfig.openingTime!) +
      (nurseryConfig.breakfastDuration || 0) +
      nurseryConfig.slotInterval;

    let nextStart = firstSlotStart;
    for (let i = 1; i <= nurseryConfig.slotsPerDay!; i++) {
      const middleSlotPosition =
        Math.floor(
          nurseryConfig.slotsPerDay! % 2 === 0
            ? nurseryConfig.slotsPerDay! / 2
            : nurseryConfig.slotsPerDay! / 2 + 1,
        ) + 1;

      // put the breakfast break after the first slot
      if (i === middleSlotPosition) {
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

  private getFormattedStartTimes(startTimes: number[]): string[] {
    return startTimes.map((minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    });
  }

  private getFormattedSettings(settings: any) {
    const { id, createdAt, updatedAt, ...rest } = settings;
    return rest;
  }

  private getFormattedProfile(profile: any) {
    const {
      id,
      createdAt,
      updatedAt,
      facebook,
      twitter,
      instagram,
      linkedin,
      youtube,
      website,
      ...rest
    } = profile;
    return rest;
  }

  // service : done
  async getSettings() {
    try {
      const settings = await this.prismaService.nurserySettings.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      if (!settings) {
        return {
          success: false,
          status: 'error',
          message: 'No settings found',
          statusCode: 404,
        };
      }

      return {
        success: true,
        status: 'success',
        message: 'Settings retrieved successfully',
        settings: this.getFormattedSettings(settings),
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        message: 'Failed to retrieve settings',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      };
    }
  }

  // service : done
  async updateSettings(@Body() body: UpdateSettingsDto) {
    try {
      // delete existing settings
      await this.prismaService.nurserySettings.deleteMany({});

      let startTimes = this.getSlotsStartTimes(body);

      let time =
        this.timeToMinutes(startTimes[startTimes.length - 1]) +
        body.slotDuration +
        body.slotInterval +
        body.snackDuration;

      let closingTime = this.getFormattedStartTimes([time])[0];

      const newSettings = await this.prismaService.nurserySettings.create({
        data: { ...body, closingTime },
      });

      return {
        success: true,
        status: 'success',
        message: 'Settings updated successfully',
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        message: 'Failed to update settings',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      };
    }
  }

  // service : done
  async resetSettings() {
    try {
      // delete existing settings
      await this.prismaService.nurserySettings.deleteMany({});

      let startTimes = this.getSlotsStartTimes(this.defaultSettings);

      let time =
        this.timeToMinutes(startTimes[startTimes.length - 1]) +
        this.defaultSettings.slotDuration +
        this.defaultSettings.slotInterval +
        this.defaultSettings.snackDuration;

      let closingTime = this.getFormattedStartTimes([time])[0];

      // create default settings
      const createdSettings = await this.prismaService.nurserySettings.create({
        data: { ...this.defaultSettings, closingTime },
      });

      if (!createdSettings) {
        throw new Error('Failed to create default settings');
      }

      return {
        success: true,
        message: 'Settings reset to default successfully',
        settings: this.getFormattedSettings(createdSettings),
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to reset settings',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      };
    }
  }

  // service : done
  async getProfile() {
    try {
      const nurseryProfile = await this.prismaService.nurseryProfile.findFirst(
        {},
      );

      if (!nurseryProfile) {
        return {
          success: false,
          message: 'No profile found',
          statusCode: 404,
        };
      }

      const formattedProfile = this.getFormattedProfile(nurseryProfile);
      const socialLinks = {
        facebook: nurseryProfile.facebook || null,
        twitter: nurseryProfile.twitter || null,
        instagram: nurseryProfile.instagram || null,
        linkedin: nurseryProfile.linkedin || null,
        youtube: nurseryProfile.youtube || null,
        website: nurseryProfile.website || null,
        tiktok : nurseryProfile.tiktok || null,
      };

      return {
        success: true,
        message: 'Profile retrieved successfully',
        profile: {
          ...formattedProfile,
          socialLinks,
        },
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve profile',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      };
    }
  }

  // service : testing
  async updateProfile(@Body() body: any) {
    try {
      const existingProfile = await this.prismaService.nurseryProfile.findFirst(
        {},
      );

      if (!existingProfile) {
        return {
          success: false,
          message: 'No profile found to update',
          statusCode: 404,
        };
      }

      const updatedProfile = await this.prismaService.nurseryProfile.update({
        where: { id: existingProfile.id },
        data: {
          name: body.name || existingProfile.name,
          slogan: body.slogan || existingProfile.slogan,
          logo: body.logo || existingProfile.logo,
          phone: body.phone || existingProfile.phone,
          phone2: body.phone2 || existingProfile.phone2,
          email: body.email || existingProfile.email,
          facebook: body.socialLinks?.facebook || existingProfile.facebook,
          twitter: body.socialLinks?.twitter || existingProfile.twitter,
          instagram: body.socialLinks?.instagram || existingProfile.instagram,
          linkedin: body.socialLinks?.linkedin || existingProfile.linkedin,
          youtube: body.socialLinks?.youtube || existingProfile.youtube,
          website: body.socialLinks?.website || existingProfile.website,
        },
      });

      return {
        success: true,
        message: 'Profile updated successfully',
        profile: updatedProfile,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update profile',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      };
    }
  }
}
