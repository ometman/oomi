export type VolunteerStatus = 'Open' | 'Limited' | 'Training Required' | 'Not Currently Recruiting';

export interface VolunteerOpportunity {
  title: string;
  slug: string;
  description: string;
  commitment: string;
  skills: string;
  status: VolunteerStatus;
}

export const volunteerOpportunities: VolunteerOpportunity[] = [
  { title: 'Event and Hospitality Support', slug: 'event-and-hospitality-support', description: 'Support registration, guest welcome, seating, event preparation and visitor guidance.', commitment: 'Event-based or occasional', skills: 'Warm communication, reliability and organisation', status: 'Open' },
  { title: 'Media and Technical Support', slug: 'media-and-technical-support', description: 'Support livestreaming, sound, video, photography and event production.', commitment: 'Flexible, event-based or online', skills: 'Audio, video, photography or technical interest', status: 'Training Required' },
  { title: 'Communications and Content', slug: 'communications-and-content', description: 'Support social media, website content, newsletters, event promotion and digital communication.', commitment: 'Flexible or remote', skills: 'Writing, design, social media or content editing', status: 'Open' },
  { title: 'Administrative Support', slug: 'administrative-support', description: 'Assist with programme coordination, records, scheduling, follow-up and office administration.', commitment: 'Flexible, monthly or office-based', skills: 'Organisation, confidentiality and attention to detail', status: 'Limited' },
  { title: 'Outreach Support', slug: 'outreach-support', description: 'Support community engagement, evangelism logistics and practical outreach.', commitment: 'Event-based or monthly', skills: 'Teamwork, compassion and community engagement', status: 'Open' },
  { title: 'Prayer Support', slug: 'prayer-support', description: 'Support approved prayer follow-up, intercession and programme prayer.', commitment: 'Flexible or programme-based', skills: 'Spiritual maturity, discretion and reliability', status: 'Training Required' },
];
