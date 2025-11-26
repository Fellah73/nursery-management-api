import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsAuthGuard } from './guard/auth.guard';
import { UpdateSettingsDto } from './dto/settings-dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // guards : done , service : done
  @Get()
  @UseGuards(SettingsAuthGuard)
  getSettings(@Query('admin_id') admin_id: number) {
    return this.settingsService.getSettings();
  }

  // guards : done , service : done
  @Post()
  @UseGuards(SettingsAuthGuard)
  updateSettings(
    @Query('admin_id') admin_id: number,
    @Body() body: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(body);
  }

  // guards : done , service : testing
  @Post('reset')
  @UseGuards(SettingsAuthGuard)
  resetSettings(@Query('admin_id') admin_id: number) {
    return this.settingsService.resetSettings();
  }
}
