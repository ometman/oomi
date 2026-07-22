import { validateVisitRequest, type PlanVisitSubmission, type VisitType } from '../visit-request';

export type SubmissionKind = 'contact' | 'ministry-interest' | 'visit-request';

export interface PreparedSubmission {
  subject: string;
  replyTo?: string;
  text: string;
}

export interface PreparationResult {
  valid: boolean;
  errors: Record<string, string>;
  submission?: PreparedSubmission;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value: unknown, max = 1500) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const checked = (value: unknown) => value === true || value === 'true' || value === 'on';

function lines(values: Array<[string, unknown]>) {
  return values
    .map(([label, value]) => [label, Array.isArray(value) ? value.join(', ') : text(value, 1500)] as const)
    .filter(([, value]) => value !== '')
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
}

function prepareContact(input: Record<string, unknown>): PreparationResult {
  const firstName = text(input.firstName ?? input['first-name'], 80);
  const lastName = text(input.lastName ?? input['last-name'], 80);
  const email = text(input.email, 254);
  const category = text(input.subject, 40);
  const message = text(input.message, 3000);
  const allowedSubjects = ['general', 'prayer', 'ministry', 'pastoral', 'volunteer', 'events', 'other'];
  const errors: Record<string, string> = {};
  if (!firstName) errors.firstName = 'Enter your first name.';
  if (!lastName) errors.lastName = 'Enter your last name.';
  if (!emailPattern.test(email)) errors.email = 'Enter a valid email address.';
  if (!allowedSubjects.includes(category)) errors.subject = 'Choose a valid subject.';
  if (!message) errors.message = 'Enter a message.';
  if (!checked(input.contactConsent)) errors.contactConsent = 'Consent to respond is required.';
  if (Object.keys(errors).length) return { valid: false, errors };

  return {
    valid: true,
    errors,
    submission: {
      subject: category === 'prayer' ? '[Prayer Request] New restricted prayer request' : '[Website Contact] New contact request',
      replyTo: email,
      text: lines([
        ['First name', firstName], ['Last name', lastName], ['Email', email],
        ['Phone', input.phone], ['Category', category], ['Message', message],
        ['Newsletter interest', checked(input.newsletter) ? 'Yes — follow-up consent recorded on the form' : 'No'],
      ]),
    },
  };
}

function prepareMinistryInterest(input: Record<string, unknown>): PreparationResult {
  const fullName = text(input.fullName ?? input['full-name'], 160);
  const email = text(input.email, 254);
  const ageGroup = text(input.ageGroup ?? input['age-group'], 20);
  const interest = text(input.ministryInterest ?? input['ministry-interest'], 160);
  const errors: Record<string, string> = {};
  if (!fullName) errors.fullName = 'Enter your full name.';
  if (!emailPattern.test(email)) errors.email = 'Enter a valid email address.';
  if (!ageGroup) errors.ageGroup = 'Choose an age group.';
  if (!interest) errors.ministryInterest = 'Choose a ministry interest.';
  if (!checked(input.contactConsent)) errors.contactConsent = 'Consent to respond is required.';
  if (Object.keys(errors).length) return { valid: false, errors };
  return {
    valid: true,
    errors,
    submission: {
      subject: '[Ministry Interest] New ministry interest',
      replyTo: email,
      text: lines([
        ['Full name', fullName], ['Email', email], ['Phone', input.phone], ['Age group', ageGroup],
        ['Ministry interest', interest], ['Skills and talents', input.skills],
        ['Availability', input.availability], ['Additional information', input.message],
      ]),
    },
  };
}

const visitSubjects: Record<VisitType, string> = {
  IN_PERSON_EVENT: '[Plan Your Visit] New visit request',
  ONLINE_EVENT: '[Plan Your Visit] New online visit request',
  OFFICE_APPOINTMENT: '[Office Appointment] New appointment request',
  PRAYER_REQUEST: '[Prayer Request] New restricted prayer request',
  PARTNERSHIP_ENQUIRY: '[Partnership Enquiry] New partnership enquiry',
  MEDIA_ENQUIRY: '[Media Enquiry] New media enquiry',
};

function prepareVisit(input: Record<string, unknown>): PreparationResult {
  const validation = validateVisitRequest(input as Partial<PlanVisitSubmission>);
  if (!validation.valid) return validation;
  const visit = input as unknown as PlanVisitSubmission;
  return {
    valid: true,
    errors: {},
    submission: {
      subject: visitSubjects[visit.visitType],
      replyTo: visit.email && emailPattern.test(visit.email) ? visit.email : undefined,
      text: lines([
        ['Connection type', visit.visitType], ['Location', visit.location], ['Programme', visit.eventId],
        ['Appointment purpose', visit.appointmentPurpose], ['Preferred date', visit.preferredDate],
        ['Preferred time', visit.preferredTime], ['First name', visit.firstName], ['Last name', visit.lastName],
        ['Phone', visit.phone], ['WhatsApp', visit.whatsapp], ['Email', visit.email],
        ['Preferred contact method', visit.preferredContactMethod], ['Adults attending', visit.adultsAttending],
        ['Children attending', visit.childrenAttending], ['Children age ranges', visit.childAgeRanges],
        ['First connection', visit.isFirstTime ? 'Yes' : 'No'], ['Residential area', visit.residentialArea],
        ['How they heard about us', visit.heardAboutUs], ['Accessibility needs', visit.accessibilityNeeds],
        ['Message', visit.message], ['Prayer request', visit.prayerRequest], ['Safe contact time', visit.safeContactTime],
        ['Contact consent', visit.contactConsent ? 'Yes' : 'No'], ['Programme consent', visit.programmeConsent ? 'Yes' : 'No'],
        ['Marketing consent', visit.marketingConsent ? 'Yes' : 'No'], ['Privacy accepted', visit.privacyAccepted ? 'Yes' : 'No'],
        ['Consent time', visit.consentTimestamp],
      ]),
    },
  };
}

export function prepareSubmission(kind: unknown, input: Record<string, unknown>): PreparationResult {
  if (kind === 'contact') return prepareContact(input);
  if (kind === 'ministry-interest') return prepareMinistryInterest(input);
  if (kind === 'visit-request') return prepareVisit(input);
  return { valid: false, errors: { kind: 'Unsupported form type.' } };
}
