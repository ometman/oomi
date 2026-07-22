import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const root = new URL('../', import.meta.url);

async function loadValidationModule() {
  const source = await readFile(new URL('src/lib/visit-request.ts', root), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
}

const validRequest = {
  visitType: 'OFFICE_APPOINTMENT', location: 'ACCRA', appointmentPurpose: 'Partnership discussion',
  preferredDate: '2026-08-10', preferredTime: '10:00', firstName: 'Ama', lastName: 'Mensah',
  phone: '+233 20 000 0000', email: 'ama@example.com', preferredContactMethod: 'EMAIL',
  contactConsent: true, marketingConsent: false, privacyAccepted: true,
};

test('validates a complete office appointment request', async () => {
  const { validateVisitRequest } = await loadValidationModule();
  assert.equal(validateVisitRequest(validRequest).valid, true);
});

test('rejects invalid email, missing consent, and unconfirmed office location', async () => {
  const { validateVisitRequest } = await loadValidationModule();
  const result = validateVisitRequest({ ...validRequest, location: 'UNSURE', email: 'invalid', privacyAccepted: false });
  assert.equal(result.valid, false);
  assert.match(result.errors.location, /Accra or Kumasi/);
  assert.ok(result.errors.email);
  assert.ok(result.errors.privacyAccepted);
});

test('requires guardian acknowledgement when children attend', async () => {
  const { validateVisitRequest } = await loadValidationModule();
  const result = validateVisitRequest({ ...validRequest, visitType: 'IN_PERSON_EVENT', childrenAttending: 2, guardianAcknowledged: false });
  assert.ok(result.errors.guardianAcknowledged);
});

test('page contains the required sections and no fake submission success', async () => {
  const page = await readFile(new URL('src/pages/plan-your-visit.astro', root), 'utf8');
  const form = await readFile(new URL('src/components/PlanVisitForm.astro', root), 'utf8');
  for (const heading of ['Plan Your Visit', 'How would you like to connect?', 'Upcoming programmes', 'Choose a connection point', 'What to expect', 'Trust, privacy and safeguarding', 'Frequently asked questions', 'Take Your Next Step']) {
    assert.ok(page.includes(heading), `missing ${heading}`);
  }
  assert.ok(form.includes("const endpoint = '/api/forms'"));
  assert.ok(form.includes("kind: 'visit-request'"));
  assert.equal(/localStorage|sessionStorage/.test(form), false);
  assert.equal(/<input[^>]*name="marketingConsent"[^>]*\schecked(?:\s|=|>)/.test(form), false);
});
