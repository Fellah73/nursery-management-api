import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  UserDtoCreate,
  UserDtoGet,
  UserDtoUpdate,
  UserDtoUpdateProfile,
  UserDtoUpdateStatus,
  UserGradeUpdateDto,
} from './dto/users-dto';
import { UserAuthGuard } from './guards/auth/auth.guards';
import { UserGuard } from './guards/user/user.gurads';
import {
  ValidateUserCreationPipe,
  ValidateUserUpdatePipe,
} from './pipe/validate.user';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // guards : done , service : done
  @Get()
  @UseGuards(UserAuthGuard)
  getUsers(@Query() query: UserDtoGet) {
    return this.usersService.getUsers(query);
  }

  // guards : done , pipe : done , service : done
  @Post()
  @UseGuards(UserAuthGuard)
  createUser(
    @Query('admin_id') admin_id: number,
    @Body(ValidateUserCreationPipe) body: UserDtoCreate,
  ) {
    return this.usersService.createUser(admin_id, body);
  }

  // guards : done , service : done
  @Get('/statistics')
  @UseGuards(UserAuthGuard)
  getUserStatistics(@Query() admin_id: number) {
    return this.usersService.getUserStatistics();
  }

  // guards : done , service : done
  @Get('/search')
  @UseGuards(UserAuthGuard)
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
  @UseGuards(UserAuthGuard, UserGuard)
  getUsersById(@Query('admin_id') admin_id: number, @Param('id') id: number) {
    return this.usersService.getUsersById(id);
  }

  // guards : done , pipe : done , service : done
  @Patch(':id')
  @UseGuards(UserAuthGuard, UserGuard)
  updateUser(
    @Query('admin_id') admin_id: number,
    @Param('id') id: number,
    @Body(ValidateUserUpdatePipe) body: UserDtoUpdate,
  ) {
    return this.usersService.updateUser(Number(id), body);
  }

  // guards : done , pipe : done , service : done
  @Patch('profile/:id')
  @UseGuards(UserGuard)
  updateUserProfile(
    @Query('admin_id') admin_id: number,
    @Param('id') user_id: number,
    @Body(ValidateUserUpdatePipe) body: UserDtoUpdateProfile,
  ) {
    return this.usersService.updateUserProfile(Number(user_id), body);
  }

  // guards : done , service : done
  @Patch(':id/password')
  @UseGuards(UserAuthGuard, UserGuard)
  updateUserPassword(
    @Query('admin_id') admin_id: number,
    @Param('id') user_id: number,
    @Body() body: { newPassword: UserDtoCreate['password'] },
  ) {
    return this.usersService.updateUserPassword(Number(user_id), body);
  }

  // guards : done , service : done
  @Patch(':id/status')
  @UseGuards(UserAuthGuard, UserGuard)
  updateUserStatus(
    @Query('admin_id') admin_id: number,
    @Param('id') id: number,
    @Body() body: UserDtoUpdateStatus,
  ) {
    return this.usersService.updateUserStatus(Number(id), body);
  }

  // guards : done , service : done
  @Patch(':id/grade')
  @UseGuards(UserAuthGuard, UserGuard)
  updateUserGrade(
    @Query('admin_id') admin_id: number,
    @Param('id') id: number,
    @Body() body: UserGradeUpdateDto,
  ) {
    return this.usersService.updateUserGrade(Number(id), body);
  }
}
