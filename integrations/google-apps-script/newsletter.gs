/** Omet Omeni Ministries newsletter automation. Deploy as an Apps Script web app. */
const SHEETS = {
  subscribers: 'Subscribers',
  campaigns: 'Campaigns',
  emailLog: 'Email Log',
};

const SUBSCRIBER_HEADERS = ['ID', 'First Name', 'Email', 'WhatsApp', 'Location', 'Interests', 'Status', 'Source', 'Consent Given', 'Consent Timestamp', 'Subscribed At', 'Unsubscribed At', 'Unsubscribe Token', 'Last Email Sent At'];
const CAMPAIGN_HEADERS = ['Campaign ID', 'Campaign Name', 'Subject', 'Preview Text', 'Audience Filter', 'HTML Body', 'Text Body', 'Status', 'Approved Status', 'Scheduled Date', 'Sent Date', 'Total Recipients', 'Successful Sends', 'Failed Sends', 'Created By', 'Approved By', 'Started At', 'Completed At'];
const LOG_HEADERS = ['Campaign ID', 'Subscriber ID', 'Email', 'Status', 'Sent At', 'Error Category', 'Retry Count'];
const LOCATIONS = ['ACCRA', 'KUMASI', 'ONLINE', 'OTHER'];
const INTERESTS = ['SERMONS_TEACHINGS', 'PRAYER_PROGRAMMES', 'EVENTS', 'LEADERSHIP_RESOURCES', 'DISCIPLESHIP', 'GENERAL_UPDATES'];

function setupNewsletterSheets() {
  const spreadsheetId = requiredProperty_('NEWSLETTER_SPREADSHEET_ID');
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  ensureSheet_(spreadsheet, SHEETS.subscribers, SUBSCRIBER_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.campaigns, CAMPAIGN_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.emailLog, LOG_HEADERS);
  createNewsletterMenu_();
}

function onOpen() { createNewsletterMenu_(); }

function createNewsletterMenu_() {
  try {
    SpreadsheetApp.getUi().createMenu('Newsletter')
      .addItem('Set up sheets', 'setupNewsletterSheets')
      .addItem('Process approved campaigns', 'processApprovedCampaigns')
      .addItem('Retry eligible failures', 'retryFailedCampaignEmails')
      .addItem('Install 5-minute campaign trigger', 'installNewsletterTrigger')
      .addToUi();
  } catch (_) { /* The web-app context has no spreadsheet UI. */ }
}

function doPost(event) {
  try {
    const request = JSON.parse((event && event.postData && event.postData.contents) || '{}');
    if (!safeEqual_(String(request.secret || ''), requiredProperty_('NEWSLETTER_WEBHOOK_SECRET'))) return response_({ ok: false, error: 'Unauthorized' });
    if (request.action === 'subscribe') return response_({ ok: true, data: subscribe_(request.payload || {}) });
    if (request.action === 'unsubscribe') return response_({ ok: true, data: unsubscribe_(request.payload || {}) });
    return response_({ ok: false, error: 'Unsupported action' });
  } catch (error) {
    console.error('Newsletter request failed: ' + safeErrorCategory_(error));
    return response_({ ok: false, error: 'Request failed' });
  }
}

