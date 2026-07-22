# Visit Request Submission Adapter

The website is statically generated and does not store visit requests. Configure `PUBLIC_VISIT_REQUEST_ENDPOINT` with an approved HTTPS service before enabling live submission.

The endpoint must accept `POST` JSON matching `PlanVisitSubmission` in `src/lib/visit-request.ts`. On success, return a 2xx response with:

```json
{ "reference": "OOM-2026-0001" }
```

The service—not the browser—must:

- repeat all validation and reject unknown enum values or fields;
- normalise input and encode output rather than rendering submitted HTML;
- enforce rate limiting and check the honeypot/abuse signals;
- generate the human-readable reference number;
- restrict prayer and pastoral requests to authorised roles;
- exclude names, contact details, messages, and prayer text from URLs, analytics, logs, and email subjects;
- record consent timestamp and source;
- apply an approved retention/deletion policy;
- return safe 4xx/5xx errors without internal exception details;
- apply appropriate origin controls and transport security.

Until this endpoint is configured and tested, the form displays an honest unavailable message and directs visitors to `hello@ometomeni.org`; it never displays a false success state.
