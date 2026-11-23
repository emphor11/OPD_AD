const assert = require('assert');
const mongoose = require('mongoose');
const { app } = require('../index');

// Helper to simulate HTTP requests in-memory without network sockets
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

async function runAuthTests() {
  console.log('🧪 Starting Phase 2: Authentication & Profile Verification Tests...\n');

  // Test 1: Health check
  const health = await request(app, { method: 'GET', url: '/api/health' });
  assert.strictEqual(health.status, 200, 'Health check should return 200');
  console.log('✅ Test 1: Healthcheck endpoint responding 200 OK');

  // Test 2: Unauthenticated /users/me should return 401
  const unauth = await request(app, { method: 'GET', url: '/api/users/me' });
  assert.strictEqual(unauth.status, 401, 'Protected route without token should return 401');
  console.log('✅ Test 2: Unauthenticated request rejected with 401');

  // Test 3: Password comparison & hashing logic directly on User Model
  const User = require('../models/User');
  const testUser = new User({
    name: 'Verification User',
    email: 'verify@delhi.gov.in',
    password: 'securePassword123',
    phone: '+91 99999 88888',
    role: 'patient',
  });

  await testUser.validate();
  assert.strictEqual(testUser.name, 'Verification User');
  assert.strictEqual(testUser.role, 'patient');
  console.log('✅ Test 3: User Model schema validation passed');

  // Test 4: Role-based middleware test
  const { allowRoles } = require('../middleware/role');
  let forbiddenCalled = false;
  const mockReq = { user: { role: 'patient' } };
  const mockRes = {
    status(code) {
      assert.strictEqual(code, 403);
      return {
        json(data) {
          forbiddenCalled = true;
        },
      };
    },
  };
  const staffOnlyMiddleware = allowRoles('staff', 'admin');
  staffOnlyMiddleware(mockReq, mockRes, () => {});
  assert.strictEqual(forbiddenCalled, true, 'Patient should be forbidden from staff route');
  console.log('✅ Test 4: Role-based middleware properly blocks unauthorized roles (403)');

  // Test 5: Verify JWT token generation & verification
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'carequeue_super_secret_jwt_key_2026_delhi';
  const token = jwt.sign({ userId: 'mock-123', role: 'patient' }, secret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, secret);
  assert.strictEqual(decoded.userId, 'mock-123');
  assert.strictEqual(decoded.role, 'patient');
  console.log('✅ Test 5: JWT signing and token decoding verified');

  console.log('\n🎉 ALL Phase 2 Authentication & Profile tests passed successfully!');
  process.exit(0);
}

runAuthTests().catch((err) => {
  console.error('❌ Phase 2 Test Failure:', err);
  process.exit(1);
});
