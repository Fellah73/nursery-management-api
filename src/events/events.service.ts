import { Body, Injectable, Param, Query } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateEventDto,
  GetEventsDto,
  HandleEventMediaDto,
  UpdateEventDto,
} from './dto/events-dto';

@Injectable()
export class EventsService {
  constructor(private readonly prismaService: PrismaService) {}

  private formatResponse(event: any) {
    const { createdAt, updatedAt, createdBy, ...formatedEvent } = event;
    return formatedEvent;
  }

  // service : done
  async getEvents(@Query() query: GetEventsDto) {
    try {
      const { eventType, isPublished } = query;

      const filters: any = {};

      if (eventType) {
        filters.eventType = eventType;
      }

      if (isPublished !== undefined) {
        filters.isPublished = Boolean(isPublished);
      }

      const events = await this.prismaService.event.findMany({
        where: filters,
        select: {
          title: true,
          description: true,
          eventType: true,
          eventDate: true,
          isPublished: true,
          child: {
            select: {
              id: true,
              full_name: true,
              gender: true,
              birth_date: true,
            },
          },
          images: {
            select: {
              mediaUrl: true,
              displayOrder: true,
            },
          },
        },
      });

      if (!events || events.length === 0) {
        return {
          success: false,
          statusCode: 404,
          message: 'No events found',
        };
      }

      // order the events images by their displayOrder
      events.forEach((event) => {
        event.images.sort((a, b) => a.displayOrder - b.displayOrder);
      });

      let organizedEvents;

      // if isPublished is not applied filter is applied, organize events into Published and Unpublished
      if (isPublished == undefined) {
        organizedEvents = new Set<string | any>();
        events.forEach((event) => {
          const isPublishedKey = event.isPublished
            ? 'Published'
            : 'Unpublished';
          if (!organizedEvents[isPublishedKey]) {
            organizedEvents[isPublishedKey] = [];
          }
          organizedEvents[isPublishedKey].push(event);
        });
        // return the targeted events
      } else {
        organizedEvents = events;
      }

      return {
        success: true,
        statusCode: 200,
        events: organizedEvents,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error',
      };
    }
  }

  // service : done
  async createEvent(
    @Query('admin_id') admin_id: string,
    @Body() body: CreateEventDto,
  ) {
    try {
      // in birthday events, childId is required
      if (body.eventType === 'BIRTHDAY' && !body.childId) {
        return {
          success: false,
          statusCode: 400,
          message: 'childId is required for BIRTHDAY eventType',
        };
      }

      if (body.childId) {
        // child can be provided only if eventType is BIRTHDAY
        if (body.eventType !== 'BIRTHDAY') {
          return {
            success: false,
            statusCode: 400,
            message: 'childId can only be provided for BIRTHDAY eventType',
          };
        }

        const child = await this.prismaService.children.findUnique({
          where: { id: Number(body.childId) },
        });

        if (!child) {
          return {
            success: false,
            statusCode: 404,
            message: 'Child not found',
          };
        }

        // transform eventDate to match child's birth_date
        body.eventDate =
          body.eventDate.split('-')[0] +
          '-' +
          child.birth_date.split('T')[0].split('-')[1] +
          '-' +
          child.birth_date.split('T')[0].split('-')[2];
      }

      const newEvent = await this.prismaService.event.create({
        data: {
          title: body.title,
          description: body.description,
          eventType: body.eventType,
          eventDate: new Date(body.eventDate + 'T00:00:00.000Z'),
          location: body.location,
          childId: Number(body.childId) || null,
          isPublished: true,
          createdBy: Number(admin_id),
        },
      });

      if (!newEvent) {
        return {
          success: false,
          statusCode: 500,
          message: 'Failed to create event',
        };
      }

      let formatedEvent = this.formatResponse(newEvent);

      return {
        success: true,
        statusCode: 201,
        message: 'Event created successfully',
        event: formatedEvent,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error',
      };
    }
  }

  // service : done
  async getEvent(@Param('id') id: string) {
    try {
      const event = await this.prismaService.event.findUnique({
        where: { id: Number(id) },
        select: {
          title: true,
          description: true,
          eventType: true,
          eventDate: true,
          isPublished: true,
          child: {
            select: {
              id: true,
              full_name: true,
              gender: true,
              profile_picture: true,
              birth_date: true,
            },
          },
          images: {
            select: {
              mediaUrl: true,
              displayOrder: true,
            },
          },
        },
      });

      if (!event) {
        return {
          success: false,
          statusCode: 404,
          message: 'Event not found',
        };
      }

      event.images.sort((a, b) => a.displayOrder - b.displayOrder);

      const formatedEvent = this.formatResponse(event);

      return {
        success: true,
        statusCode: 200,
        message: 'Event retrieved successfully',
        event: formatedEvent,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error',
      };
    }
  }

  // service : done
  async updateEvent(@Param('id') id: string, @Body() body: UpdateEventDto) {
    try {
      const existingEvent = await this.prismaService.event.findUnique({
        where: { id: Number(id) },
      });

      const updatedEvent = await this.prismaService.event.update({
        where: { id: Number(id) },
        data: {
          title: body.title || existingEvent!.title,
          description: body.description || existingEvent!.description,
          eventType: (body.eventType as any) || existingEvent!.eventType,
          eventDate:
            new Date(body.eventDate + 'T00:00:00.000Z') ||
            existingEvent!.eventDate,
          location: body.location || existingEvent!.location,
        },
      });

      if (!updatedEvent) {
        return {
          success: false,
          statusCode: 404,
          message: 'Event not found',
        };
      }

      const formatedEvent = this.formatResponse(updatedEvent);

      return {
        success: true,
        statusCode: 200,
        message: 'Event updated successfully',
        event: formatedEvent,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error',
      };
    }
  }

  // service : done
  async deleteEvent(@Param('id') id: string) {
    try {
      // First, delete associated media records
      await this.prismaService.eventMedia.deleteMany({
        where: { eventId: Number(id) },
      });

      // Then, delete the event itself
      await this.prismaService.event.delete({
        where: { id: Number(id) },
      });

      return {
        success: true,
        statusCode: 200,
        message: 'Event deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error',
      };
    }
  }

  // service : done
  async publishEvent(@Param('id') id: string) {
    try {
      const currentEvent = await this.prismaService.event.findUnique({
        where: { id: Number(id) },
        select: { isPublished: true },
      });

      const updatedEvent = await this.prismaService.event.update({
        where: { id: Number(id) },
        data: {
          isPublished: !currentEvent!.isPublished,
        },
      });

      if (!updatedEvent) {
        return {
          success: false,
          statusCode: 404,
          message: 'Event not found',
        };
      }

      return {
        success: true,
        statusCode: 200,
        message: `Event ${updatedEvent.isPublished ? 'published' : 'unpublished'} successfully`,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error',
      };
    }
  }

  // service : done
  async createEventMedia(
    @Param('id') id: string,
    @Body() body: HandleEventMediaDto,
  ) {
    try {
      if (!body.media || body.media.length === 0) {
        return {
          success: false,
          statusCode: 400,
          message: 'mediaUrl array cannot be empty',
        };
      }

      const createdEventMedia = await this.prismaService.eventMedia.createMany({
        data: body.media.map((mediaUrl, index) => ({
          eventId: Number(id),
          mediaUrl,
          displayOrder: index + 1,
        })),
      });

      return {
        success: true,
        statusCode: 200,
        message: `${createdEventMedia.count} media items added to event successfully`,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: 'Internal server error',
      };
    }
  }
}
