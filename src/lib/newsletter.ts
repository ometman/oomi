export const NEWSLETTER_LOCATIONS = ['ACCRA', 'KUMASI', 'ONLINE', 'OTHER'] as const;
export const NEWSLETTER_INTERESTS = [
  'SERMONS_TEACHINGS',
  'PRAYER_PROGRAMMES',
  'EVENTS',
  'LEADERSHIP_RESOURCES',
  'DISCIPLESHIP',
  'GENERAL_UPDATES',
] as const;
export const NEWSLETTER_SOURCES = ['HOME', 'FOOTER', 'EVENTS', 'SERMONS', 'PLAN_VISIT_CONFIRMATION'] as const;

export interface NewsletterSubscriberInput {
  firstName: string;
  email: string;
  whatsapp?: string;
  location?: (typeof NEWSLETTER_LOCATIONS)[number];
  interests: (typeof NEWSLETTER_INTERESTS)[number][];
  consentGiven: boolean;
  source: string;
  company?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  value?: NewsletterSubscriberInput;
}

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const oneOf = <T extends readonly string[]>(value: string, values: T): value is T[number] => values.includes(value);

export function validateNewsletterSubscription(input: Record<string, unknown>): ValidationResult {
  const firstName = clean(input.firstName, 80);
  const email = clean(input.email, 254).toLowerCase();
  const whatsapp = clean(input.whatsapp, 30);
  const location = clean(input.location, 20);
  const requestedSource = clean(input.source, 80);
  const source = oneOf(requestedSource, NEWSLETTER_SOURCES) ? requestedSource : 'WEBSITE';
  const interests = Array.isArray(input.interests)
    ? [...new Set(input.interests.map((item) => clean(item, 40)).filter((item) => oneOf(item, NEWSLETTER_INTERESTS)))]
    : [];
  const consentGiven = input.consentGiven === true;
  const errors: Record<string, string> = {};

  if (!firstName) errors.firstName = 'Enter your first name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (whatsapp && !/^\+?[0-9][0-9\s()-]{6,19}$/.test(whatsapp)) errors.whatsapp = 'Enter a valid WhatsApp number.';
  if (location && !oneOf(location, NEWSLETTER_LOCATIONS)) errors.location = 'Choose a valid location.';
  if (!consentGiven) errors.consentGiven = 'Consent is required to subscribe.';

  return Object.keys(errors).length
    ? { valid: false, errors }
    : { valid: true, errors, value: { firstName, email, whatsapp: whatsapp || undefined, location: location as NewsletterSubscriberInput['location'] || undefined, interests: interests as NewsletterSubscriberInput['interests'], consentGiven, source, company: clean(input.company, 100) || undefined } };
}

export function validateUnsubscribeToken(value: unknown) {
  const token = clean(value, 128);
  return /^[a-f0-9]{64}$/i.test(token) ? token : '';
}
