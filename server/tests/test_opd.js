const assert = require('assert');
const mongoose = require('mongoose');
const OpdSession = require('../models/OpdSession');
const Token = require('../models/Token');
const { formatDisplayNo } = require('../controllers/token.controller');
const { calculateWaitTime } = require('../../app/src/utils/waitTime');
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

async function runOpdTests() {
  console.log('🧪 Starting Phase 4: OPD Token Engine & Queuing Logic Tests...\n');

  // Test 1: Display Number Formatting
  assert.strictEqual(formatDisplayNo('GM', 1), 'GM-001');
  assert.strictEqual(formatDisplayNo('PED', 17), 'PED-017');
  assert.strictEqual(formatDisplayNo('ORTHO', 105), 'ORTHO-105');
  console.log('✅ Test 1: Token display number formatting verified (e.g. GM-001, PED-017)');

  // Test 2: OpdSession Model Validation
  const dummyHospitalId = new mongoose.Types.ObjectId();
  const dummyUserId = new mongoose.Types.ObjectId();

  const session = new OpdSession({
    hospitalId: dummyHospitalId,
    departmentCode: 'GM',
    date: '2026-11-23',
    openedBy: dummyUserId,
  });

  await session.validate();
  assert.strictEqual(session.status, 'open');
  assert.strictEqual(session.currentTokenNo, 0);
  assert.strictEqual(session.lastTokenNo, 0);
  console.log('✅ Test 2: OpdSession schema validated with default counters');

  // Test 3: Token Model Validation
  const token = new Token({
    sessionId: session._id,
    hospitalId: dummyHospitalId,
    departmentCode: 'GM',
    patientId: dummyUserId,
    tokenNo: 14,
    displayNo: 'GM-014',
  });

  await token.validate();
  assert.strictEqual(token.status, 'waiting');
  assert.strictEqual(token.notifiedNear, false);
  console.log('✅ Test 3: Token schema validated with default waiting status');

  // Test 4: Queue Position & Wait Time Calculation
  // Simulate 5 waiting tokens ahead of patient token #6
  const tokensAhead = [1, 2, 3, 4, 5];
  const positionAhead = tokensAhead.length; // 5 patients
  const avgConsultMins = 8;
  const estimatedWait = calculateWaitTime(positionAhead, avgConsultMins);

  assert.strictEqual(positionAhead, 5);
  assert.strictEqual(estimatedWait, 40, '5 patients * 8 mins should equal 40 mins wait time');
  console.log(`✅ Test 4: Dynamic wait time formula verified (${positionAhead} patients ahead = ${estimatedWait} mins)`);

  // Test 5: Route Protection - Unauthenticated POST /api/tokens returns 401
  const unauthRes = await request(app, {
    method: 'POST',
    url: '/api/tokens',
    body: { sessionId: String(session._id) },
  });
  assert.strictEqual(unauthRes.status, 401, 'Unauthenticated token booking must return 401');
  console.log('✅ Test 5: Token booking requires valid JWT (401)');

  // Test 6: Route Protection - Patient cannot open OPD sessions (expects 403)
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'carequeue_super_secret_jwt_key_2026_delhi';
  const patientJwt = jwt.sign({ userId: 'pat-1', role: 'patient' }, secret);

  const User = require('../models/User');
  const origFindById = User.findById;
  User.findById = () => Promise.resolve({ _id: 'pat-1', role: 'patient' });

  const patientOpenRes = await request(app, {
    method: 'POST',
    url: '/api/opd/sessions',
    headers: { authorization: `Bearer ${patientJwt}` },
    body: { departmentCode: 'GM' },
  });

  assert.strictEqual(patientOpenRes.status, 403, 'Patient cannot open sessions (403)');
  console.log('✅ Test 6: Staff-only OPD session control strictly protected (403)');

  User.findById = origFindById;

  console.log('\n🎉 ALL Phase 4 OPD Token Engine & Queuing tests passed successfully!');
  process.exit(0);
}

runOpdTests().catch((err) => {
  console.error('❌ Phase 4 Test Failure:', err);
  process.exit(1);
});
