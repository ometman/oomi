export interface MinistryArea {
  name: string;
  description: string;
  iconPath: string;
}

export const ministryAreas: MinistryArea[] = [
  {
    name: 'Teaching Ministry',
    description: 'Biblical teaching that helps people understand Scripture and apply it faithfully.',
    iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253',
  },
  {
    name: 'Prayer Ministry',
    description: 'Prayer programmes that encourage dependence on God, intercession and spiritual growth.',
    iconPath: 'M12 21s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 11c0 5.65-7 10-7 10z',
  },
  {
    name: 'Discipleship',
    description: 'Clear next steps that help believers mature in Christ and live out their faith.',
    iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2a5 5 0 00-10 0v2m10 0H7m0 0H2v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    name: 'Leadership Development',
    description: 'Biblically grounded formation for people called to lead with character, wisdom and service.',
    iconPath: 'M9 12l2 2 4-4m5-3.5A11.8 11.8 0 0112 3a11.8 11.8 0 01-8 3.5V12c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6.5z',
  },
  {
    name: 'Digital Ministry',
    description: 'Teaching, prayer and discipleship resources designed to serve people online.',
    iconPath: 'M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm4 16h8M12 19v2',
  },
  {
    name: 'Community Outreach',
    description: 'Practical expressions of Christian care and kingdom-focused service in communities.',
    iconPath: 'M3 12h3l3-7 4 14 3-7h5M5 19h14',
  },
];
