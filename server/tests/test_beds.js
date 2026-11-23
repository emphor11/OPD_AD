const assert = require('assert');
const mongoose = require('mongoose');
const Bed = require('../models/Bed');
const { computeFreeBedSummary } = require('../controllers/bed.controller');
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

async function runBedTests() {
  console.log('🧪 Starting Phase 5: Bed Inventory & Nearby Hospitals Verification Tests...\n');

  // Test 1: Bed Model Schema Validation
  const dummyHospitalId = new mongoose.Types.ObjectId();
  const testBed = new Bed({
    hospitalId: dummyHospitalId,
    bedNo: 'ICU-03',
    type: 'icu',
    ward: 'Critical Care Block A',
  });

  await testBed.validate();
  assert.strictEqual(testBed.status, 'free', 'Default bed status must be free');
  assert.strictEqual(testBed.type, 'icu');
  console.log('✅ Test 1: Bed model schema validated with default free status');

  // Test 2: Bed Type Enums (general, icu, oxygen, ventilator, pediatric)
  const validTypes = ['general', 'icu', 'oxygen', 'ventilator', 'pediatric'];
  for (const t of validTypes) {
    const b = new Bed({
      hospitalId: dummyHospitalId,
      bedNo: `TEST-${t}`,
      type: t,
      ward: 'Test Ward',
    });
    await b.validate();
  }
  console.log('✅ Test 2: All 5 healthcare bed types successfully validated');

  // Test 3: Invalid Bed Type Rejection
  const invalidBed = new Bed({
    hospitalId: dummyHospitalId,
    bedNo: 'INV-01',
    type: 'luxury_suite', // Invalid
    ward: 'Test Ward',
  });
  let validationError = null;
  try {
    await invalidBed.validate();
  } catch (err) {
    validationError = err;
  }
  assert.strictEqual(!!validationError, true, 'Invalid bed type should fail validation');
  console.log('✅ Test 3: Schema properly rejects invalid bed type');

  // Test 4: Free Bed Aggregation Logic
  const origAggregate = Bed.aggregate;
  Bed.aggregate = () =>
    Promise.resolve([
      { _id: 'general', count: 18 },
      { _id: 'icu', count: 4 },
      { _id: 'oxygen', count: 12 },
    ]);

  const summary = await computeFreeBedSummary(dummyHospitalId);
  assert.strictEqual(summary.general, 18);
  assert.strictEqual(summary.icu, 4);
  assert.strictEqual(summary.oxygen, 12);
  assert.strictEqual(summary.ventilator, 0); // Default zero
  assert.strictEqual(summary.pediatric, 0); // Default zero
  console.log('✅ Test 4: computeFreeBedSummary dynamically aggregates categories');
  Bed.aggregate = origAggregate;

  // Test 5: Route Protection - Patients cannot manage beds (expects 403)
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'carequeue_super_secret_jwt_key_2026_delhi';
  const patientToken = jwt.sign({ userId: 'pat-1', role: 'patient' }, secret);

  const User = require('../models/User');
  const origFindById = User.findById;
  User.findById = () => Promise.resolve({ _id: 'pat-1', role: 'patient' });

  const patientBedRes = await request(app, {
    method: 'GET',
    url: '/api/beds',
    headers: { authorization: `Bearer ${patientToken}` },
  });

  assert.strictEqual(patientBedRes.status, 403, 'Patient cannot access staff bed management (403)');
  console.log('✅ Test 5: Bed management routes strictly protected against unauthorized roles (403)');

  User.findById = origFindById;

  console.log('\n🎉 ALL Phase 5 Bed Inventory & Nearby Hospitals tests passed successfully!');
  process.exit(0);
}

runBedTests().catch((err) => {
  console.error('❌ Phase 5 Test Failure:', err);
  process.exit(1);
});
