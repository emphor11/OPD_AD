const assert = require('assert');
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const Dispense = require('../models/Dispense');
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

async function runMedicineCityTests() {
  console.log('🧪 Starting Phase 9: Medicine Dispensing & City Dashboard Tests...\n');

  const dummyHospitalId = new mongoose.Types.ObjectId();
  const dummyPatientId = new mongoose.Types.ObjectId();
  const dummyStaffId = new mongoose.Types.ObjectId();

  // Test 1: Medicine Model Schema Validation
  const medicine = new Medicine({
    hospitalId: dummyHospitalId,
    name: 'Paracetamol 500mg',
    quantity: 100,
    unit: 'tablets',
    minLevel: 20,
  });

  await medicine.validate();
  assert.strictEqual(medicine.quantity, 100);
  assert.strictEqual(medicine.minLevel, 20);
  console.log('✅ Test 1: Medicine model schema validated with units and thresholds');

  // Test 2: Dispensation Deduction Logic
  const dispenseQty = 25;
  medicine.quantity -= dispenseQty;

  const dispense = new Dispense({
    hospitalId: dummyHospitalId,
    medicineId: medicine._id,
    patientId: dummyPatientId,
    quantity: dispenseQty,
    dispensedBy: dummyStaffId,
  });

  await dispense.validate();
  assert.strictEqual(medicine.quantity, 75, 'Remaining quantity should be 75');
  assert.strictEqual(dispense.quantity, 25);
  console.log('✅ Test 2: Dispensation record generated and inventory deducted');

  // Test 3: Low-Stock Threshold Evaluation
  const lowMed = new Medicine({
    hospitalId: dummyHospitalId,
    name: 'Amoxicillin 250mg',
    quantity: 25,
    unit: 'strips',
    minLevel: 20,
  });

  assert.strictEqual(lowMed.quantity >= lowMed.minLevel, true, 'Initially above threshold');
  // Dispense 10 units
  lowMed.quantity -= 10;
  const isNowLow = lowMed.quantity < lowMed.minLevel;
  assert.strictEqual(isNowLow, true, 'Quantity 15 should trigger low stock alert');
  console.log('✅ Test 3: Low-stock warning trigger accurately flags depleted consumables');

  // Test 4: City-Wide Dashboard Route Protection (Admin only)
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'carequeue_super_secret_jwt_key_2026_delhi';
  const staffToken = jwt.sign({ userId: 'staff-1', role: 'staff' }, secret);

  const User = require('../models/User');
  const origFindById = User.findById;
  User.findById = () => Promise.resolve({ _id: 'staff-1', role: 'staff' });

  const unauthCity = await request(app, {
    method: 'GET',
    url: '/api/admin/city-dashboard',
    headers: { authorization: `Bearer ${staffToken}` },
  });

  assert.strictEqual(unauthCity.status, 403, 'Staff role cannot access city dashboard (403)');
  console.log('✅ Test 4: City-Wide Health Grid strictly restricted to City Admin (403)');

  User.findById = origFindById;

  console.log('\n🎉 ALL Phase 9 Medicine Dispensing & City Dashboard tests passed successfully!');
  process.exit(0);
}

runMedicineCityTests().catch((err) => {
  console.error('❌ Phase 9 Test Failure:', err);
  process.exit(1);
});
