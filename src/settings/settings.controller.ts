import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UpdateProfileDto, UpdateSettingsDto } from './dto/settings-dto';
import { SettingsAuthGuard } from './guard/auth.guard';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // guards : done , service : done
  @Get()
  @UseGuards(SettingsAuthGuard)
  getSettings() {
    return this.settingsService.getSettings();
  }

  // guards : done , service : done
  @Post()
  @UseGuards(SettingsAuthGuard)
  updateSettings(@Body() body: UpdateSettingsDto) {
    return this.settingsService.updateSettings(body);
  }

  // guards : done , service : done
  @Get('profile')
  @UseGuards(SettingsAuthGuard)
  getProfile() {
    return this.settingsService.getProfile();
  }

  // guards : testing , service : testing
  @Post('profile')
  @UseGuards(SettingsAuthGuard)
  updateProfile(@Body() body: UpdateProfileDto) {
    return this.settingsService.updateProfile(body);
  }

  // guards : done , service : done
  @Post('reset')
  @UseGuards(SettingsAuthGuard)
  resetSettings() {
    return this.settingsService.resetSettings();
  }
}
