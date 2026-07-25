export type EventLocation = 'ACCRA' | 'KUMASI' | 'ONLINE' | 'OTHER';
export type EventFormat = 'IN_PERSON' | 'ONLINE' | 'HYBRID';
export type EventCategory =
  | 'TEACHING'
  | 'PRAYER_WORSHIP'
  | 'DISCIPLESHIP'
  | 'LEADERSHIP'
  | 'CONFERENCE'
  | 'OUTREACH'
  | 'YOUTH_FAMILY'
  | 'ONLINE_PROGRAMME'
  | 'SPECIAL_MINISTRY';
export type EventStatus =
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'FULL'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'COMPLETED';
export type RegistrationStatus = 'OPEN' | 'WAITLIST' | 'CLOSED';

export interface MinistryEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  fullDescription?: string;
  date: string;
  endDate?: string;
  startTime: string;
  endTime?: string;
  timezone: 'Africa/Accra';
  location: EventLocation;
  locationName?: string;
  locationArea?: string;
  format: EventFormat;
  category: EventCategory;
  featured: boolean;
  status: EventStatus;
  registrationStatus: RegistrationStatus;
  approved: boolean;
  draft: boolean;
  image?: string;
  registrationUrl?: string;
  onlineUrl?: string;
  eventPageEnabled: boolean;
  capacityLabel?: string;
  costLabel?: string;
  childrenInfo?: string;
  accessibilityInfo?: string;
  arrivalInfo?: string;
  recordingUrl?: string;
  sermonUrl?: string;
  recapUrl?: string;
}

export interface RecurringProgramme {
  id: string;
  title: string;
  cadence: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  recurrenceLabel: string;
  time?: string;
  location?: EventLocation;
  format: EventFormat;
  formatLabel?: string;
  description: string;
  image?: string;
  href?: string;
  status: 'ACTIVE' | 'PAUSED';
  approved: boolean;
}

export interface FeaturedProgramme {
  id: string;
  title: string;
  category: string;
  format: string;
  locations: string[];
  filterLocations: EventLocation[];
  filterFormat: EventFormat;
  filterCategory: EventCategory;
  date: string;
  dateLabel: string;
  theme: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  image?: string;
}

// Add only confirmed, publication-approved records. Do not infer dates, venues,
// registration links, livestream links, recurring schedules, or recordings.
export const ministryEvents: MinistryEvent[] = [];
export const recurringProgrammes: RecurringProgramme[] = [
  {
    id: 'battle-of-champions',
    title: 'Battle of Champions',
    cadence: 'WEEKLY',
    recurrenceLabel: 'Every Friday',
    format: 'HYBRID',
    formatLabel: 'Online or Hybrid',
    description: 'Focused intercession, worship and prophetic prayer.',
    image: '/images/programmes/battle-of-champions.png',
    status: 'ACTIVE',
    approved: true,
  },
  {
    id: 'sunday-online-teaching-broadcast',
    title: 'Sunday Online Teaching Broadcast',
    cadence: 'WEEKLY',
    recurrenceLabel: 'Sunday evening',
    location: 'ONLINE',
    format: 'ONLINE',
    description: 'A structured teaching session for believers across locations.',
    image: '/images/programmes/sunday-online-teaching-broadcast.png',
    status: 'ACTIVE',
    approved: true,
  },
  {
    id: 'kingdom-leadership-forum',
    title: 'Kingdom Leadership Forum',
    cadence: 'MONTHLY',
    recurrenceLabel: 'Monthly',
    format: 'HYBRID',
    description: 'Leadership development for pastors, ministry workers, professionals and emerging leaders.',
    image: '/images/programmes/kingdom-leadership-forum.png',
    status: 'ACTIVE',
    approved: true,
  },
  {
    id: 'discipleship-masterclass',
    title: 'Discipleship Masterclass',
    cadence: 'MONTHLY',
    recurrenceLabel: 'Monthly',
    location: 'ONLINE',
    format: 'ONLINE',
    description: 'Christian foundations, spiritual maturity, service and purpose.',
    image: '/images/programmes/discipleship-masterclass.png',
    status: 'ACTIVE',
    approved: true,
  },
  {
    id: 'healing-service',
    title: 'Healing Service',
    cadence: 'QUARTERLY',
    recurrenceLabel: 'Quarterly',
    location: 'ONLINE',
    format: 'ONLINE',
    description:
      'Restorative prayer, biblical hope, encouragement and pastoral support, presented responsibly without guaranteed claims.',
    image: '/images/programmes/healing-service.png',
    status: 'ACTIVE',
    approved: true,
  },
  {
    id: 'communion-anointing-service',
    title: 'Communion & Anointing Service',
    cadence: 'QUARTERLY',
    recurrenceLabel: 'Quarterly',
    format: 'HYBRID',
    description:
      'A fellowship of grace, love and power for spiritual upliftment and intimacy with Jesus Christ, as chosen and called-out ones.',
    image: '/images/programmes/communion-anointing-service.png',
    status: 'ACTIVE',
    approved: true,
  },
];

