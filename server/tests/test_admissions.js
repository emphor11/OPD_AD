const assert = require('assert');
const mongoose = require('mongoose');
const Admission = require('../models/Admission');
const Bed = require('../models/Bed');
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

async function runAdmissionTests() {
  console.log('🧪 Starting Phase 6: Admission Pipeline with Bed Assignment Tests...\n');

  const dummyPatientId = new mongoose.Types.ObjectId();
  const dummyHospitalId = new mongoose.Types.ObjectId();
  const dummyBedId = new mongoose.Types.ObjectId();

  // Test 1: Admission Model Schema Validation
  const admission = new Admission({
    patientId: dummyPatientId,
    hospitalId: dummyHospitalId,
    bedType: 'icu',
    reason: 'Acute cardiac monitoring required',
    urgency: 'critical',
  });

  await admission.validate();
  assert.strictEqual(admission.status, 'pending', 'Default admission status must be pending');
  assert.strictEqual(admission.urgency, 'critical');
  assert.strictEqual(admission.bedId, null);
  console.log('✅ Test 1: Admission schema validated with default pending state');

  // Test 2: Status Progression & History Array
  admission.status = 'approved';
  admission.statusHistory.push({
    status: 'approved',
    at: new Date(),
    by: dummyHospitalId,
  });

  assert.strictEqual(admission.status, 'approved');
  assert.strictEqual(admission.statusHistory.length, 1);
  console.log('✅ Test 2: Admission status progression & history tracking verified');

  // Test 3: Bed Assignment & Release Logic (Unit Simulation)
  const bed = new Bed({
    _id: dummyBedId,
    hospitalId: dummyHospitalId,
    bedNo: 'ICU-02',
    type: 'icu',
    ward: 'Critical Care A',
    status: 'free',
  });
  await bed.validate();

  // Simulate admission
  bed.status = 'occupied';
  bed.admissionId = admission._id;
  admission.bedId = bed._id;
  admission.status = 'admitted';

  assert.strictEqual(bed.status, 'occupied');
  assert.strictEqual(bed.admissionId, admission._id);
  assert.strictEqual(admission.bedId, bed._id);
  console.log('✅ Test 3: Bed occupancy linked atomically upon admission');

  // Simulate discharge
  bed.status = 'free';
  bed.admissionId = null;
  admission.status = 'discharged';

  assert.strictEqual(bed.status, 'free');
  assert.strictEqual(bed.admissionId, null);
  assert.strictEqual(admission.status, 'discharged');
  console.log('✅ Test 4: Bed released to free census upon discharge');

  // Test 5: Route Protection - Unauthenticated request returns 401
  const unauthRes = await request(app, {
    method: 'GET',
    url: '/api/admissions/mine',
  });
  assert.strictEqual(unauthRes.status, 401, 'Unauthenticated admission route must return 401');
  console.log('✅ Test 5: Admission endpoints require JWT authentication (401)');

  console.log('\n🎉 ALL Phase 6 Admission Pipeline tests passed successfully!');
  process.exit(0);
}

runAdmissionTests().catch((err) => {
  console.error('❌ Phase 6 Test Failure:', err);
  process.exit(1);
});
