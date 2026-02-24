import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/guard/decorators/roles.decorator';
import { UserRole } from 'src/guard/enums/user-role.enum';
import { GlobalAuthGuard } from 'src/guard/guards/auth.guard';
import {
  UserDtoCreate,
  UserDtoGet,
  UserDtoUpdate,
  UserDtoUpdateProfile,
  UserDtoUpdateStatus,
  UserGradeUpdateDto,
} from './dto/users-dto';
import { UserGuard } from './guards/user.gurads';
import {
  ValidateUserCreationPipe,
  ValidateUserUpdatePipe,
} from './pipe/validate.user';
import { UsersService } from './users.service';
import { Public } from 'src/guard/decorators/public.decorator';

@Controller('users')
@UseGuards(GlobalAuthGuard)
@Roles(UserRole.SUPER_ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // guards : done , service : done
  @Get()
  getUsers(@Query() query: UserDtoGet) {
    return this.usersService.getUsers(query);
  }

  // guards : done , pipe : done , service : done
  @Post()
  createUser(
    @Query('admin_id') admin_id: number,
    @Body(ValidateUserCreationPipe) body: UserDtoCreate,
  ) {
    return this.usersService.createUser(admin_id, body);
  }

  // guards : done , service : done
  @Get('/statistics')
  @Roles(UserRole.ADMIN)
  getUserStatistics() {
    return this.usersService.getUserStatistics();
  }

  // guards : done , service : done
  @Get('/search')
  searchUsers(
    @Query('search_query') search_query: string,
    @Query('only_admin') only_admin: 'true' | 'false',
    @Query('admin_id') admin_id: number,
  ) {
    return this.usersService.searchUsers(
      search_query,
      only_admin === 'true',
      admin_id,
    );
  }

  // guards : done , service : done
  @Get(':id')
  @UseGuards(UserGuard)
  getUsersById(@Param('id') id: number) {
    return this.usersService.getUsersById(id);
  }

  // guards : done , pipe : done , service : done
  @Patch(':id')
  @UseGuards(UserGuard)
  updateUser(
    @Param('id') id: number,
    @Body(ValidateUserUpdatePipe) body: UserDtoUpdate,
  ) {
    return this.usersService.updateUser(Number(id), body);
  }

  // guards : done , pipe : done , service : done
  @Patch('profile/:id')
  @Public()
  @UseGuards(UserGuard)
  updateUserProfile(
    @Param('id') user_id: number,
    @Body(ValidateUserUpdatePipe) body: UserDtoUpdateProfile,
  ) {
    return this.usersService.updateUserProfile(Number(user_id), body);
  }

  // guards : done , service : done
  @Patch(':id/password')
  @UseGuards(UserGuard)
  updateUserPassword(
    @Param('id') user_id: number,
    @Body() body: { newPassword: UserDtoCreate['password'] },
  ) {
    return this.usersService.updateUserPassword(Number(user_id), body);
  }

  // guards : done , service : done
  @Patch(':id/status')
  @UseGuards(UserGuard)
  updateUserStatus(@Param('id') id: number, @Body() body: UserDtoUpdateStatus) {
    return this.usersService.updateUserStatus(Number(id), body);
  }

  // guards : done , service : done
  @Patch(':id/grade')
  @UseGuards(UserGuard)
  updateUserGrade(@Param('id') id: number, @Body() body: UserGradeUpdateDto) {
    return this.usersService.updateUserGrade(Number(id), body);
  }
}