// Featured programme summaries may be published before dates and venues are
// confirmed. Their CTAs lead to an enquiry or visit-planning step, not payment.
export const featuredProgrammes: FeaturedProgramme[] = [
  {
    id: 'regional-leadership-summit',
    title: 'Regional Leadership Summit',
    category: 'Leadership',
    format: 'In-Person — Kumasi',
    locations: ['Kumasi'],
    filterLocations: ['KUMASI'],
    filterFormat: 'IN_PERSON',
    filterCategory: 'LEADERSHIP',
    date: '2026-10-31',
    dateLabel: 'Saturday, October 31, 2026',
    theme: 'Leading Today’s Church — The People, Purpose and Programming',
    description:
      'A focused leadership gathering for pastors, ministry workers, professionals and emerging leaders. The event can include biblical teaching, practical leadership sessions, prayer, mentoring and a Q&A session.',
    ctaLabel: 'Register for the Summit',
    ctaHref: '/contact?subject=Regional%20Leadership%20Summit',
    image: '/images/events/leadership-summit-thumbnail.png',
  },
  {
    id: 'city-awakening-campaign',
    title: 'City Awakening Campaign',
    category: 'Prayer and Worship',
    format: 'In Person and Online',
    locations: ['Kumasi', 'Online'],
    filterLocations: ['KUMASI', 'ONLINE'],
    filterFormat: 'HYBRID',
    filterCategory: 'PRAYER_WORSHIP',
    date: '2026-11-28',
    dateLabel: 'Saturday, November 28, 2026',
    theme: 'Seeking God, Strengthening Faith, Renewing Purpose',
    description:
      'A day of worship, intercession, Scripture and spiritual encouragement led by Rev. Omet Yawelis Omeni, seasoned men and women of God, and the ministry team.',
    ctaLabel: 'Plan to Attend',
    ctaHref: '/plan-your-visit',
    image: '/images/events/awakening-campaign-thumbnail.png',
  },
];


export function isPublicEvent(event: MinistryEvent) {
  return event.approved && !event.draft;
}

export function getUpcomingApprovedEvents(now = new Date()): MinistryEvent[] {
  const today = now.toISOString().slice(0, 10);
  return ministryEvents
    .filter((event) =>
      isPublicEvent(event) &&
      !['COMPLETED', 'CANCELLED'].includes(event.status) &&
      event.date >= today
    )
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
}

export function getPastEventHighlights(now = new Date()): MinistryEvent[] {
  const today = now.toISOString().slice(0, 10);
  return ministryEvents
    .filter((event) =>
      isPublicEvent(event) &&
      (event.status === 'COMPLETED' || event.date < today) &&
      Boolean(event.recordingUrl || event.sermonUrl || event.recapUrl)
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}
