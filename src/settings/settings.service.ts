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

  private getFormattedSettings(settings: any) {
    const { id, createdAt, updatedAt, ...rest } = settings;
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
        error: error.message,
        statusCode: 500,
      };
    }
  }

  // service : done
  async updateSettings(@Body() body: UpdateSettingsDto) {
    try {
      // delete existing settings
      await this.prismaService.nurserySettings.deleteMany({});

      const newSettings = await this.prismaService.nurserySettings.create({
        data: { ...body },
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
        error: error.message,
        statusCode: 500,
      };
    }
  }

  // service : done
  async resetSettings() {
    try {
      // delete existing settings
      await this.prismaService.nurserySettings.deleteMany({});

      // create default settings
      const createdSettings = await this.prismaService.nurserySettings.create({
        data: this.defaultSettings,
      });

      if (!createdSettings) {
        throw new Error('Failed to create default settings');
      }

      return {
        status: 'success',
        message: 'Settings reset to default successfully',
        setting: this.getFormattedSettings(createdSettings),
        statusCode: 200,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to reset settings',
        error: error.message,
        statusCode: 500,
      };
    }
  }
}
