# Repository Guidelines

## Ministry Context

Omet Omeni Ministries is an online-first Christian ministry supported by Accra and Kumasi offices. Its public promise is biblically responsible teaching, prayer, prophetic encouragement, leadership development, and spiritual formation. Apply the **Triple A** model to every feature:

- **Attraction:** help people discover the ministry and understand its purpose.
- **Atmosphere:** provide a consistent, accessible, professional, and spiritually healthy experience.
- **Attention:** give people safe next steps into prayer, care, discipleship, events, partnership, and service.

Content should lead from digital discovery to meaningful engagement, not pursue audience size alone. Maintain one ministry identity while supporting location-specific Accra and Kumasi content. Require review before publishing doctrine, prophecy, testimonies, medical claims, crisis-sensitive material, or financial appeals. Never use sensational, manipulative, or humiliating language.

## Project Structure & Module Organization

This Astro 5 static site uses Tailwind CSS. Routes live in `src/pages/`, shared UI in `src/components/`, document metadata in `src/layouts/Layout.astro`, bundled media in `src/assets/`, and fixed public files in `public/`. Integrations are configured in `astro.config.mjs`; design tokens are in `tailwind.config.mjs`. Do not commit `dist/`, `.astro/`, or `node_modules/`.

## Build, Test, and Development Commands

- `npm install` installs locked dependencies.
- `npm run dev` starts Astro's local server with hot reload.
- `npm run build` generates `dist/` and must pass before review.
- `npm run preview` serves the production build locally.
- `npx astro check` performs Astro and TypeScript diagnostics.

## Coding Style & Naming Conventions

Use two-space indentation. Name components in PascalCase (`Header.astro`) and routes in kebab-case (`plan-your-visit.astro`). Prefer semantic HTML, labelled controls, descriptive links, captions or summaries for teaching media, and visible keyboard focus. Reuse existing Tailwind tokens and shared components.

## Testing Guidelines

No automated test framework is configured. Run `npm run build` and `npx astro check`, then inspect affected pages at mobile and desktop widths. Verify navigation, keyboard access, links, forms, and media. Name future tests `*.test.ts`.

## Commit & Pull Request Guidelines

Use short, imperative commit summaries. Keep commits focused. Pull requests must explain the visitor outcome, list validation, link issues, include screenshots for visual changes, and identify unconfirmed ministry information.

## Security & Configuration

Never commit credentials, prayer requests, counselling details, or donor data. Use consent-based collection, role-based access, and environment variables. Prayer and care workflows require classification, confidentiality, safeguarding escalation, and appropriate professional referral. Do not claim forms, payments, or subscriptions work until their backend and failure handling are verified.
