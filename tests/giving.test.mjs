import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'src/lib/giving.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const giving = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('giving request validation normalizes a valid gift', () => {
  const result = giving.validateGivingRequest({
    amountGhs: '125.50',
    designation: 'MISSIONS_OUTREACH',
    channel: 'MOBILE_MONEY',
    mobileMoneyProvider: 'mtn',
    mobileMoneyPhone: '024 123 4567',
    email: ' donor@example.com ',
    firstName: ' Ama ',
    consentGiven: true,
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.value, {
    amountGhs: 125.5,
    designation: 'MISSIONS_OUTREACH',
    channel: 'MOBILE_MONEY',
    givingRegion: 'LOCAL',
    email: 'donor@example.com',
    firstName: 'Ama',
    mobileMoneyPhone: '0241234567',
    mobileMoneyProvider: 'mtn',
    consentGiven: true,
    company: undefined,
  });
});

test('international giving is card-only and ready behind a server feature flag', () => {
  const card = giving.validateGivingRequest({
    amountGhs: '250',
    designation: 'PARTNERSHIP',
    channel: 'CARD',
    givingRegion: 'INTERNATIONAL',
    email: 'partner@example.com',
    consentGiven: true,
  });
  assert.equal(card.valid, true);
  assert.equal(card.value.givingRegion, 'INTERNATIONAL');

  const mobileMoney = giving.validateGivingRequest({
    amountGhs: '250',
    designation: 'PARTNERSHIP',
    channel: 'MOBILE_MONEY',
    mobileMoneyProvider: 'vod',
    mobileMoneyPhone: '0201234567',
    givingRegion: 'INTERNATIONAL',
    email: 'partner@example.com',
    consentGiven: true,
  });
  assert.equal(mobileMoney.valid, false);
  assert.equal(mobileMoney.errors.channel, 'International giving is available by card only.');
});

test('giving request validation rejects unsafe or incomplete input', () => {
  const result = giving.validateGivingRequest({
    amountGhs: '0.001',
    designation: 'MADE_UP_FUND',
    channel: 'BANK',
    email: 'not-an-email',
    consentGiven: false,
  });

  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), [
    'amountGhs',
    'channel',
    'consentGiven',
    'designation',
    'email',
  ]);
});

test('Mobile Money requires valid Ghana payment particulars', () => {
  const result = giving.validateGivingRequest({
    amountGhs: '100',
    designation: 'GENERAL_MINISTRY',
    channel: 'MOBILE_MONEY',
    email: 'donor@example.com',
    mobileMoneyProvider: '',
    mobileMoneyPhone: '123',
    consentGiven: true,
  });

  assert.equal(result.valid, false);
  assert.equal(typeof result.errors.mobileMoneyProvider, 'string');
  assert.equal(typeof result.errors.mobileMoneyPhone, 'string');
});

test('payment references accept provider-safe values only', () => {
  assert.equal(giving.validatePaymentReference('OOM-123456-abcdef12'), 'OOM-123456-abcdef12');
  assert.equal(giving.validatePaymentReference('../secret'), '');
  assert.equal(giving.validatePaymentReference('bad reference'), '');
});

test('giving UI does not publish placeholder financial details', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/give.astro'), 'utf8');
  const form = fs.readFileSync(path.join(root, 'src/components/giving/GivingForm.astro'), 'utf8');
  assert.doesNotMatch(page, /0XX|XXXX|alert\s*\(/i);
  assert.match(form, /GhanaPay/);
  assert.match(form, /Bank Transfer/);
  assert.match(form, /PayPal/);
  assert.match(form, /Coming soon/);
  assert.match(form, /data-option-panel="GHANAPAY" hidden disabled/);
  assert.match(form, /data-option-panel="BANK_TRANSFER" hidden disabled/);
  assert.match(form, /data-option-panel="CARD" hidden disabled/);
  assert.match(form, /data-option-panel="PAYPAL" hidden disabled/);
});

test('planned giving forms have documented environment configuration', () => {
  const env = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
  for (const variable of [
    'MOBILE_MONEY_ENABLED',
    'PAYSTACK_SECRET_KEY',
    'GHANAPAY_ENABLED',
    'GHANAPAY_API_KEY',
    'GHANAPAY_MERCHANT_ID',
    'BANK_TRANSFER_ENABLED',
    'PUBLIC_BANK_ACCOUNT_NUMBER',
    'CARD_GIVING_ENABLED',
    'PAYPAL_GIVING_ENABLED',
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
    'PAYPAL_WEBHOOK_ID',
  ]) {
    assert.match(env, new RegExp(`^${variable}=`, 'm'));
  }
});

test('giving requires consent and submits Mobile Money through the backend', () => {
  const form = fs.readFileSync(path.join(root, 'src/components/giving/GivingForm.astro'), 'utf8');
  const endpoint = fs.readFileSync(path.join(root, 'src/pages/api/giving/initialize.ts'), 'utf8');
  assert.match(form, /name="consentGiven"/);
  assert.doesNotMatch(form, /name="consentGiven"[^>]*checked/i);
  assert.match(form, /International giving/);
  assert.match(form, /name="givingOption"/);
  assert.match(form, /Card/);
  assert.match(form, /PayPal/);
  assert.match(form, /\/api\/giving\/initialize/);
  assert.match(form, /channel: 'MOBILE_MONEY'/);
  assert.match(form, /result\.status !== 'PENDING'/);
  assert.match(form, /name="amountChoice"/);
  assert.match(form, />Other</);
  assert.match(form, /name="mobileMoneyPhone"/);
  assert.match(form, /enter your PIN only on your phone/i);
  assert.match(endpoint, /INTERNATIONAL_GIVING_ENABLED/);
});

test('server verifies webhook signatures without exposing the secret to the client form', () => {
  const provider = fs.readFileSync(path.join(root, 'src/lib/server/giving-provider.ts'), 'utf8');
  const form = fs.readFileSync(path.join(root, 'src/components/giving/GivingForm.astro'), 'utf8');
  assert.match(provider, /createHmac\('sha512'/);
  assert.match(provider, /timingSafeEqual/);
  assert.doesNotMatch(form, /PAYSTACK_SECRET_KEY/);
});
