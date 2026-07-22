export interface MinistryLocation {
  id: 'ACCRA' | 'KUMASI' | 'ONLINE';
  name: string;
  generalArea: string;
  address: string | null;
  appointmentHours: string | null;
  officialPhone: string | null;
  mapUrl: string | null;
  transportNote: string | null;
  accessibilityNote: string;
  description: string;
  platform: string | null;
  registrationInstructions: string;
  timeZoneNote: string | null;
}

export const ministryLocations: MinistryLocation[] = [
  {
    id: 'ACCRA',
    name: 'Accra Office',
    generalArea: 'Accra, Ghana',
    address: null,
    appointmentHours: null,
    officialPhone: null,
    mapUrl: null,
    transportNote: null,
    accessibilityNote: 'Tell us about any access needs when requesting an appointment.',
    description: 'Request a confirmed appointment for ministry, partnership, administrative, or pastoral enquiries.',
    platform: null,
    registrationInstructions: 'Submit an appointment request and wait for written confirmation before travelling.',
    timeZoneNote: null,
  },
  {
    id: 'KUMASI',
    name: 'Kumasi Office',
    generalArea: 'Kumasi, Ghana',
    address: null,
    appointmentHours: null,
    officialPhone: null,
    mapUrl: null,
    transportNote: null,
    accessibilityNote: 'Tell us about any access needs when requesting an appointment.',
    description: 'Request a confirmed appointment for ministry, partnership, administrative, or pastoral enquiries.',
    platform: null,
    registrationInstructions: 'Submit an appointment request and wait for written confirmation before travelling.',
    timeZoneNote: null,
  },
  {
    id: 'ONLINE',
    name: 'Online Ministry',
    generalArea: 'Available internationally',
    address: null,
    appointmentHours: null,
    officialPhone: null,
    mapUrl: null,
    transportNote: null,
    accessibilityNote: 'Captions, notes, or other access support will be identified for each programme where available.',
    description: 'Connect through livestreams, teaching, prayer, discipleship programmes, and approved digital communities.',
    platform: null,
    registrationInstructions: 'Register for a confirmed online programme to receive its access instructions.',
    timeZoneNote: 'Programme times should state Ghana time (GMT) and any relevant international time zones.',
  },
];
