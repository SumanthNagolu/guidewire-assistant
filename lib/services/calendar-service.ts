import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { loggers } from '@/lib/logger';
import { eventBus } from '@/lib/events/event-bus';
import { cache, cacheKeys } from '@/lib/redis';

// Calendar types
export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  attendees?: CalendarAttendee[];
  reminders?: CalendarReminder[];
  conferenceData?: ConferenceData;
  recurrence?: string[];
  status?: 'confirmed' | 'tentative' | 'cancelled';
}

export interface CalendarAttendee {
  email: string;
  displayName?: string;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  optional?: boolean;
}

export interface CalendarReminder {
  method: 'email' | 'popup' | 'sms';
  minutes: number;
}

export interface ConferenceData {
  type: 'zoom' | 'teams' | 'meet';
  url?: string;
  conferenceId?: string;
  password?: string;
}

export interface CalendarAvailability {
  date: Date;
  slots: TimeSlot[];
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

// Calendar Service
export class CalendarService {
  private static instance: CalendarService;
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;

  private constructor() {
    // Initialize OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Initialize calendar API
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  // Set user credentials
  async setUserCredentials(userId: string, tokens: any): Promise<void> {
    // Store tokens securely
    await cache.set(`calendar:tokens:${userId}`, tokens, 86400 * 30); // 30 days
    
    // Set credentials for this user's requests
    this.oauth2Client.setCredentials(tokens);
  }

  // Get user credentials
  private async getUserCredentials(userId: string): Promise<any> {
    const tokens = await cache.get(`calendar:tokens:${userId}`);
    if (!tokens) {
      throw new Error('User calendar not connected');
    }
    return tokens;
  }

  // Create calendar event
  async createEvent(userId: string, event: CalendarEvent): Promise<string> {
    try {
      // Get user credentials
      const tokens = await this.getUserCredentials(userId);
      this.oauth2Client.setCredentials(tokens);

      // Build Google Calendar event
      const calendarEvent: calendar_v3.Schema$Event = {
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: 'America/New_York',
        },
        attendees: event.attendees?.map(a => ({
          email: a.email,
          displayName: a.displayName,
          responseStatus: a.responseStatus || 'needsAction',
          optional: a.optional,
        })),
        reminders: event.reminders ? {
          useDefault: false,
          overrides: event.reminders.map(r => ({
            method: r.method,
            minutes: r.minutes,
          })),
        } : undefined,
        recurrence: event.recurrence,
        status: event.status || 'confirmed',
      };

      // Add conference data if needed
      if (event.conferenceData) {
        calendarEvent.conferenceData = await this.createConference(event.conferenceData);
      }

      // Create event
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: calendarEvent,
        sendNotifications: true,
        conferenceDataVersion: event.conferenceData ? 1 : 0,
      });

      // Log success
      loggers.system.info('Calendar event created', {
        userId,
        eventId: response.data.id,
        summary: event.summary,
      });

      // Emit event
      await eventBus.emit('calendar:event_created', {
        userId,
        eventId: response.data.id,
        event,
      });

