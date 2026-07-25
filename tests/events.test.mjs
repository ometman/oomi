import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = process.cwd();
const dataSource = fs.readFileSync(path.join(root, 'src/data/events.ts'), 'utf8');
const utilSource = fs.readFileSync(path.join(root, 'src/lib/events.ts'), 'utf8')
  .replace("import type { EventCategory, EventFormat, EventLocation, MinistryEvent } from '../data/events';", '');
const compiled = ts.transpileModule(utilSource, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const events = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

const fixture = (overrides = {}) => ({
  id: 'fixture',
  slug: 'confirmed-teaching',
  title: 'Confirmed Teaching',
  description: 'A confirmed fixture used only by automated tests.',
  date: '2030-07-20',
  startTime: '18:00',
  endTime: '20:00',
  timezone: 'Africa/Accra',
  location: 'ACCRA',
  locationName: 'Confirmed venue',
  format: 'IN_PERSON',
  category: 'TEACHING',
  featured: true,
  status: 'REGISTRATION_OPEN',
  registrationStatus: 'OPEN',
  approved: true,
  draft: false,
  eventPageEnabled: true,
  ...overrides,
});

test('featured selection excludes past, draft, cancelled, and unfeatured events', () => {
  const now = new Date('2030-07-01T12:00:00Z');
  const selected = events.getFeaturedEvent([
    fixture({ slug: 'past', date: '2030-06-30' }),
    fixture({ slug: 'draft', draft: true }),
    fixture({ slug: 'cancelled', status: 'CANCELLED' }),
    fixture({ slug: 'unfeatured', featured: false }),
    fixture({ slug: 'valid', date: '2030-07-10' }),
  ], now);
  assert.equal(selected.slug, 'valid');
});

test('event filters work by location, format, category, and month', () => {
  const records = [
    fixture(),
    fixture({ slug: 'online', location: 'ONLINE', format: 'ONLINE', category: 'ONLINE_PROGRAMME', date: '2030-08-01' }),
  ];
  assert.deepEqual(events.filterEvents(records, { location: 'ONLINE' }).map((item) => item.slug), ['online']);
  assert.deepEqual(events.filterEvents(records, { format: 'IN_PERSON' }).map((item) => item.slug), ['confirmed-teaching']);
  assert.deepEqual(events.filterEvents(records, { category: 'TEACHING' }).map((item) => item.slug), ['confirmed-teaching']);
  assert.deepEqual(events.filterEvents(records, { month: '2030-08' }).map((item) => item.slug), ['online']);
});

test('countdown never returns negative wording', () => {
  assert.equal(events.getEventCountdown(fixture({ date: '2030-07-01' }), new Date('2030-07-01T10:00:00Z')), 'Today');
  assert.equal(events.getEventCountdown(fixture({ date: '2030-07-02' }), new Date('2030-07-01T10:00:00Z')), 'Tomorrow');
  assert.equal(events.getEventCountdown(fixture({ date: '2030-06-30' }), new Date('2030-07-01T10:00:00Z')), null);
});

test('calendar outputs include encoded event data and required ICS fields', () => {
  const event = fixture();
  const google = new URL(events.createGoogleCalendarUrl(event));
  assert.equal(google.hostname, 'calendar.google.com');
  assert.equal(google.searchParams.get('text'), event.title);
  const ics = events.createICalendarContent(event);
  for (const field of ['BEGIN:VCALENDAR', 'BEGIN:VEVENT', 'DTSTART:', 'DTEND:', 'SUMMARY:Confirmed Teaching', 'END:VEVENT']) assert.match(ics, new RegExp(field));
  assert.equal(events.createICalendarFilename(event), 'confirmed-teaching.ics');
});

test('Events UI contains accessible filters, empty states, newsletter, and no legacy placeholders', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/events.astro'), 'utf8');
  const filters = fs.readFileSync(path.join(root, 'src/components/events/EventFilters.astro'), 'utf8');
  const card = fs.readFileSync(path.join(root, 'src/components/events/EventCard.astro'), 'utf8');
  assert.match(page, /Events and Ministry Experiences/);
  assert.match(page, /NewsletterSignup/);
  assert.match(page, /No additional upcoming events are currently published/);
  assert.match(page, /No upcoming events match these filters/);
  assert.match(filters, /Clear Filters/);
  assert.match(filters, /aria-live="polite"/);
  assert.match(card, /plan-your-visit\?event=/);
  assert.doesNotMatch(`${page}\n${card}`, /href="#"|pexels|Royal Cockpit|Ahodwo-Nhyiaeso|Christmas Celebration Service|Youth Conference 2025/i);
});

