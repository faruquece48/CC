const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');

function load(file, dependencies) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { exports, require: (name) => dependencies[name] || require(name),
    process: { env: { ADMIN_PASSWORD: 'test-password', GMAIL_USER: 'test@example.com', GMAIL_APP_PASSWORD: 'test' } },
    Buffer, URL, console: { error() {} } });
  return exports;
}
const validation = load('lib/messageBatch.ts', {});
const id = '11111111-1111-4111-8111-111111111111';
const email = 'participant@example.com';
function fixture(options = {}) {
  const batch = { id, subject: 'Saved subject', message: 'Saved message', includeSchedule: false, remaining: [email], sent: 462 };
  const calls = { mail: [], finish: [], imports: 0 };
  const route = load('app/api/participant-message/route.ts', {
    'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status || 200 }) } },
    '@vercel/postgres': { sql: async () => ({ rows: [{ normalized_email: email, email, name: 'Participant' }] }) },
    '@/lib/participantName': { formatParticipantName: (name) => name },
    '@/lib/participantMessageEmail': { buildParticipantMessageEmail: () => ({ text: 'message' }) },
    '@/lib/messageBatch': validation,
    '@/lib/messageBatchStore': {
      validBatchId: (value) => value === id,
      loadMessageBatch: async () => batch,
      importMessageBatch: async () => { calls.imports++; return batch; },
      claimMessageRecipient: async () => options.claim !== false,
      finishMessageRecipient: async (...args) => { calls.finish.push(args); return batch; },
    },
    nodemailer: { createTransport: () => ({ sendMail: async (data) => {
      calls.mail.push(data);
      if (options.failure) throw options.failure;
    } }) },
  });
  return { batch, calls, post: (body) => route.POST({ url: 'https://example.com/api/participant-message', json: async () => ({ password: 'test-password', ...body }) }) };
}

test('saving legacy progress sends no email and preserves the sent count', async () => {
  const f = fixture();
  const result = await f.post({ action: 'save-batch', batch: f.batch });
  assert.equal(result.status, 200);
  assert.equal(result.body.batch.sent, 462);
  assert.equal(f.calls.imports, 1);
  assert.equal(f.calls.mail.length, 0);
});
test('online batch access requires authentication', async () => {
  const f = fixture();
  assert.equal((await f.post({ action: 'load-batch', password: 'wrong' })).status, 401);
});
test('send uses immutable saved content and records successful delivery', async () => {
  const f = fixture();
  assert.equal((await f.post({ action: 'send', batchId: id, email, subject: 'Changed subject' })).status, 200);
  assert.equal(f.calls.mail[0].subject, 'Saved subject');
  assert.deepEqual(f.calls.finish[0], [id, email, true]);
});
test('already completed recipient is not sent again', async () => {
  const f = fixture(); f.batch.remaining = [];
  assert.equal((await f.post({ action: 'send', batchId: id, email })).status, 200);
  assert.equal(f.calls.mail.length, 0);
});
test('concurrent claim does not send an email', async () => {
  const f = fixture({ claim: false });
  assert.equal((await f.post({ action: 'send', batchId: id, email })).status, 409);
  assert.equal(f.calls.mail.length, 0);
});
test('SMTP rejection releases recipient for retry', async () => {
  const f = fixture({ failure: { responseCode: 550, response: 'daily sending limit' } });
  assert.equal((await f.post({ action: 'send', batchId: id, email })).status, 500);
  assert.deepEqual(f.calls.finish[0], [id, email, false]);
});
test('ambiguous timeout keeps recipient locked for review', async () => {
  const f = fixture({ failure: { code: 'ETIMEDOUT' } });
  assert.equal((await f.post({ action: 'send', batchId: id, email })).status, 500);
  assert.equal(f.calls.finish.length, 0);
});
test('invalid imported batch is rejected', async () => {
  const f = fixture();
  assert.equal((await f.post({ action: 'save-batch', batch: { ...f.batch, sent: -1 } })).status, 400);
  assert.equal(validation.isMessageBatch({ ...f.batch, remaining: [email, email] }), false);
});
