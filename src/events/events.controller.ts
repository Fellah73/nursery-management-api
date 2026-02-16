import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { EventsAuthGuard } from './guards/auth.guard';
import { EventsGuard } from './guards/event.guard';
import { ValidateEventMediaPipeCreation } from './pipe/validate-event-media';
import { ValidateEventMediaReorderPipe } from './pipe/validate-reorder-evetns-media';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // guards : done , service : done
  @Get()
  @UseGuards(EventsAuthGuard)
  getEvents(@Query('admin_id') admin_id: string, @Query() query: GetEventsDto) {
    return this.eventsService.getEvents(query);
  }

  // guards : done , service : done
  @Post()
  @UseGuards(EventsAuthGuard)
  createEvent(
    @Query('admin_id') admin_id: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventsService.createEvent(admin_id, createEventDto);
  }

  // guards : done , service : done
  @Get('period')
  @UseGuards(EventsAuthGuard)
  getEventsPeriod(
    @Query('admin_id') admin_id: string,
    @Query() query: EventDtoGet,
  ) {
    return this.eventsService.getEventsPeriod(query);
  }

  // guards : testing , service : testing
  @Get('monthly')
  @UseGuards(EventsAuthGuard)
  getMonthlyEvents(
    @Query('admin_id') admin_id: string,
    @Query() query: MonthlyEventDtoGet,
  ) {
    return this.eventsService.getMonthlyEvents(query);
  }

  // guards : done , service : done
  @Get('upcoming-birthdays')
  @UseGuards(EventsAuthGuard)
  getUpcomingBirthdays(
    @Query('admin_id') admin_id: string,
    @Query() query: EventSoonestBirthdaysDto,
  ) {
    return this.eventsService.getUpcomingBirthdays(query);
  }

  // guards : done , service : done
  @Get(':id')
  @UseGuards(EventsAuthGuard, EventsGuard)
  getEvent(@Query('admin_id') admin_id: string, @Param('id') id: string) {
    return this.eventsService.getEvent(id);
  }

  // guards : done , service : done
  @Patch(':id')
  @UseGuards(EventsAuthGuard, EventsGuard)
  updateEvent(
    @Query('admin_id') admin_id: string,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(id, updateEventDto);
  }

  // guards : done , service : done
  @Delete(':id')
  @UseGuards(EventsAuthGuard, EventsGuard)
  deleteEvent(@Query('admin_id') admin_id: string, @Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }

  // guards : done , pipe : service , service : done
  @Post(':id/media')
  @UseGuards(EventsAuthGuard, EventsGuard)
  createEventMedia(
    @Query('admin_id') admin_id: string,
    @Param('id') id: string,
    @Body(ValidateEventMediaPipeCreation)
    createEventMediaDto: HandleEventMediaDto,
  ) {
    return this.eventsService.createEventMedia(id, createEventMediaDto);
  }

  // guards : done , pipe : service , service : done
  @Put(':id/media')
  @UseGuards(EventsAuthGuard, EventsGuard)
  updateEventMedia(
    @Query('admin_id') admin_id: string,
    @Param('id') id: string,
    @Body(ValidateEventMediaPipeCreation)
    updateEventMediaDto: HandleEventMediaDto,
  ) {
    return this.eventsService.updateEventMedia(id, updateEventMediaDto);
  }

  // guards : done , pipe : done , service : done
  @Put(':id/media/reorder')
  @UseGuards(EventsAuthGuard, EventsGuard)
  reorderEventMedia(
    @Query('admin_id') admin_id: string,
    @Param('id') id: string,
    @Body(ValidateEventMediaReorderPipe)
    reorderEventMediaDto: ReorderEventMediaDto,
  ) {
    return this.eventsService.reorderEventMedia(id, reorderEventMediaDto);
  }

  // guards : done , service : done
  @Put('publish/:id')
  @UseGuards(EventsAuthGuard, EventsGuard)
  publishEvent(@Query('admin_id') admin_id: string, @Param('id') id: string) {
    return this.eventsService.publishEvent(id);
  }
}
