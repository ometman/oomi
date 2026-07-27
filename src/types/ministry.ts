export type MinistryCategory = 'CORE_MINISTRY' | 'SERVICE_TEAM' | 'OPERATIONAL_TEAM';
export type MinistryLocation = 'ACCRA' | 'KUMASI' | 'ONLINE' | 'FLEXIBLE';
export type MinistryStatus =
  | 'PUBLIC_PROGRAMME'
  | 'ACCEPTING_INTEREST'
  | 'TRAINING_REQUIRED'
  | 'NOT_RECRUITING'
  | 'ONLINE_AVAILABLE';

export interface Ministry {
  title: string;
  slug: string;
  category: MinistryCategory;
  description: string;
  fullDescription: string;
  focus: string;
  format: string;
  locations: MinistryLocation[];
  participationLabel: string;
  activities: string[];
  featured: boolean;
  status: MinistryStatus;
  image: string;
  thumbnail: string;
  relatedEventSlugs: string[];
  relatedSermonSlugs: string[];
  acceptingVolunteers: boolean;
  safeguardingRequired?: boolean;
}
