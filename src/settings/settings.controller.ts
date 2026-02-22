import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/guard/decorators/roles.decorator';
import { UserRole } from 'src/guard/enums/user-role.enum';
import { GlobalAuthGuard } from 'src/guard/guards/auth.guard';
import { UpdateProfileDto, UpdateSettingsDto } from './dto/settings-dto';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(GlobalAuthGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // guards : done , service : done
  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  // guards : done , service : done
  @Post()
  updateSettings(@Body() body: UpdateSettingsDto) {
    return this.settingsService.updateSettings(body);
  }

  // guards : done , service : done
  @Get('profile')
  getProfile() {
    return this.settingsService.getProfile();
  }

  // guards : testing , service : testing
  @Post('profile')
  updateProfile(@Body() body: UpdateProfileDto) {
    return this.settingsService.updateProfile(body);
  }

  // guards : done , service : done
  @Post('reset')
  resetSettings() {
    return this.settingsService.resetSettings();
  }
}
