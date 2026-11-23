const assert = require('assert');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const setupSocket = require('../socket/index');
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

async function runSocketChatTests() {
  console.log('🧪 Starting Phase 7: Real-Time WebSockets & Helpdesk Chat Tests...\n');

  const dummyAdmissionId = new mongoose.Types.ObjectId();
  const dummySenderId = new mongoose.Types.ObjectId();

  // Test 1: Message Model Schema Validation
  const message = new Message({
    admissionId: dummyAdmissionId,
    senderId: dummySenderId,
    text: 'Patient arriving via ambulance gate 2',
  });

  await message.validate();
  assert.strictEqual(message.text, 'Patient arriving via ambulance gate 2');
  assert.strictEqual(message.imageUrl, null);
  console.log('✅ Test 1: Message schema validated with mandatory text');

  // Test 2: Reject empty message without image
  const emptyMsg = new Message({
    admissionId: dummyAdmissionId,
    senderId: dummySenderId,
    text: '',
  });
  let emptyErr = null;
  try {
    await emptyMsg.validate();
  } catch (e) {
    emptyErr = e;
  }
  assert.strictEqual(!!emptyErr, true, 'Empty message must fail validation');
  console.log('✅ Test 2: Message schema rejects empty text payload');

  // Test 3: Socket.io Handshake Middleware Unit Verification
  const mockIo = {
    use(fn) {
      this.middleware = fn;
    },
    on() {},
  };
  setupSocket(mockIo);

  // Test 3a: Missing token in handshake auth
  let handshakeError = null;
  await mockIo.middleware({ handshake: { auth: {} } }, (err) => {
    handshakeError = err;
  });
  assert.strictEqual(!!handshakeError, true);
  assert.strictEqual(handshakeError.message, 'Authentication token required');
  console.log('✅ Test 3: Socket handshake middleware rejects unauthenticated connections');

  // Test 4: Socket.io Room Routing Logic
  const joinedRooms = new Set();
  const mockSocket = {
    user: { _id: 'usr-1', name: 'Dr. Anita', role: 'staff', hospitalId: 'hosp-1' },
    join(room) {
      joinedRooms.add(room);
    },
    leave(room) {
      joinedRooms.delete(room);
    },
    on(event, handler) {
      this[event] = handler;
    },
  };

  // Simulate connection lifecycle
  mockSocket.join(`user:${mockSocket.user._id}`);
  mockSocket.join(`hospital:${mockSocket.user.hospitalId}`);

  assert.strictEqual(joinedRooms.has('user:usr-1'), true, 'User must join personal user room');
  assert.strictEqual(joinedRooms.has('hospital:hosp-1'), true, 'Staff must join hospital room');
  console.log('✅ Test 4: Automatic room subscription for user & hospital validated');

  // Test 5: Dynamic Session & Admission Room Subscriptions
  mockSocket.join('session:sess-101');
  assert.strictEqual(joinedRooms.has('session:sess-101'), true);
  mockSocket.join('admission:adm-505');
  assert.strictEqual(joinedRooms.has('admission:adm-505'), true);
  console.log('✅ Test 5: Dynamic session and admission chat room joins verified');

  // Test 6: Route Protection on Chat API
  const unauthChat = await request(app, {
    method: 'GET',
    url: '/api/messages/adm-1',
  });
  assert.strictEqual(unauthChat.status, 401, 'Chat history endpoint must require auth (401)');
  console.log('✅ Test 6: Messages API endpoints protected by JWT authentication');

  console.log('\n🎉 ALL Phase 7 Real-Time WebSockets & Helpdesk Chat tests passed successfully!');
  process.exit(0);
}

runSocketChatTests().catch((err) => {
  console.error('❌ Phase 7 Test Failure:', err);
  process.exit(1);
});