      return response.data.id!;

    } catch (error) {
      loggers.system.error('Calendar event creation failed', error);
      throw error;
    }
  }

  // Update calendar event
  async updateEvent(
    userId: string,
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<void> {
    try {
      const tokens = await this.getUserCredentials(userId);
      this.oauth2Client.setCredentials(tokens);

      // Get existing event
      const existing = await this.calendar.events.get({
        calendarId: 'primary',
        eventId,
      });

      // Merge updates
      const updatedEvent: calendar_v3.Schema$Event = {
        ...existing.data,
        summary: updates.summary || existing.data.summary,
        description: updates.description || existing.data.description,
        location: updates.location || existing.data.location,
      };

      if (updates.start) {
        updatedEvent.start = {
          dateTime: updates.start.toISOString(),
          timeZone: 'America/New_York',
        };
      }

      if (updates.end) {
        updatedEvent.end = {
          dateTime: updates.end.toISOString(),
          timeZone: 'America/New_York',
        };
      }

      // Update event
      await this.calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: updatedEvent,
        sendNotifications: true,
      });

      // Emit event
      await eventBus.emit('calendar:event_updated', {
        userId,
        eventId,
        updates,
      });

    } catch (error) {
      loggers.system.error('Calendar event update failed', error);
      throw error;
    }
  }

  // Delete calendar event
  async deleteEvent(userId: string, eventId: string): Promise<void> {
    try {
      const tokens = await this.getUserCredentials(userId);
      this.oauth2Client.setCredentials(tokens);

      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendNotifications: true,
      });

      // Emit event
      await eventBus.emit('calendar:event_deleted', {
        userId,
        eventId,
      });

    } catch (error) {
      loggers.system.error('Calendar event deletion failed', error);
      throw error;
    }
  }

  // Get events
  async getEvents(
    userId: string,
    timeMin: Date,
    timeMax: Date
  ): Promise<CalendarEvent[]> {
    try {
      const tokens = await this.getUserCredentials(userId);
      this.oauth2Client.setCredentials(tokens);

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items?.map(this.mapGoogleEvent) || [];

    } catch (error) {
      loggers.system.error('Calendar events fetch failed', error);
      throw error;
    }
  }

  // Get availability
  async getAvailability(
    userId: string,
    startDate: Date,
    endDate: Date,
    duration: number = 60, // minutes
    workingHours: { start: number; end: number } = { start: 9, end: 17 }
  ): Promise<CalendarAvailability[]> {
    try {
      // Get existing events
      const events = await this.getEvents(userId, startDate, endDate);

      const availability: CalendarAvailability[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dayAvailability: CalendarAvailability = {
          date: new Date(currentDate),
          slots: [],
        };

        // Generate time slots for the day
        const dayStart = new Date(currentDate);
        dayStart.setHours(workingHours.start, 0, 0, 0);
        
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(workingHours.end, 0, 0, 0);

        const slotStart = new Date(dayStart);
        
        while (slotStart < dayEnd) {
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + duration);

          // Check if slot conflicts with any event
          const isAvailable = !events.some(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            return (slotStart < eventEnd && slotEnd > eventStart);
          });

          dayAvailability.slots.push({
            start: new Date(slotStart),
            end: new Date(slotEnd),
            available: isAvailable,
          });

          slotStart.setMinutes(slotStart.getMinutes() + duration);
        }

        availability.push(dayAvailability);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return availability;

    } catch (error) {
      loggers.system.error('Calendar availability fetch failed', error);
      throw error;
    }
  }

  // Schedule interview
  async scheduleInterview(
    recruiterId: string,
    candidateEmail: string,
    jobTitle: string,
    company: string,
    datetime: Date,
    duration: number = 60,
    interviewType: 'phone' | 'video' | 'onsite' = 'video'
  ): Promise<string> {
    let conferenceData: ConferenceData | undefined;

    // Create conference link for video interviews
    if (interviewType === 'video') {
      conferenceData = {
        type: 'meet',
      };
    }

    const event: CalendarEvent = {
      summary: `Interview - ${jobTitle} at ${company}`,
      description: `Interview for ${jobTitle} position at ${company}.\n\nCandidate: ${candidateEmail}`,
      start: datetime,
      end: new Date(datetime.getTime() + duration * 60000),
      attendees: [
        {
          email: candidateEmail,
          responseStatus: 'needsAction',
        },
      ],
      reminders: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 30 }, // 30 minutes before
      ],
      conferenceData,
    };

    const eventId = await this.createEvent(recruiterId, event);

    // Emit interview scheduled event
    await eventBus.emit('interview:scheduled', {
      recruiterId,
      candidateEmail,
      jobTitle,
      company,
      datetime,
      eventId,
    });

    return eventId;
  }

  // Find common availability
  async findCommonAvailability(
    userIds: string[],
    startDate: Date,
    endDate: Date,
    duration: number = 60
  ): Promise<TimeSlot[]> {
    // Get availability for all users
    const allAvailability = await Promise.all(
      userIds.map(userId => this.getAvailability(userId, startDate, endDate, duration))
    );

    const commonSlots: TimeSlot[] = [];

    // Find slots available for all users
    if (allAvailability.length === 0) return commonSlots;

    const firstUserAvailability = allAvailability[0];
    
    for (const dayAvail of firstUserAvailability) {
      for (const slot of dayAvail.slots) {
        if (!slot.available) continue;

        // Check if this slot is available for all other users
        const isCommon = allAvailability.slice(1).every(userAvail => {
          const dayData = userAvail.find(d => 
            d.date.toDateString() === dayAvail.date.toDateString()
          );
          
          if (!dayData) return false;
          
          return dayData.slots.some(s => 
            s.start.getTime() === slot.start.getTime() &&
            s.end.getTime() === slot.end.getTime() &&
            s.available
          );
        });

        if (isCommon) {
          commonSlots.push(slot);
        }
      }
    }

    return commonSlots;
  }

  // Create conference
  private async createConference(conf: ConferenceData): Promise<any> {
    switch (conf.type) {
      case 'meet':
        return {
          createRequest: {
            requestId: Math.random().toString(36).substring(7),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        };
      
      case 'zoom':
        // Would integrate with Zoom API
        return {
          entryPoints: [{
            entryPointType: 'video',
            uri: conf.url,
            password: conf.password,
          }],
        };
      
      default:
        return undefined;
    }
  }

  // Map Google event to our format
  private mapGoogleEvent(googleEvent: calendar_v3.Schema$Event): CalendarEvent {
    return {
      id: googleEvent.id!,
      summary: googleEvent.summary!,
      description: googleEvent.description,
      location: googleEvent.location,
      start: new Date(googleEvent.start?.dateTime || googleEvent.start?.date!),
      end: new Date(googleEvent.end?.dateTime || googleEvent.end?.date!),
      attendees: googleEvent.attendees?.map(a => ({
        email: a.email!,
        displayName: a.displayName,
        responseStatus: a.responseStatus as any,
        optional: a.optional,
      })),
      status: googleEvent.status as any,
    };
  }
}

// Export singleton
export const calendarService = CalendarService.getInstance();
