# Events administration

Event records live in `src/data/events.ts`. This typed module is the temporary
data source until an approved CMS or Astro content collection is introduced.
Do not add an event until its date, time, location, publication status, and
visitor actions have been confirmed.

## Creating an event

Add a `MinistryEvent` object to `ministryEvents`. Required fields include a
unique `id` and URL-safe `slug`, title, description, ISO date (`YYYY-MM-DD`),
24-hour start time (`HH:mm`), `Africa/Accra` timezone, location, format,
category, status, registration status, and the publication controls
`approved`, `draft`, and `eventPageEnabled`.

An event becomes public only when `approved: true` and `draft: false`.
`DRAFT` is represented by `draft: true`; drafts are never public.

## Featured events

Set `featured: true` on a confirmed future event. The Events page selects the
nearest future featured record. Past, draft, cancelled, and completed events
cannot become the featured event.

## Locations, formats, and categories

Use the exported union values exactly:

- Location: `ACCRA`, `KUMASI`, `ONLINE`, or `OTHER`.
- Format: `IN_PERSON`, `ONLINE`, or `HYBRID`.
- Categories include teaching, prayer and worship, discipleship, leadership,
  conference, outreach, youth and family, online programmes, and special
  ministry events.

Do not publish a street address until it is approved. `locationName` and
`locationArea` are optional so an event may be announced without inventing a
venue.

## Images

Place approved images in `src/assets` when they are imported by an Astro
component, or in a reviewed public events directory when records need string
paths. Use landscape images where possible and never add remote stock URLs.
Events without an image use the existing local ministry fallback.

## Registration and online access

Set `registrationUrl` only when registration is open and the URL is verified.
Otherwise visitors use `/plan-your-visit?event=event-slug`. The visit form
preselects valid event slugs and safely ignores invalid ones.

Set `onlineUrl` only for approved public access. Never publish a private Zoom,
Teams, Meet, or livestream URL that should be released after registration.
Restricted access instructions belong in the confirmation workflow.

## Calendar actions

`src/lib/events.ts` generates a URL-encoded Google Calendar link and RFC-style
ICS content from the confirmed event record. The event detail page provides a
downloadable, locally generated calendar file without a server endpoint.
Calendar actions are hidden for postponed and cancelled events.

## Regular programmes

Add only verified schedules to `recurringProgrammes`. Use `ACTIVE` to display a
programme and `PAUSED` to retain it without publication. When the array is
empty, the page displays the approved finalisation message.

## Programme response emails

Featured Event attendance actions and Regular Programme detail actions open an
accessible response modal. Submissions are validated by `/api/forms` as
`event-response` requests and delivered through the existing server-only Gmail
configuration: `GOOGLE_SMTP_USER`, `GOOGLE_APP_PASSWORD`, and
`FORM_DELIVERY_EMAIL`.

Never prefix these variables with `PUBLIC_`. The browser receives only a
submission reference; SMTP credentials and the delivery address remain on the
server. Do not claim a dedicated booking or payment process exists until it is
confirmed and tested.

## Past highlights

Completed or past records appear in the highlights section only when at least
one verified `recordingUrl`, `sermonUrl`, or `recapUrl` exists. Past events
never remain in the upcoming grid.

## Status changes

- `POSTPONED`: preserve the detail page, show a notice, and hide calendar and
  registration actions until the replacement date is confirmed.
- `CANCELLED`: preserve the detail page, show a cancellation notice, and hide
  invalid actions.
- `COMPLETED`: remove from upcoming lists; add verified media to create a past
  highlight.
- `FULL` or `REGISTRATION_CLOSED`: show the status and do not offer
  registration unless an approved waitlist is implemented.

Before publishing, run `npm test`, `npm run check`, and `npm run build`.