function subscribe_(input) {
  const subscriber = validateSubscriber_(input);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  let result;
  try {
    const sheet = getSheet_(SHEETS.subscribers);
    const rows = sheet.getDataRange().getValues();
    const existingIndex = rows.findIndex((row, index) => index > 0 && normaliseEmail_(row[2]) === subscriber.email);
    if (existingIndex > 0 && rows[existingIndex][6] === 'ACTIVE') return { status: 'DUPLICATE' };
    const now = new Date().toISOString();
    const token = randomToken_();
    const row = [
      existingIndex > 0 ? rows[existingIndex][0] : Utilities.getUuid(), subscriber.firstName, subscriber.email,
      subscriber.whatsapp, subscriber.location, subscriber.interests.join(','), 'ACTIVE', subscriber.source,
      true, now, now, '', token, '',
    ];
    if (existingIndex > 0) {
      sheet.getRange(existingIndex + 1, 1, 1, row.length).setValues([row]);
      result = { status: 'REACTIVATED', subscriber: rowToSubscriber_(row) };
    } else {
      sheet.appendRow(row);
      result = { status: 'ACTIVE', subscriber: rowToSubscriber_(row) };
    }
  } finally { lock.releaseLock(); }

  // Storage succeeds before welcome delivery is attempted. A failure is logged without exposing it to the subscriber.
  try {
    sendWelcomeEmail_(result.subscriber);
    updateSubscriberLastSent_(result.subscriber.id);
    logEmail_('WELCOME', result.subscriber.id, result.subscriber.email, 'SENT', '', 0);
  } catch (error) {
    logEmail_('WELCOME', result.subscriber.id, result.subscriber.email, 'FAILED', safeErrorCategory_(error), 0);
  }
  return { status: result.status };
}

function unsubscribe_(input) {
  const token = String(input.token || '').trim();
  if (!/^[a-f0-9]{64}$/i.test(token)) throw new Error('INVALID_TOKEN');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_(SHEETS.subscribers);
    const rows = sheet.getDataRange().getValues();
    const index = rows.findIndex((row, rowIndex) => rowIndex > 0 && String(row[12]) === token);
    if (index < 1) throw new Error('TOKEN_NOT_FOUND');
    if (rows[index][6] === 'UNSUBSCRIBED') return { status: 'ALREADY_UNSUBSCRIBED' };
    sheet.getRange(index + 1, 7).setValue('UNSUBSCRIBED');
    sheet.getRange(index + 1, 12).setValue(new Date().toISOString());
    return { status: 'UNSUBSCRIBED' };
  } finally { lock.releaseLock(); }
}

function processApprovedCampaigns() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const sheet = getSheet_(SHEETS.campaigns);
    const rows = sheet.getDataRange().getValues();
    const now = new Date();
    rows.slice(1).forEach((row, offset) => {
      const status = String(row[7]);
      const approved = String(row[8]).toUpperCase() === 'APPROVED';
      const scheduled = row[9] ? new Date(row[9]) : now;
      if (approved && ['APPROVED', 'SENDING'].includes(status) && scheduled <= now) sendCampaignBatch_(sheet, offset + 2, row);
    });
  } finally { lock.releaseLock(); }
}

function sendCampaignBatch_(campaignSheet, rowNumber, campaignRow) {
  const campaign = campaignFromRow_(campaignRow);
  if (campaign.approvedStatus !== 'APPROVED') throw new Error('CAMPAIGN_NOT_APPROVED');
  campaignSheet.getRange(rowNumber, 8).setValue('SENDING');
  if (!campaign.startedAt) campaignSheet.getRange(rowNumber, 17).setValue(new Date().toISOString());
  const alreadyAttempted = campaignLogKeys_(campaign.id);
  const subscribers = activeSubscribers_().filter((subscriber) => matchesAudience_(subscriber, campaign.audienceFilter));
  const pending = subscribers.filter((subscriber) => !alreadyAttempted.has(subscriber.id));
  const batchSize = Math.min(Number(PropertiesService.getScriptProperties().getProperty('NEWSLETTER_BATCH_SIZE') || 40), 75);
  let success = Number(campaign.successfulSends || 0);
  let failed = Number(campaign.failedSends || 0);

  pending.slice(0, batchSize).forEach((subscriber) => {
    if (MailApp.getRemainingDailyQuota() < 1) return;
    try {
      sendCampaignEmail_(campaign, subscriber);
      success += 1;
      updateSubscriberLastSent_(subscriber.id);
      logEmail_(campaign.id, subscriber.id, subscriber.email, 'SENT', '', 0);
    } catch (error) {
      failed += 1;
      logEmail_(campaign.id, subscriber.id, subscriber.email, 'FAILED', safeErrorCategory_(error), 0);
    }
  });

  campaignSheet.getRange(rowNumber, 12, 1, 3).setValues([[subscribers.length, success, failed]]);
  const remaining = pending.length - Math.min(pending.length, batchSize);
  if (remaining > 0 && MailApp.getRemainingDailyQuota() > 0) {
    scheduleContinuation_();
  } else if (remaining === 0) {
    const finished = new Date().toISOString();
    campaignSheet.getRange(rowNumber, 8).setValue('SENT');
    campaignSheet.getRange(rowNumber, 11).setValue(finished);
    campaignSheet.getRange(rowNumber, 18).setValue(finished);
  }
}

