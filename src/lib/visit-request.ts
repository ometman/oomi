export const VISIT_TYPES = [
  'IN_PERSON_EVENT',
  'ONLINE_EVENT',
  'OFFICE_APPOINTMENT',
  'PRAYER_REQUEST',
  'PARTNERSHIP_ENQUIRY',
  'MEDIA_ENQUIRY',
] as const;

export const VISIT_LOCATIONS = ['ACCRA', 'KUMASI', 'ONLINE', 'UNSURE'] as const;
export const CONTACT_METHODS = ['WHATSAPP', 'PHONE', 'EMAIL'] as const;

export type VisitType = (typeof VISIT_TYPES)[number];
export type VisitLocation = (typeof VISIT_LOCATIONS)[number];
export type PreferredContactMethod = (typeof CONTACT_METHODS)[number];

export interface PlanVisitSubmission {
  visitType: VisitType;
  location: VisitLocation;
  eventId?: string;
  appointmentPurpose?: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  preferredContactMethod: PreferredContactMethod;
  adultsAttending?: number;
  childrenAttending?: number;
  childAgeRanges?: string[];
  guardianAcknowledged?: boolean;
  isFirstTime?: boolean;
  heardAboutUs?: string;
  residentialArea?: string;
  accessibilityNeeds?: string;
  message?: string;
  prayerRequest?: string;
  safeContactTime?: string;
  preferredDate?: string;
  preferredTime?: string;
  contactConsent: boolean;
  programmeConsent?: boolean;
  marketingConsent: boolean;
  privacyAccepted: boolean;
  consentTimestamp: string;
  source: 'WEBSITE_PLAN_YOUR_VISIT';
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const isOneOf = <T extends readonly string[]>(value: string, values: T): value is T[number] => values.includes(value);
const validPhone = (value: string) => /^\+?[0-9][0-9\s()-]{6,19}$/.test(value);
const validEmail = (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function validateVisitRequest(input: Partial<PlanVisitSubmission>): ValidationResult {
  const errors: Record<string, string> = {};
  const visitType = text(input.visitType);
  const location = text(input.location);
  const contactMethod = text(input.preferredContactMethod);
  const firstName = text(input.firstName);
  const lastName = text(input.lastName);
  const phone = text(input.phone);
  const email = text(input.email);

  if (!isOneOf(visitType, VISIT_TYPES)) errors.visitType = 'Choose how you would like to connect.';
  if (!isOneOf(location, VISIT_LOCATIONS)) errors.location = 'Choose a location.';
  if (!firstName || firstName.length > 80) errors.firstName = 'Enter a first name of 80 characters or fewer.';
  if (!lastName || lastName.length > 80) errors.lastName = 'Enter a last name of 80 characters or fewer.';
  if (!validPhone(phone)) errors.phone = 'Enter a valid mobile number.';
  if (!validEmail(email)) errors.email = 'Enter a valid email address.';
  if (!isOneOf(contactMethod, CONTACT_METHODS)) errors.preferredContactMethod = 'Choose a contact method.';
  if (contactMethod === 'EMAIL' && !email) errors.email = 'Email is required when email is your preferred contact method.';

  if (visitType === 'ONLINE_EVENT' && location !== 'ONLINE') errors.location = 'Online programmes use the online location.';
  if ((visitType === 'OFFICE_APPOINTMENT' || visitType === 'IN_PERSON_EVENT') && !['ACCRA', 'KUMASI'].includes(location)) {
    errors.location = 'Choose Accra or Kumasi for this request.';
  }
  if (visitType === 'OFFICE_APPOINTMENT') {
    if (!text(input.appointmentPurpose)) errors.appointmentPurpose = 'Enter the appointment purpose.';
    if (!text(input.preferredDate)) errors.preferredDate = 'Choose a preferred date.';
    if (!text(input.preferredTime)) errors.preferredTime = 'Choose a preferred time.';
  }
  if (visitType === 'PRAYER_REQUEST' && !text(input.prayerRequest)) errors.prayerRequest = 'Enter a concise prayer request.';

  const adults = Number(input.adultsAttending ?? 0);
  const children = Number(input.childrenAttending ?? 0);
  if (!Number.isInteger(adults) || adults < 0 || adults > 20) errors.adultsAttending = 'Adults must be between 0 and 20.';
  if (!Number.isInteger(children) || children < 0 || children > 20) errors.childrenAttending = 'Children must be between 0 and 20.';
  if (children > 0 && !input.guardianAcknowledged) errors.guardianAcknowledged = 'A parent or guardian must acknowledge the children information.';

  for (const field of ['message', 'prayerRequest', 'accessibilityNeeds'] as const) {
    if (text(input[field]).length > 1500) errors[field] = 'Keep this response to 1,500 characters or fewer.';
  }
  if (!input.contactConsent) errors.contactConsent = 'Consent to contact is required.';
  if (!input.privacyAccepted) errors.privacyAccepted = 'Privacy acceptance is required.';

  return { valid: Object.keys(errors).length === 0, errors };
}
