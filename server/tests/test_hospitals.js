const assert = require('assert');
const Hospital = require('../models/Hospital');
const { calculateDistance } = require('../utils/distance');
const { app } = require('../index');

// In-memory request simulation helper
function request(app, options) {
  return new Promise((resolve, reject) => {
    const { method, url, headers = {}, body = null } = options;

    let resBody = '';
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
        resolve({ status: this.statusCode, body: resBody });
      },
    };

    try {
      app.handle(req, res);
    } catch (e) {
      reject(e);
    }
  });
}

async function runHospitalTests() {
  console.log('🧪 Starting Phase 3: Hospital Management & Admin Verification Tests...\n');

  // Test 1: Hospital Model Schema Validation
  const testHosp = new Hospital({
    name: 'Lok Nayak Hospital (LNJP)',
    address: 'Delhi Gate, New Delhi - 110002',
    phone: '+91 11 2323 3000',
    location: { lat: 28.6366, lng: 77.2410 },
    createdBy: new (require('mongoose').Types.ObjectId)(),
  });

  await testHosp.validate();
  assert.strictEqual(testHosp.verified, false, 'Hospital should be unverified by default');
  assert.strictEqual(testHosp.departments.length >= 5, true, 'Default departments should be populated');
  console.log('✅ Test 1: Hospital model schema validated (verified=false by default)');

  // Test 2: Haversine Distance Formula
  // Distance from Connaught Place (28.6315, 77.2167) to LNJP Hospital (28.6366, 77.2410)
  const dist = calculateDistance(28.6315, 77.2167, 28.6366, 77.2410);
  assert.strictEqual(dist > 2.0 && dist < 3.0, true, `Calculated distance ${dist}km is accurate for central Delhi`);
  console.log(`✅ Test 2: Haversine distance calculation verified (${dist} km)`);

  // Test 3: Public /api/hospitals/nearby endpoint responds with 200
  const Bed = require('../models/Bed');
  const originalHospitalFind = Hospital.find;
  const originalBedAggregate = Bed.aggregate;

  Hospital.find = function (query) {
    return {
      lean: () =>
        Promise.resolve([
          {
            _id: new (require('mongoose').Types.ObjectId)(),
            name: 'Lok Nayak Hospital',
            location: { lat: 28.6366, lng: 77.241 },
            verified: true,
          },
        ]),
    };
  };
  Bed.aggregate = () => Promise.resolve([{ _id: 'general', count: 10 }]);

  const nearbyRes = await request(app, { method: 'GET', url: '/api/hospitals/nearby?lat=28.6139&lng=77.2090' });
  assert.strictEqual(nearbyRes.status, 200, 'Public nearby endpoint should return 200');
  assert.strictEqual(Array.isArray(nearbyRes.body), true, 'Nearby response should be an array');
  assert.strictEqual(nearbyRes.body[0].distanceKm > 0, true, 'Distance should be computed');
  console.log('✅ Test 3: GET /api/hospitals/nearby responds 200 OK with calculated distance');

  Hospital.find = originalHospitalFind;
  Bed.aggregate = originalBedAggregate;

  // Test 4: Role protection: Patient cannot access POST /api/hospitals (expects 401 or 403)
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'carequeue_super_secret_jwt_key_2026_delhi';
  const patientToken = jwt.sign({ userId: 'patient-test', role: 'patient' }, secret);

  // Mock User findById to simulate patient user
  const User = require('../models/User');
  const originalFindById = User.findById;
  User.findById = function (id) {
    return Promise.resolve({ _id: id, role: 'patient', name: 'Test Patient' });
  };

  const patientCreateRes = await request(app, {
    method: 'POST',
    url: '/api/hospitals',
    headers: { authorization: `Bearer ${patientToken}` },
    body: { name: 'Fake Center', address: 'Nowhere', phone: '123' },
  });

  assert.strictEqual(patientCreateRes.status, 403, 'Patient role must receive 403 Forbidden on hospital creation');
  console.log('✅ Test 4: Role protection blocks unauthorized hospital creation (403)');

  // Test 5: Admin routes require admin role
  const adminRouteRes = await request(app, {
    method: 'GET',
    url: '/api/admin/hospitals',
    headers: { authorization: `Bearer ${patientToken}` },
  });
  assert.strictEqual(adminRouteRes.status, 403, 'Patient must receive 403 Forbidden on admin routes');
  console.log('✅ Test 5: Admin routes strictly reject non-admin users (403)');

  // Restore User.findById
  User.findById = originalFindById;

  console.log('\n🎉 ALL Phase 3 Hospital Management & Admin Verification tests passed successfully!');
  process.exit(0);
}

runHospitalTests().catch((err) => {
  console.error('❌ Phase 3 Test Failure:', err);
  process.exit(1);
});