function retryFailedCampaignEmails() {
  const logSheet = getSheet_(SHEETS.emailLog);
  const logs = logSheet.getDataRange().getValues();
  const eligibleCampaigns = new Set();
  logs.slice(1).forEach((row, offset) => {
    if (row[3] === 'RETRY' && Number(row[6]) < 2) {
      eligibleCampaigns.add(row[0]);
      logSheet.getRange(offset + 2, 7).setValue(Number(row[6]) + 1);
    }
  });
  if (!eligibleCampaigns.size) return;
  const campaignSheet = getSheet_(SHEETS.campaigns);
  const campaigns = campaignSheet.getDataRange().getValues();
  campaigns.slice(1).forEach((row, offset) => {
    if (eligibleCampaigns.has(row[0]) && row[8] === 'APPROVED') campaignSheet.getRange(offset + 2, 8).setValue('SENDING');
  });
  processApprovedCampaigns();
}

function installNewsletterTrigger() {
  const exists = ScriptApp.getProjectTriggers().some((trigger) => trigger.getHandlerFunction() === 'processApprovedCampaigns');
  if (!exists) ScriptApp.newTrigger('processApprovedCampaigns').timeBased().everyMinutes(5).create();
}

function createAiCampaignDraft(input) {
  const endpoint = requiredProperty_('AI_DRAFT_ENDPOINT');
  const apiKey = requiredProperty_('AI_API_KEY');
  const prompt = buildNewsletterDraftPrompt_(input || {});
  const response = UrlFetchApp.fetch(endpoint, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + apiKey },
    payload: JSON.stringify({ prompt: prompt }),
  });
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) throw new Error('AI_PROVIDER_ERROR');
  const draft = JSON.parse(response.getContentText());
  if (!draft.subject || !draft.previewText || !draft.htmlBody || !draft.textBody) throw new Error('INVALID_AI_DRAFT');
  const id = Utilities.getUuid();
  getSheet_(SHEETS.campaigns).appendRow([
    id, String(input.campaignName || 'AI-assisted draft'), String(draft.subject), String(draft.previewText),
    JSON.stringify(input.audienceFilter || {}), sanitiseDraftHtml_(String(draft.htmlBody)), String(draft.textBody),
    'DRAFT', 'NOT_APPROVED', '', '', 0, 0, 0, Session.getActiveUser().getEmail(), '', '', '',
  ]);
  return id; // AI output can only enter DRAFT and cannot be sent until a human marks it APPROVED.
}

function buildNewsletterDraftPrompt_(input) {
  return `You are assisting Omet Omeni Ministries, a Christ-centred Christian ministry with an online focus and offices in Accra and Kumasi.
Draft a clear, warm and biblically responsible newsletter.
Audience: ${String(input.audience || '')}
Main theme: ${String(input.theme || '')}
Scripture: ${String(input.scripture || '')}
Updates: ${String(input.updates || '')}
Events: ${String(input.events || '')}
Call to action: ${String(input.callToAction || '')}
Tone: pastoral, hopeful, clear and non-manipulative
Length: ${String(input.length || 'short')}
Do not invent dates, testimonies, miracles or statistics. Do not promise guaranteed healing, prophecy or financial breakthrough. Do not pressure readers to give. Preserve supplied dates exactly. Return JSON with subject, previewText, htmlBody and textBody.`;
}

