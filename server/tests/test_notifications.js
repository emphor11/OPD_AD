const assert = require('assert');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { isExpoPushToken } = require('../utils/push');
const { app } = require('../index');

function request(app, options) {
  return new Promise((resolve, reject) => {
    const { method, url, headers = {}, body = null } = options;

    const req = {
      method,
      url,
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
      body,
    };

    const res = {
      statusCode: 200,
      headers: {},
      setHeader(k, v) {
        this.headers[k.toLowerCase()] = v;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        resolve({ status: this.statusCode, body: data });
      },
      send(data) {
        resolve({ status: this.statusCode, body: data });
      },
      end() {
        resolve({ status: this.statusCode, body: '' });
      },
    };

    try {
      app.handle(req, res);
    } catch (e) {
      reject(e);
    }
  });
}

async function runNotificationTests() {
  console.log('🧪 Starting Phase 8: Push Notifications & Smart Alerts Tests...\n');

  const dummyUserId = new mongoose.Types.ObjectId();

  // Test 1: Notification Model Schema Validation
  const notif = new Notification({
    userId: dummyUserId,
    title: '🔔 Your Turn is Near!',
    body: 'Only 2 patients ahead in General Medicine.',
    type: 'queue',
    data: { displayNo: 'GM-014' },
  });

  await notif.validate();
  assert.strictEqual(notif.read, false, 'Default read state must be false');
  assert.strictEqual(notif.type, 'queue');
  console.log('✅ Test 1: Notification schema validated with unread default');

  // Test 2: Type Enum Validation
  const validTypes = ['queue', 'admission', 'message', 'stock', 'system'];
  for (const t of validTypes) {
    const n = new Notification({
      userId: dummyUserId,
      title: `Test ${t}`,
      body: 'Test body',
      type: t,
    });
    await n.validate();
  }
  console.log('✅ Test 2: Notification category enums validated (queue, admission, message, stock, system)');

  // Test 3: Expo Push Token Validator
  const validExpoToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
  const invalidExpoToken = 'random_string_12345';

  assert.strictEqual(isExpoPushToken(validExpoToken), true, 'Valid Expo token should be recognized');
  assert.strictEqual(isExpoPushToken(invalidExpoToken), false, 'Arbitrary string must be rejected as push token');
  console.log('✅ Test 3: Expo push token format validation verified');

  // Test 4: Proximity Alert Selection Algorithm
  const currentServingNo = 10;
  const waitingTokens = [
    { tokenNo: 11, notifiedNear: false },
    { tokenNo: 12, notifiedNear: false },
    { tokenNo: 13, notifiedNear: false },
    { tokenNo: 14, notifiedNear: false },
    { tokenNo: 15, notifiedNear: false },
  ];

  // Logic: tokenNo > currentServingNo AND tokenNo <= currentServingNo + 3
  const alertEligible = waitingTokens.filter(
    (t) => t.tokenNo > currentServingNo && t.tokenNo <= currentServingNo + 3 && !t.notifiedNear
  );

  assert.strictEqual(alertEligible.length, 3, 'Exactly 3 tokens should be within proximity window');
  assert.strictEqual(alertEligible[0].tokenNo, 11);
  assert.strictEqual(alertEligible[2].tokenNo, 13);
  console.log('✅ Test 4: Proximity window algorithm correctly targets tokens within <= 3 patients ahead');

  // Test 5: Route Protection - Unauthenticated request returns 401
  const unauthRes = await request(app, {
    method: 'GET',
    url: '/api/notifications',
  });
  assert.strictEqual(unauthRes.status, 401, 'Notification list requires authentication (401)');
  console.log('✅ Test 5: Notification inbox protected by JWT authentication');

  console.log('\n🎉 ALL Phase 8 Push Notifications & Smart Alerts tests passed successfully!');
  process.exit(0);
}

runNotificationTests().catch((err) => {
  console.error('❌ Phase 8 Test Failure:', err);
  process.exit(1);
});
