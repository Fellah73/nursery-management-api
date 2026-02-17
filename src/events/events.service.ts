import { Body, Injectable, Param, Query } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
  async getEventsPeriod(@Query() query: EventDtoGet) {
    try {
      const perPage = query.perPage ? Number(query.perPage) : 10;
      const page = query.page && query.page > 0 ? Number(query.page) : 1;

      const skip = (page - 1) * perPage;

      let eventsPeriods;

      eventsPeriods = await this.prismaService.event.findMany({
        take: perPage && perPage !== 0 ? perPage : undefined,
        skip: perPage !== 0 ? skip : undefined, // Only skip if we're using pagination
        select: {
          id: true,
          title: true,
          description: true,
          eventDate: true,
          eventType: true,
          location: true,
          isPublished: true,
          child: {
            select: {
              id: true,
              full_name: true,
              gender: true,
              profile_picture: true,
            },
          },
        },
        orderBy: {
          eventDate: 'desc',
        },
      });

      // Bithday case
      const childClassroomMap = new Map<number, string | null>();

      eventsPeriods.forEach((event) => {
        if (event.child && event.child.id) {
          childClassroomMap.set(event.child.id, null);
        }
      });

      for (const event of eventsPeriods) {
        if (event.eventType === 'BIRTHDAY' && event.child && event.child.id) {
          try {
            const childWithClassroom =
              await this.prismaService.assignment.findFirst({
                where: { childId: event.child.id },
                include: {
                  classroom: {
                    select: {
                      category: true,
                    },
                  },
                },
              });

            if (childWithClassroom) {
              childClassroomMap.set(
                event.child.id,
                childWithClassroom.classroom.category,
              );
            }
          } catch (error) {
            console.error(
              `Error fetching classroom for child ${event.child.id}:`,
              error,
            );
          }
        }
      }

      const eventsWithCategories = eventsPeriods.map((event) => ({
        ...event,
        category:
          event.child && event.child.id
            ? childClassroomMap.get(event.child.id) || null
            : null,
      }));

      const totalEvents = await this.prismaService.event.findMany();

      return {
        message: 'Events retrieved successfully',
        events: eventsWithCategories,
        pagination: {
          page: page,
          perPage: perPage || 'All',
          pages: perPage ? Math.ceil(totalEvents.length / perPage) : 1,
        },
        metaData: {
          total: totalEvents.length,
          stats: {
            total: totalEvents.length,
            excursions: totalEvents.filter(
              (event) => event.eventType === 'FIELD_TRIP',
            ).length,
            special_days: totalEvents.filter(
              (event) => event.eventType === 'CELEBRATION',
            ).length,
            spectacles: totalEvents.filter(
              (event) => event.eventType === 'PERFORMANCE',
            ).length,
            anniversaires: totalEvents.filter(
              (event) => event.eventType === 'BIRTHDAY',
            ).length,
          },
        },
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while retrieving schedule periods',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        statusCode: 500,
        success: false,
      };
    }
  }

  // service : done
  async getMonthlyEvents(@Query() query: MonthlyEventDtoGet) {
    try {
      const month = query.month || new Date().getMonth() + 1;
      const year = query.year || new Date().getFullYear();

      const events = await this.prismaService.event.findMany({
        where: {
          eventDate: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          eventType: true,
          eventDate: true,
          isPublished: true,
          location: true,
          child: {
            select: {
              id: true,
              full_name: true,
              gender: true,
              profile_picture: true,
              birth_date: true,
            },
          },
        },
      });

      if (!events || events.length === 0) {
        return {
          success: true,
          statusCode: 404,
          message: 'No events found for the specified month and year',
        };
      }

      return {
        success: true,
        statusCode: 200,
        message: 'Monthly events retrieved successfully',
        events,
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
  async getUpcomingBirthdays(query: EventSoonestBirthdaysDto) {
    try {
      const today = new Date();
      const dateRange = new Date();
      dateRange.setDate(
        today.getDate() + Number(query.range ? query.range * 30 : 30),
      );

      const currentYear = today.getFullYear();

      const upcomingBirthdays = await this.prismaService.children.findMany({
        select: {
          id: true,
          full_name: true,
          birth_date: true,
          profile_picture: true,
          gender: true,
        },
        orderBy: {
          birth_date: 'asc',
        },
      });

      const filteredBirthdays = upcomingBirthdays.filter((child) => {
        const birthDate = new Date(child.birth_date);

        const thisYearBirthday = new Date(
          currentYear,
          birthDate.getMonth(),
          birthDate.getDate(),
        );

        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(currentYear + 1);
        }
        const isUpcoming =
          thisYearBirthday >= today && thisYearBirthday <= dateRange;

        return isUpcoming;
      });

      const limitedBirthdays = filteredBirthdays.slice(
        0,
        query.limit ? Number(query.limit) : 10,
      );

      const childClassroomMap = new Map<number, string | null>();
      for (const child of limitedBirthdays) {
        try {
          const childWithClassroom =
            await this.prismaService.assignment.findFirst({
              where: { childId: child.id },
              include: {
                classroom: {
                  select: {
                    category: true,
                  },
                },
              },
            });

          if (childWithClassroom) {
            childClassroomMap.set(
              child.id,
              childWithClassroom.classroom.category,
            );
          }
        } catch (error) {
          console.error(
            `Error fetching classroom for child ${child.id}:`,
            error,
          );
        }
      }

      return {
        success: true,
        statusCode: 200,
        message: 'Upcoming birthdays retrieved successfully',
        birthdays: limitedBirthdays.map((child) => ({
          ...child,
          category: childClassroomMap.get(child.id) || null,
        })),
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
          id: true,
          title: true,
          description: true,
          eventType: true,
          eventDate: true,
          location: true,
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

      const availableEventMedia = await this.prismaService.eventMedia.findMany({
        where: { eventId: Number(id) },
      });

      // check if new media exists in available media
      for (const newMediaUrl of body.media) {
        const duplicateMedia = availableEventMedia.find(
          (media) => media.mediaUrl === newMediaUrl,
        );

        // if duplicate media, don't add it
        if (duplicateMedia) {
          body.media = body.media.filter((url) => url !== newMediaUrl);
        }
      }

      const createdEventMedia = await this.prismaService.eventMedia.createMany({
        data: body.media.map((mediaUrl, index) => ({
          eventId: Number(id),
          mediaUrl,
          displayOrder: index + 1,
        })),
      });

      if (!createdEventMedia) {
        return {
          success: false,
          statusCode: 500,
          message: 'Failed to add media to event',
        };
      }

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

  // service : done
  async updateEventMedia(
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
      {
        /*
      let availableEventMedia = await this.prismaService.eventMedia.findMany({
        where: { eventId: Number(id) },
        select: {
          mediaUrl: true,
          displayOrder: true,
        },
        orderBy: { displayOrder: 'asc' },
      });

      let lastDisplayOrderIndex =
        availableEventMedia[availableEventMedia.length - 1]?.displayOrder || 0;

      // Reorder display orders for existing media to avoid gaps
      if (lastDisplayOrderIndex !== availableEventMedia.length) {
        availableEventMedia = availableEventMedia.map((media, index) => ({
          mediaUrl: media.mediaUrl,
          displayOrder: index + 1,
        }));

        lastDisplayOrderIndex = availableEventMedia.length;
      }

      let updatedEventMedia = 0;

      for (const newMediaUrl of body.media) {
        const duplicateMedia = availableEventMedia.find(
          (media) => media.mediaUrl === newMediaUrl,
        );

        // if it's not duplicate media, add it else skip it
        if (!duplicateMedia) {
          availableEventMedia.push({
            mediaUrl: newMediaUrl,
            displayOrder: lastDisplayOrderIndex + 1,
          });

          lastDisplayOrderIndex++;
          updatedEventMedia++;
        }
      }*/
      }

      // Delete all existing media for the event
      await this.prismaService.eventMedia.deleteMany({
        where: { eventId: Number(id) },
      });

      // Create new media records
      const createdEventMedia = await this.prismaService.eventMedia.createMany({
        data: body.media.map((media, index) => ({
          eventId: Number(id),
          mediaUrl: media,
          displayOrder: 1 + index,
        })),
      });

      if (!createdEventMedia) {
        return {
          success: false,
          statusCode: 500,
          message: 'Failed to add media to event',
        };
      }

      return {
        success: true,
        statusCode: 200,
        message: `${createdEventMedia.count} updated media items added to event successfully`,
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
  async reorderEventMedia(
    @Param('id') id: string,
    @Body() body: ReorderEventMediaDto,
  ) {
    try {
      const eventMediaList = await this.prismaService.eventMedia.findMany({
        where: { eventId: Number(id) },
        select: {
          mediaUrl: true,
        },
        orderBy: { displayOrder: 'asc' },
      });

      if (body.reorderIndexes.length !== eventMediaList.length) {
        return {
          success: false,
          statusCode: 400,
          message: 'Reorder array length does not match event media count',
        };
      }

      // iterate through the reorderIndexes and update displayOrder in db accordingly to new index value
      // (use the imageUrl in where clause to identify the record)
      body.reorderIndexes.forEach(async (displayOrder, newIndex) => {
        await this.prismaService.eventMedia.updateMany({
          where: {
            eventId: Number(id),
            mediaUrl: eventMediaList[newIndex]?.mediaUrl,
          },
          data: {
            displayOrder: body.reorderIndexes[newIndex],
          },
        });
      });

      return {
        success: true,
        statusCode: 200,
        message: 'Event media reordered successfully',
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