function sendWelcomeEmail_(subscriber) {
  const unsubscribeUrl = publicUnsubscribeUrl_(subscriber.unsubscribeToken);
  const greeting = 'Hello ' + subscriber.firstName + ',';
  const text = `${greeting}\n\nThank you for connecting with Omet Omeni Ministries.\n\nYou will receive selected ministry updates, biblical teachings, prayer programmes, events and online ministry opportunities based on your preferences.\n\nOmet Omeni Ministries serves through online ministry and selected activities in Accra and Kumasi.\n\nYou may unsubscribe at any time: ${unsubscribeUrl}\n\nWith grace,\nOmet Omeni Ministries`;
  sendIndividualEmail_(subscriber.email, 'Welcome to Omet Omeni Ministries', text, emailHtml_({ greeting: greeting, previewText: 'Thank you for connecting with Omet Omeni Ministries.', bodyHtml: '<p>Thank you for connecting with Omet Omeni Ministries.</p><p>You will receive selected ministry updates, biblical teachings, prayer programmes, events and online ministry opportunities based on your preferences.</p><p>Omet Omeni Ministries serves through online ministry and selected activities in Accra and Kumasi.</p>', unsubscribeUrl: unsubscribeUrl }));
}

function sendCampaignEmail_(campaign, subscriber) {
  const unsubscribeUrl = publicUnsubscribeUrl_(subscriber.unsubscribeToken);
  const greeting = 'Hello ' + subscriber.firstName + ',';
  const text = `${greeting}\n\n${campaign.textBody}\n\nUnsubscribe: ${unsubscribeUrl}`;
  const html = emailHtml_({ greeting: greeting, previewText: campaign.previewText, bodyHtml: campaign.htmlBody, unsubscribeUrl: unsubscribeUrl });
  sendIndividualEmail_(subscriber.email, campaign.subject, text, html);
}

function sendIndividualEmail_(recipient, subject, text, html) {
  if (PropertiesService.getScriptProperties().getProperty('NEWSLETTER_SENDING_DISABLED') === 'true') throw new Error('SENDING_DISABLED');
  if (MailApp.getRemainingDailyQuota() < 1) throw new Error('GMAIL_QUOTA');
  MailApp.sendEmail({
    to: recipient, subject: subject, body: text, htmlBody: html,
    name: PropertiesService.getScriptProperties().getProperty('NEWSLETTER_FROM_NAME') || 'Omet Omeni Ministries',
    replyTo: PropertiesService.getScriptProperties().getProperty('NEWSLETTER_REPLY_TO') || 'hello@ometomeni.org',
  });
}

function emailHtml_(data) {
  return `<!doctype html><html><body style="margin:0;background:#f5f7fa;font-family:Arial,sans-serif;color:#172033"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml_(data.previewText)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" style="max-width:640px;background:#fff;border-radius:12px"><tr><td style="padding:28px;background:#075985;color:#fff;border-radius:12px 12px 0 0"><strong style="font-size:22px">Omet Omeni Ministries</strong></td></tr><tr><td style="padding:32px;line-height:1.65"><p>${escapeHtml_(data.greeting)}</p>${sanitiseDraftHtml_(data.bodyHtml)}<p>With grace,<br>Omet Omeni Ministries</p></td></tr><tr><td style="padding:22px 32px;background:#f0f4f8;font-size:12px;color:#52606d"><p>Online ministry with selected activities in Accra and Kumasi. Contact: hello@ometomeni.org</p><p>You received this because you subscribed to ministry updates. <a href="${escapeAttribute_(data.unsubscribeUrl)}">Unsubscribe</a>.</p></td></tr></table></td></tr></table></body></html>`;
}

function validateSubscriber_(input) {
  const firstName = String(input.firstName || '').trim().slice(0, 80);
  const email = normaliseEmail_(input.email);
  const whatsapp = String(input.whatsapp || '').trim().slice(0, 30);
  const location = String(input.location || '').trim();
  const interests = Array.isArray(input.interests) ? [...new Set(input.interests.filter((item) => INTERESTS.includes(String(item))))] : [];
  if (!firstName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || input.consentGiven !== true) throw new Error('VALIDATION');
  if (location && !LOCATIONS.includes(location)) throw new Error('VALIDATION');
  return { firstName: firstName, email: email, whatsapp: whatsapp, location: location, interests: interests, source: String(input.source || 'WEBSITE').slice(0, 80) };
}

