export interface MinistryFilter {
  label: string;
  value: string;
  attribute: 'all' | 'category' | 'location' | 'volunteer';
}

export const ministryFilters: MinistryFilter[] = [
  { label: 'All', value: 'all', attribute: 'all' },
  { label: 'Core Ministries', value: 'CORE_MINISTRY', attribute: 'category' },
  { label: 'Service Teams', value: 'SERVICE_TEAM', attribute: 'category' },
  { label: 'Operational Teams', value: 'OPERATIONAL_TEAM', attribute: 'category' },
  { label: 'Accra', value: 'ACCRA', attribute: 'location' },
  { label: 'Kumasi', value: 'KUMASI', attribute: 'location' },
  { label: 'Online', value: 'ONLINE', attribute: 'location' },
  { label: 'Accepting Volunteers', value: 'true', attribute: 'volunteer' },
];

