export type EventLocation = 'ACCRA' | 'KUMASI' | 'ONLINE';
export type EventFormat = 'IN_PERSON' | 'ONLINE' | 'HYBRID';
export type RegistrationStatus = 'OPEN' | 'WAITLIST' | 'CLOSED';

export interface MinistryEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  location: EventLocation;
  format: EventFormat;
  description: string;
  registrationStatus: RegistrationStatus;
  approved: boolean;
}

// Add only confirmed, publication-approved events. Do not infer dates or venues.
export const ministryEvents: MinistryEvent[] = [];

export function getUpcomingApprovedEvents(now = new Date()): MinistryEvent[] {
  const today = now.toISOString().slice(0, 10);
  return ministryEvents
    .filter((event) => event.approved && event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
}
