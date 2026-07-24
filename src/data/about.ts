export interface AboutCard {
  title: string;
  description: string;
  iconPath: string;
}

export const ministryQualities = [
  'Christ-centred',
  'Word-based',
  'Prayerful',
  'Discipleship-focused',
  'Digitally accessible',
  'Mission-minded',
] as const;

export const visionMission = [
  {
    eyebrow: 'Our Vision',
    statement: 'To see believers rooted in God’s Word, empowered by the Holy Spirit and transformed to impact their generation for Christ.',
    iconPath: 'M12 3v18m9-9H3',
  },
  {
    eyebrow: 'Our Mission',
    statement: 'To proclaim Jesus Christ through biblical teaching, prayer, worship, discipleship and digital ministry, serving Accra, Kumasi and online.',
    iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
] as const;

export const ministryMandate: AboutCard[] = [
  {
    title: 'Biblical Teaching',
    description: 'We proclaim and apply the uncompromised Word of God to everyday life.',
    iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    title: 'Prayer and Worship',
    description: 'We cultivate a ministry culture of prayer, worship and dependence on the Holy Spirit.',
    iconPath: 'M12 21C7.03 17.61 3 13.95 3 9.5A4.5 4.5 0 0111.12 6.8L12 8l.88-1.2A4.5 4.5 0 0121 9.5c0 4.45-4.03 8.11-9 11.5z',
  },
  {
    title: 'Discipleship',
    description: 'We help believers grow in Christ, mature in faith and fulfil their God-given purpose.',
    iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m9.288 0a5.002 5.002 0 00-9.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    title: 'Kingdom Impact',
    description: 'We reach communities and nations with the love, truth and power of Jesus Christ.',
    iconPath: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.2-2.4 3.3-5.4 3.3-9S14.2 5.4 12 3m0 18c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3M3.6 9h16.8M3.6 15h16.8',
  },
];

export const beliefs: AboutCard[] = [
  { title: 'Scripture', description: 'We believe the Bible is the inspired and authoritative Word of God.', iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { title: 'The Trinity', description: 'We believe in one God eternally existing as Father, Son and Holy Spirit.', iconPath: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z' },
  { title: 'Jesus Christ', description: 'We believe Jesus Christ is fully God and fully man, crucified, risen and Lord.', iconPath: 'M12 3v18m-6-12h12' },
  { title: 'Salvation', description: 'We believe salvation is by grace through faith in Jesus Christ, not by human works.', iconPath: 'M5 12l4 4L19 6' },
  { title: 'The Holy Spirit', description: 'We believe the Holy Spirit indwells, transforms and empowers believers for holy living and service.', iconPath: 'M13 2L4 14h7v8l9-12h-7V2z' },
  { title: 'The Church', description: 'We believe the Church is the body of Christ, called to worship, fellowship, discipleship and mission.', iconPath: 'M17 20H7v-2a5 5 0 0110 0v2zM12 11a4 4 0 100-8 4 4 0 000 8z' },
  { title: 'Prayer and Spiritual Gifts', description: 'We believe in prayer and in the responsible operation of spiritual gifts under biblical order.', iconPath: 'M12 21C7.03 17.61 3 13.95 3 9.5A4.5 4.5 0 0111.12 6.8L12 8l.88-1.2A4.5 4.5 0 0121 9.5c0 4.45-4.03 8.11-9 11.5z' },
  { title: 'The Great Commission', description: 'We believe every believer is called to make disciples of all nations.', iconPath: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.2-2.4 3.3-5.4 3.3-9S14.2 5.4 12 3m0 18c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3' },
  { title: 'The Return of Christ', description: 'We believe Jesus Christ will return and establish the fullness of his kingdom.', iconPath: 'M12 19V5m-6 6l6-6 6 6' },
];

export const trustCommitments = [
  'Biblical accountability',
  'Responsible leadership',
  'Financial integrity',
  'Safeguarding',
  'Respectful prayer and pastoral ministry',
  'Data privacy and clear consent',
  'Appropriate referral of serious concerns',
] as const;
