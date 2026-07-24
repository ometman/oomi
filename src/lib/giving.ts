export const GIVING_DESIGNATIONS = [
  { id: 'GENERAL_MINISTRY', label: 'General Ministry' },
  { id: 'TITHES_OFFERINGS', label: 'Tithes and Offerings' },
  { id: 'MISSIONS_OUTREACH', label: 'Missions and Outreach' },
  { id: 'MEDIA_ONLINE', label: 'Media and Online Ministry' },
  { id: 'LEADERSHIP_DISCIPLESHIP', label: 'Leadership and Discipleship' },
  { id: 'EVENTS_PROGRAMMES', label: 'Events and Programmes' },
  { id: 'BENEVOLENCE_CARE', label: 'Benevolence and Community Care' },
  { id: 'PARTNERSHIP', label: 'Partnership' },
] as const;

export const GIVING_CHANNELS = ['CARD', 'MOBILE_MONEY'] as const;
export const MOBILE_MONEY_PROVIDERS = ['mtn', 'atl', 'vod'] as const;
export const GIVING_REGIONS = ['LOCAL', 'INTERNATIONAL'] as const;
export type GivingDesignation = (typeof GIVING_DESIGNATIONS)[number]['id'];
export type GivingChannel = (typeof GIVING_CHANNELS)[number];
export type GivingRegion = (typeof GIVING_REGIONS)[number];
export type MobileMoneyProvider = (typeof MOBILE_MONEY_PROVIDERS)[number];

export interface GivingRequest {
  amountGhs: number;
  designation: GivingDesignation;
  channel: GivingChannel;
  givingRegion: GivingRegion;
  email: string;
  firstName?: string;
  mobileMoneyPhone?: string;
  mobileMoneyProvider?: MobileMoneyProvider;
  consentGiven: boolean;
  company?: string;
}

export interface GivingValidation {
  valid: boolean;
  errors: Record<string, string>;
  value?: GivingRequest;
}

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export function validateGivingRequest(input: Record<string, unknown>): GivingValidation {
  const amountGhs = Number(input.amountGhs);
  const designation = clean(input.designation, 40) as GivingDesignation;
  const channel = clean(input.channel, 30) as GivingChannel;
  const givingRegion = (clean(input.givingRegion, 30) || 'LOCAL') as GivingRegion;
  const email = clean(input.email, 254).toLowerCase();
  const firstName = clean(input.firstName, 80);
  const mobileMoneyPhone = clean(input.mobileMoneyPhone, 15).replace(/[\s()-]/g, '');
  const mobileMoneyProvider = clean(input.mobileMoneyProvider, 10) as MobileMoneyProvider;
  const consentGiven = input.consentGiven === true;
  const errors: Record<string, string> = {};

  if (!Number.isFinite(amountGhs) || amountGhs < 1 || amountGhs > 100000 || Math.abs(Math.round(amountGhs * 100) - amountGhs * 100) > Number.EPSILON * 100) {
    errors.amountGhs = 'Enter an amount between GHS 1 and GHS 100,000, using no more than two decimal places.';
  }
  if (!GIVING_DESIGNATIONS.some((item) => item.id === designation)) errors.designation = 'Choose a valid giving designation.';
  if (!GIVING_CHANNELS.includes(channel)) errors.channel = 'Choose card or Mobile Money.';
  if (!GIVING_REGIONS.includes(givingRegion)) errors.givingRegion = 'Choose local or international giving.';
  if (givingRegion === 'INTERNATIONAL' && channel !== 'CARD') {
    errors.channel = 'International giving is available by card only.';
  }
  if (channel === 'MOBILE_MONEY') {
    if (!/^0\d{9}$/.test(mobileMoneyPhone)) {
      errors.mobileMoneyPhone = 'Enter the 10-digit Ghana Mobile Money number, starting with 0.';
    }
    if (!MOBILE_MONEY_PROVIDERS.includes(mobileMoneyProvider)) {
      errors.mobileMoneyProvider = 'Choose the Mobile Money network.';
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (!consentGiven) errors.consentGiven = 'Confirm that Paystack may process the payment details.';

  return Object.keys(errors).length
    ? { valid: false, errors }
    : { valid: true, errors, value: {
      amountGhs, designation, channel, givingRegion, email,
      firstName: firstName || undefined,
      mobileMoneyPhone: channel === 'MOBILE_MONEY' ? mobileMoneyPhone : undefined,
      mobileMoneyProvider: channel === 'MOBILE_MONEY' ? mobileMoneyProvider : undefined,
      consentGiven,
      company: clean(input.company, 100) || undefined,
    } };
}

export function validatePaymentReference(value: unknown) {
  const reference = clean(value, 100);
  return /^[A-Za-z0-9.=-]+$/.test(reference) ? reference : '';
}
