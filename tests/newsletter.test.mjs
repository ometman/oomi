import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const root = new URL('../', import.meta.url);

async function loadNewsletterModule() {
  const source = await readFile(new URL('src/lib/newsletter.ts', root), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
}

test('normalises a valid newsletter subscription', async () => {
  const { validateNewsletterSubscription } = await loadNewsletterModule();
  const result = validateNewsletterSubscription({
    firstName: '  Ama ', email: ' AMA@EXAMPLE.COM ', location: 'ACCRA',
    interests: ['EVENTS', 'EVENTS', 'INVALID'], consentGiven: true, source: 'HOME',
  });
  assert.equal(result.valid, true);
  assert.equal(result.value.email, 'ama@example.com');
  assert.deepEqual(result.value.interests, ['EVENTS']);
  assert.equal(result.value.source, 'HOME');
});

test('does not trust arbitrary client-provided signup sources', async () => {
  const { validateNewsletterSubscription } = await loadNewsletterModule();
  const result = validateNewsletterSubscription({ firstName: 'Ama', email: 'ama@example.com', consentGiven: true, source: 'PRAYER_REQUEST' });
  assert.equal(result.value.source, 'WEBSITE');
});

test('rejects invalid email and missing consent', async () => {
  const { validateNewsletterSubscription } = await loadNewsletterModule();
  const result = validateNewsletterSubscription({ firstName: 'Ama', email: 'invalid', consentGiven: false });
  assert.equal(result.valid, false);
  assert.ok(result.errors.email);
  assert.ok(result.errors.consentGiven);
});

test('accepts only random unsubscribe token format', async () => {
  const { validateUnsubscribeToken } = await loadNewsletterModule();
  assert.equal(validateUnsubscribeToken('a'.repeat(64)), 'a'.repeat(64));
  assert.equal(validateUnsubscribeToken('person@example.com'), '');
});

test('signup consent is not preselected and client code contains no newsletter secrets', async () => {
  const component = await readFile(new URL('src/components/newsletter/NewsletterSignup.astro', root), 'utf8');
  assert.equal(/name="consentGiven"[^>]*\schecked(?:\s|=|>)/.test(component), false);
  assert.equal(component.includes('NEWSLETTER_WEBHOOK_SECRET'), false);
  assert.equal(component.includes('GOOGLE_APPS_SCRIPT_NEWSLETTER_URL'), false);
  for (const path of ['src/pages/index.astro', 'src/components/Footer.astro', 'src/pages/events.astro', 'src/pages/sermons.astro', 'src/components/PlanVisitForm.astro']) {
    assert.ok((await readFile(new URL(path, root), 'utf8')).includes('NewsletterSignup'), `missing newsletter component in ${path}`);
  }
});

test('Apps Script gates campaigns and excludes inactive subscribers', async () => {
  const script = await readFile(new URL('integrations/google-apps-script/newsletter.gs', root), 'utf8');
  assert.ok(script.includes("row[6] === 'ACTIVE'"));
  assert.ok(script.includes("campaign.approvedStatus !== 'APPROVED'"));
  assert.ok(script.includes("'DRAFT', 'NOT_APPROVED'"));
  assert.ok(script.includes("status: 'DUPLICATE'"));
  assert.ok(script.includes('MailApp.sendEmail'));
  assert.equal(/bcc\s*:|cc\s*:/i.test(script), false);
});
