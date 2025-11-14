import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  UserDtoCreate,
  UserDtoGet,
  UserDtoUpdate,
  UserDtoUpdateProfile,
  UserDtoUpdateStatus,
} from './dto/users-dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get() // GET users/ only admin can access this route
  getUsers(@Query() query: UserDtoGet) {
    return this.usersService.getUsers(query);
  }

  @Post() // POST users/ to create a new user
  createUser(@Body() body: UserDtoCreate) {
    return this.usersService.createUser(body);
  }

  @Get('/statistics') // GET users/statistics to get user statistics
  getUserStatistics(@Res() res: Response) {
    return this.usersService.getUserStatistics(res);
  }

  @Get('/search') // GET users/search?search_query= to search users by name or email
  searchUsers(
    @Query('search_query') search_query: string,
    @Query('only_admin') only_admin: string,
    @Query('user_id') user_id: number,
  ) {
    return this.usersService.searchUsers(
      search_query,
      only_admin === 'true',
      user_id,
    );
  }

  @Get(':id') // GET users/:id only admin  can access this route
  getUsersById(@Param('id') user_id: number) {
    return this.usersService.getUsersById(user_id);
  }

  @Patch(':id') // PATCH users/:id to update user details
  updateUser(
    @Param('id') user_id: number,
    @Body() body: UserDtoUpdate,
    @Res() res: Response,
  ) {
    return this.usersService.updateUser(Number(user_id), body, res);
  }

  @Patch('profile/:id') // PATCH users/profile/:id to update user profile
  updateUserProfile(
    @Param('id') user_id: number,
    @Body() body: UserDtoUpdateProfile,
    @Res() res: Response,
  ) {
    return this.usersService.updateUserProfile(Number(user_id), body, res);
  }

  @Patch(':id/password') // PATCH users/:id/password to update user password
  updateUserPassword(
    @Param('id') user_id: number,
    @Body() body: { admin_id: number; newPassword: string },
    @Res() res: Response,
  ) {
    return this.usersService.updateUserPassword(Number(user_id), body, res);
  }

  @Patch(':id/status') // PATCH users/:id/status to enable or disable an account
  updateUserStatus(
    @Param('id') user_id: number,
    @Body() body: UserDtoUpdateStatus,
  ) {
    return this.usersService.updateUserStatus(Number(user_id), body);
  }

  @Patch(':id/grade') // PATCH users/:id/grade to update user grade
  updateUserGrade(
    @Param('id') user_id: number,
    @Body() body: { admin_id: number; grade: string },
  ) {
    return this.usersService.updateUserGrade(Number(user_id), body);
  }
  
}
