import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  UserDtoCreate,
  UserDtoGet,
  UserDtoUpdate,
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
  @Get('/search') // GET users/search?search_query= to search users by name or email
  searchUsers(@Query('search_query') search_query: string) { 
    return this.usersService.searchUsers(search_query);
  }

  @Get(':id') // GET users/:id only admin  can access this route 
  getUsersById(@Param('id') user_id: number) {
    return this.usersService.getUsersById(user_id);
  }

  @Patch(':id') // PATCH users/:id to update user details
  updateUser(@Param('id') user_id: number, @Body() body: UserDtoUpdate) { 
    return this.usersService.updateUser(user_id, body);
  }

  @Patch(':id/status') // PATCH users/:id/status to enable or disable an account
  updateUserStatus(
    @Param('id') user_id: number, 
    @Body() body: UserDtoUpdateStatus,
  ) {
    return this.usersService.updateUserStatus(Number(user_id), body);
  }
}