function activeSubscribers_() {
  return getSheet_(SHEETS.subscribers).getDataRange().getValues().slice(1).filter((row) => row[6] === 'ACTIVE').map(rowToSubscriber_);
}

function rowToSubscriber_(row) { return { id: row[0], firstName: row[1], email: row[2], whatsapp: row[3], location: row[4], interests: String(row[5] || '').split(',').filter(Boolean), status: row[6], unsubscribeToken: row[12] }; }
function campaignFromRow_(row) { return { id: row[0], name: row[1], subject: row[2], previewText: row[3], audienceFilter: parseJson_(row[4], {}), htmlBody: row[5], textBody: row[6], status: row[7], approvedStatus: row[8], successfulSends: row[12], failedSends: row[13], startedAt: row[16] }; }
function matchesAudience_(subscriber, filter) { return (!filter.location || filter.location === subscriber.location) && (!filter.interest || subscriber.interests.includes(filter.interest)); }
function campaignLogKeys_(campaignId) { return new Set(getSheet_(SHEETS.emailLog).getDataRange().getValues().slice(1).filter((row) => row[0] === campaignId && row[3] !== 'RETRY').map((row) => row[1])); }
function logEmail_(campaignId, subscriberId, email, status, errorCategory, retryCount) { getSheet_(SHEETS.emailLog).appendRow([campaignId, subscriberId, email, status, new Date().toISOString(), errorCategory, retryCount]); }
function updateSubscriberLastSent_(subscriberId) { const sheet = getSheet_(SHEETS.subscribers); const values = sheet.getDataRange().getValues(); const index = values.findIndex((row, i) => i > 0 && row[0] === subscriberId); if (index > 0) sheet.getRange(index + 1, 14).setValue(new Date().toISOString()); }
function publicUnsubscribeUrl_(token) { return (PropertiesService.getScriptProperties().getProperty('PUBLIC_SITE_URL') || 'https://ometomeni.org').replace(/\/$/, '') + '/unsubscribe?token=' + encodeURIComponent(token); }
function scheduleContinuation_() { installNewsletterTrigger(); }
function randomToken_() { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid() + new Date().getTime()).map((byte) => (byte + 256).toString(16).slice(-2)).join(''); }
function normaliseEmail_(value) { return String(value || '').trim().toLowerCase().slice(0, 254); }
function sanitiseDraftHtml_(html) { return String(html || '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+\s*=\s*(["']).*?\1/gi, '').replace(/javascript:/gi, ''); }
function escapeHtml_(value) { return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
function escapeAttribute_(value) { return escapeHtml_(value); }
function safeErrorCategory_(error) { const message = String(error && error.message || error || 'UNKNOWN'); return ['GMAIL_QUOTA', 'SENDING_DISABLED', 'VALIDATION', 'TOKEN_NOT_FOUND', 'AI_PROVIDER_ERROR'].includes(message) ? message : 'PROVIDER_ERROR'; }
function safeEqual_(left, right) { if (left.length !== right.length) return false; let mismatch = 0; for (let i = 0; i < left.length; i += 1) mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i); return mismatch === 0; }
function parseJson_(value, fallback) { try { return JSON.parse(String(value || '')); } catch (_) { return fallback; } }
function requiredProperty_(name) { const value = PropertiesService.getScriptProperties().getProperty(name); if (!value) throw new Error('MISSING_CONFIGURATION'); return value; }
function getSheet_(name) { const sheet = SpreadsheetApp.openById(requiredProperty_('NEWSLETTER_SPREADSHEET_ID')).getSheetByName(name); if (!sheet) throw new Error('MISSING_SHEET'); return sheet; }
function ensureSheet_(spreadsheet, name, headers) { const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name); if (sheet.getLastRow() === 0) sheet.appendRow(headers); sheet.setFrozenRows(1); }
function response_(body) { return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON); }
