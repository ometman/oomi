# Form Delivery on Vercel

The public pages remain statically generated. `/api/forms` runs on demand through the Astro Vercel adapter and sends validated submissions to Google Mail with Nodemailer.

Configure these server-only environment variables in Vercel for Preview and Production:

```text
GOOGLE_SMTP_USER=hello@ometomeni.org
GOOGLE_APP_PASSWORD=<Google app password>
FORM_DELIVERY_EMAIL=hello@ometomeni.org
```

Never prefix these variables with `PUBLIC_` or commit the app password. Enable 2-Step Verification on the sending Google account, create an app password, and paste it directly into Vercel. Some Google Workspace policies disable app passwords; in that case, enable them for this account or migrate the transport to Workspace SMTP relay or OAuth.

The endpoint accepts `POST` JSON for contact, ministry-interest, and `PlanVisitSubmission` requests. On success it returns:

```json
{ "reference": "OOM-2026-A1B2C3D4" }
```

The server:

- repeats validation and rejects unsupported request types;
- generates fixed subjects that contain no visitor names or sensitive request text;
- sends visitor details only in the email body;
- applies same-origin checks, a honeypot, and basic rate limiting;
- generates a non-sequential reference;
- returns safe errors without internal exception details;
- relies on the ministry's approved Google Mail access and retention policy.

The in-memory rate limit can reset between Vercel function instances. Add a shared rate-limit store or Vercel Firewall rules before high-volume promotion. After deploying Preview, submit each form and verify its subject, reply-to address, restricted prayer access, and reference number.