test('event detail, ICS, and Plan Your Visit preselection are wired by slug', () => {
  const detail = fs.readFileSync(path.join(root, 'src/pages/events/[slug].astro'), 'utf8');
  const calendar = fs.readFileSync(path.join(root, 'src/components/events/EventCalendarActions.astro'), 'utf8');
  const form = fs.readFileSync(path.join(root, 'src/components/PlanVisitForm.astro'), 'utf8');
  assert.match(detail, /getStaticPaths/);
  assert.match(detail, /EventCalendarActions/);
  assert.match(calendar, /data:text\/calendar/);
  assert.match(calendar, /download=/);
  assert.match(form, /URLSearchParams\(window\.location\.search\)\.get\('event'\)/);
  assert.match(form, /option\.value === requestedEvent/);
});

test('dated public event data starts empty while approved recurring programmes are explicit', () => {
  assert.match(dataSource, /ministryEvents: MinistryEvent\[\] = \[\]/);
  for (const title of [
    'Battle of Champions',
    'Sunday Online Teaching Broadcast',
    'Kingdom Leadership Forum',
    'Discipleship Masterclass',
    'Healing Service',
    'Communion & Anointing Service',
  ]) {
    assert.match(dataSource, new RegExp(title));
  }
  assert.match(dataSource, /cadence: 'WEEKLY'/);
  assert.match(dataSource, /cadence: 'MONTHLY'/);
  assert.match(dataSource, /cadence: 'QUARTERLY'/);
});

test('featured programmes remain separate but participate in visible event filters', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/events.astro'), 'utf8');
  const featuredCard = fs.readFileSync(path.join(root, 'src/components/events/FeaturedProgrammeCard.astro'), 'utf8');
  assert.match(page, /featuredProgrammes\.map/);
  assert.match(page, /<EventFilters \/>[\s\S]*id="events-grid"/);
  assert.match(page, /id="events-grid"[\s\S]*upcomingEvents\.map/);
  assert.doesNotMatch(page, /id="events-grid"[\s\S]*featuredProgrammes\.map/);
  assert.match(page, /querySelectorAll<HTMLElement>\('\[data-event-card\]'\)/);
  assert.match(page, /locations\.includes\(values\.location\)/);
  assert.match(page, /grid\.append\(card\)/);
  assert.match(page, /marker\.parentNode\.insertBefore\(card, marker\.nextSibling\)/);
  assert.match(page, /defaultState\.hidden = filtering/);
  for (const attribute of ['data-event-card', 'data-location', 'data-format', 'data-category', 'data-month']) {
    assert.match(featuredCard, new RegExp(attribute));
  }
});

test('regular programme cadence tags filter one shared programme grid', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/events.astro'), 'utf8');
  assert.match(page, /data-programme-filter=\{cadence\}/);
  assert.match(page, /data-programme-card data-cadence=\{programme\.cadence\}/);
  assert.match(page, /activeCadence === selected \? '' : selected/);
  assert.match(page, /card\.dataset\.cadence !== activeCadence/);
  assert.match(page, /Showing all regular programmes/);
  assert.doesNotMatch(page, /Weekly Programmes|Monthly Programmes|Quarterly Programmes/);
});

test('approved regular programme images are assigned to every programme card', () => {
  for (const image of [
    'battle-of-champions.png',
    'sunday-online-teaching-broadcast.png',
    'kingdom-leadership-forum.png',
    'discipleship-masterclass.png',
    'communion-anointing-service.png',
    'healing-service.png',
  ]) {
    assert.match(dataSource, new RegExp(`/images/programmes/${image.replace('.', '\\.')}`));
    assert.ok(fs.existsSync(path.join(root, 'public/images/programmes', image)));
  }
});

test('event response modals use the validated server mail endpoint', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/events.astro'), 'utf8');
  const modal = fs.readFileSync(path.join(root, 'src/components/events/EventResponseModal.astro'), 'utf8');
  const featuredCard = fs.readFileSync(path.join(root, 'src/components/events/FeaturedProgrammeCard.astro'), 'utf8');
  const regularCard = fs.readFileSync(path.join(root, 'src/components/events/RecurringProgrammeCard.astro'), 'utf8');
  const submissions = fs.readFileSync(path.join(root, 'src/lib/server/form-submissions.ts'), 'utf8');
  assert.match(page, /<EventResponseModal \/>/);
  assert.match(featuredCard, /data-action=\{programme\.ctaLabel[\s\S]*'REGISTER'[\s\S]*'PLAN'/);
  assert.match(regularCard, /data-action="JOIN"/);
  assert.match(modal, /<dialog id="event-response-modal"/);
  assert.match(modal, /fetch\('\/api\/forms'/);
  assert.match(modal, /name="contactConsent"/);
  assert.match(submissions, /function prepareEventResponse/);
  assert.match(submissions, /allowedActions = \['REGISTER', 'PLAN', 'JOIN'\]/);
  assert.match(submissions, /kind === 'event-response'/);
});
