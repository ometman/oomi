import type { EventCategory, EventFormat, EventLocation, MinistryEvent } from '../data/events';

export interface EventFilters {
  location?: EventLocation;
  format?: EventFormat;
  category?: EventCategory;
  month?: string;
}

const parseDateParts = (date: string, time = '00:00') => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error('Event date or time is invalid.');
  }
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute));
};

export const eventStart = (event: MinistryEvent) => parseDateParts(event.date, event.startTime);
export const eventEnd = (event: MinistryEvent) =>
  parseDateParts(event.endDate ?? event.date, event.endTime ?? event.startTime);

export function formatEventDate(event: MinistryEvent) {
  const formatter = new Intl.DateTimeFormat('en-GH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Accra',
  });
  const start = eventStart(event);
  const end = eventEnd(event);
  if (event.endDate && event.endDate !== event.date) {
    return `${formatter.format(start)} – ${formatter.format(end)}`;
  }
  return formatter.format(start);
}

export function formatEventTime(event: MinistryEvent) {
  const formatter = new Intl.DateTimeFormat('en-GH', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Accra',
  });
  const start = formatter.format(eventStart(event));
  return event.endTime ? `${start} – ${formatter.format(eventEnd(event))}` : start;
}

export function getEventCountdown(event: MinistryEvent, now = new Date()) {
  const eventDay = Date.UTC(...event.date.split('-').map(Number).map((value, index) => index === 1 ? value - 1 : value) as [number, number, number]);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.ceil((eventDay - today) / 86_400_000);
  if (days < 0) return null;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export function getFeaturedEvent(events: MinistryEvent[], now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return events
    .filter((event) => event.featured && event.approved && !event.draft && event.date >= today && !['COMPLETED', 'CANCELLED'].includes(event.status))
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))[0];
}

export function filterEvents(events: MinistryEvent[], filters: EventFilters) {
  return events.filter((event) =>
    (!filters.location || event.location === filters.location) &&
    (!filters.format || event.format === filters.format) &&
    (!filters.category || event.category === filters.category) &&
    (!filters.month || event.date.startsWith(filters.month))
  );
}

export const eventLabel = (value: string) =>
  value.replaceAll('_', ' ').toLowerCase().replace(/(^|\s)\w/g, (letter) => letter.toUpperCase());

const compactUtc = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const escapeIcs = (value: string) => value.replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll(',', '\\,').replaceAll(';', '\\;');

export function createGoogleCalendarUrl(event: MinistryEvent, origin = 'https://ometomeni.org') {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${compactUtc(eventStart(event))}/${compactUtc(eventEnd(event))}`,
    details: `${event.description}\n\n${origin}/events/${event.slug}`,
    location: event.locationName ?? event.locationArea ?? eventLabel(event.location),
    ctz: event.timezone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function createICalendarContent(event: MinistryEvent, origin = 'https://ometomeni.org') {
  const location = event.locationName ?? event.locationArea ?? eventLabel(event.location);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Omet Omeni Ministries//Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${escapeIcs(event.slug)}@ometomeni.org`,
    `DTSTAMP:${compactUtc(new Date())}`,
    `DTSTART:${compactUtc(eventStart(event))}`,
    `DTEND:${compactUtc(eventEnd(event))}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(`${event.description}\n${origin}/events/${event.slug}`)}`,
    `LOCATION:${escapeIcs(location)}`,
    `URL:${origin}/events/${event.slug}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

export const createICalendarFilename = (event: MinistryEvent) => `${event.slug}.ics`;
