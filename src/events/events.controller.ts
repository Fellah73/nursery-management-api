import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/guard/decorators/roles.decorator';
import { UserRole } from 'src/guard/enums/user-role.enum';
import { GlobalAuthGuard } from 'src/guard/guards/auth.guard';
import {
  CreateEventDto,
  EventDtoGet,
  EventSoonestBirthdaysDto,
  GetEventsDto,
  HandleEventMediaDto,
  MonthlyEventDtoGet,
  ReorderEventMediaDto,
  UpdateEventDto,
} from './dto/events-dto';
import { EventsService } from './events.service';
import { EventsGuard } from './guards/event.guard';
import { ValidateEventMediaPipeCreation } from './pipe/validate-event-media';
import { ValidateEventMediaReorderPipe } from './pipe/validate-reorder-evetns-media';

@Controller('events')
@UseGuards(GlobalAuthGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // guards : done , service : done
  @Get()
  getEvents(@Query() query: GetEventsDto) {
    return this.eventsService.getEvents(query);
  }

  // guards : done , service : done
  @Post()
  createEvent(
    @Query('admin_id') admin_id: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventsService.createEvent(admin_id, createEventDto);
  }

  // guards : done , service : done
  @Get('period')
  getEventsPeriod(@Query() query: EventDtoGet) {
    return this.eventsService.getEventsPeriod(query);
  }

  // guards : done , service : done
  @Get('monthly')
  getMonthlyEvents(@Query() query: MonthlyEventDtoGet) {
    return this.eventsService.getMonthlyEvents(query);
  }

  // guards : done , service : done
  @Get('upcoming-birthdays')
  getUpcomingBirthdays(@Query() query: EventSoonestBirthdaysDto) {
    return this.eventsService.getUpcomingBirthdays(query);
  }

  // guards : done , service : done
  @Get(':id')
  @UseGuards(EventsGuard)
  getEvent(@Param('id') id: string) {
    return this.eventsService.getEvent(id);
  }

  // guards : done , service : done
  @Put(':id')
  @UseGuards(EventsGuard)
  updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.updateEvent(id, updateEventDto);
  }

  // guards : done , service : done
  @Delete(':id')
  @UseGuards(EventsGuard)
  deleteEvent(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }

  // guards : done , pipe : service , service : done
  @Post(':id/media')
  @UseGuards(EventsGuard)
  createEventMedia(
    @Param('id') id: string,
    @Body(ValidateEventMediaPipeCreation)
    createEventMediaDto: HandleEventMediaDto,
  ) {
    return this.eventsService.createEventMedia(id, createEventMediaDto);
  }

  // guards : done , pipe : service , service : done
  @Put(':id/media')
  @UseGuards(EventsGuard)
  updateEventMedia(
    @Param('id') id: string,
    @Body(ValidateEventMediaPipeCreation)
    updateEventMediaDto: HandleEventMediaDto,
  ) {
    return this.eventsService.updateEventMedia(id, updateEventMediaDto);
  }

  // guards : done , pipe : done , service : done
  @Put(':id/media/reorder')
  @UseGuards(EventsGuard)
  reorderEventMedia(
    @Param('id') id: string,
    @Body(ValidateEventMediaReorderPipe)
    reorderEventMediaDto: ReorderEventMediaDto,
  ) {
    return this.eventsService.reorderEventMedia(id, reorderEventMediaDto);
  }

  // guards : done , service : done
  @Put('publish/:id')
  @UseGuards(EventsGuard)
  publishEvent(@Param('id') id: string) {
    return this.eventsService.publishEvent(id);
  }
}
