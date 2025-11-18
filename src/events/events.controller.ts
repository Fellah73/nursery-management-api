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
import { EventsService } from './events.service';
import { EventsAuthGuard } from './guards/auth.guard';
import {
  CreateEventDto,
  GetEventsDto,
  HandleEventMediaDto,
  UpdateEventDto,
} from './dto/events-dto';
import { EventsGuard } from './guards/event.guard';
import { ValidateEventMediaPipeCreation } from './pipe/validate-event-media';

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

  // guards : done , service : later
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

  // guards : done , service : done
  @Put('publish/:id')
  @UseGuards(EventsAuthGuard, EventsGuard)
  publishEvent(@Query('admin_id') admin_id: string, @Param('id') id: string) {
    return this.eventsService.publishEvent(id);
  }
}
