# Ministries page

Ministry and service-team content lives in `src/data/ministries.ts` and is checked by the types in `src/types/ministry.ts`. Filter definitions and volunteer opportunities have separate typed modules.

The main page preserves the established featured, directory, leadership, volunteer, application and gradient CTA sections. Detail pages are generated statically from the same data at `/ministries/[slug]`.

The application posts JSON to `/api/forms` with `kind: "ministry-interest"`. Server-side validation requires identity, email, location, preferred contact method, ministry interest, response consent and acknowledgement that placement is not guaranteed. Newsletter interest is recorded separately and does not subscribe the applicant.

Images use approved local programme artwork and the local ministry-lead portrait. Replace repeated category imagery only with approved local assets. Ministry schedules, named coordinators, vacancies and claims must be confirmed before publication.
