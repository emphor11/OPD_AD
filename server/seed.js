require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const OpdSession = require('./models/OpdSession');
const Token = require('./models/Token');
const Bed = require('./models/Bed');
const Admission = require('./models/Admission');
const Medicine = require('./models/Medicine');
const Dispense = require('./models/Dispense');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

const today = new Date().toISOString().split('T')[0];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/carequeue';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Hospital.deleteMany({}),
      OpdSession.deleteMany({}),
      Token.deleteMany({}),
      Bed.deleteMany({}),
      Admission.deleteMany({}),
      Medicine.deleteMany({}),
      Dispense.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    // 1. Patient User
    const patient = new User({
      name: 'Rahul Sharma',
      email: 'rahul@carequeue.org',
      password: 'password123',
      phone: '+91 98765 43210',
      role: 'patient',
      age: 28,
      gender: 'male',
      bloodGroup: 'O+',
      location: { lat: 28.6139, lng: 77.2090 }, // Delhi Central
    });
    await patient.save();

    // 2. Staff User
    const staff = new User({
      name: 'Dr. Anita Roy',
      email: 'staff@lnjp.gov.in',
      password: 'password123',
      phone: '+91 11 2323 3001',
      role: 'staff',
    });
    await staff.save();

    // 3. Admin User
    const admin = new User({
      name: 'Delhi Health Admin',
      email: 'admin@health.delhi.gov.in',
      password: 'password123',
      phone: '+91 11 2345 6789',
      role: 'admin',
    });
    await admin.save();

    console.log('[Seed] Creating Delhi hospitals...');
    // Hospital 1: LNJP (Verified)
    const lnjp = new Hospital({
      name: 'Lok Nayak Hospital (LNJP)',
      address: 'Jawaharlal Nehru Marg, Delhi Gate, New Delhi - 110002',
      phone: '+91 11 2323 3000',
      location: { lat: 28.6366, lng: 77.2410 },
      verified: true,
      createdBy: staff._id,
      departments: [
        { code: 'GM', name: 'General Medicine', avgConsultMins: 8 },
        { code: 'PED', name: 'Pediatrics', avgConsultMins: 10 },
        { code: 'ORTHO', name: 'Orthopedics', avgConsultMins: 12 },
        { code: 'ENT', name: 'ENT Clinic', avgConsultMins: 8 },
        { code: 'CARD', name: 'Cardiology', avgConsultMins: 15 },
      ],
    });
    await lnjp.save();

    // Associate staff to LNJP
    staff.hospitalId = lnjp._id;
    await staff.save();

    // Hospital 2: Safdarjung (Verified)
    const safdarjung = new Hospital({
      name: 'Safdarjung Hospital',
      address: 'Ring Road, Opposite AIIMS, New Delhi - 110029',
      phone: '+91 11 2616 5060',
      location: { lat: 28.5684, lng: 77.2078 },
      verified: true,
      createdBy: admin._id,
      departments: [
        { code: 'GM', name: 'General Medicine', avgConsultMins: 8 },
        { code: 'EMER', name: 'Emergency Trauma', avgConsultMins: 5 },
        { code: 'PED', name: 'Pediatrics', avgConsultMins: 10 },
      ],
    });
    await safdarjung.save();

    // Hospital 3: GTB (Verified)
    const gtb = new Hospital({
      name: 'Guru Teg Bahadur (GTB) Hospital',
      address: 'Dilshad Garden, Shahdara, Delhi - 110095',
      phone: '+91 11 2258 6262',
      location: { lat: 28.6833, lng: 77.3090 },
      verified: true,
      createdBy: admin._id,
      departments: [
        { code: 'GM', name: 'General Medicine', avgConsultMins: 8 },
        { code: 'ORTHO', name: 'Orthopedics', avgConsultMins: 10 },
      ],
    });
    await gtb.save();

    // Hospital 4: DDU (Unverified - for Admin verification demo)
    const ddu = new Hospital({
      name: 'Deen Dayal Upadhyay (DDU) Hospital',
      address: 'Clock Tower, Hari Nagar, New Delhi - 110064',
      phone: '+91 11 2549 4404',
      location: { lat: 28.6256, lng: 77.1068 },
      verified: false,
      createdBy: staff._id,
    });
    await ddu.save();

    console.log('[Seed] Populating beds for LNJP...');
    const beds = [
      { hospitalId: lnjp._id, bedNo: 'GEN-101', type: 'general', ward: 'General Ward Block A', status: 'free' },
      { hospitalId: lnjp._id, bedNo: 'GEN-102', type: 'general', ward: 'General Ward Block A', status: 'occupied' },
      { hospitalId: lnjp._id, bedNo: 'GEN-103', type: 'general', ward: 'General Ward Block A', status: 'free' },
      { hospitalId: lnjp._id, bedNo: 'ICU-01', type: 'icu', ward: 'Critical Care Unit 1', status: 'occupied' },
      { hospitalId: lnjp._id, bedNo: 'ICU-02', type: 'icu', ward: 'Critical Care Unit 1', status: 'free' },
      { hospitalId: lnjp._id, bedNo: 'ICU-03', type: 'icu', ward: 'Critical Care Unit 1', status: 'maintenance' },
      { hospitalId: lnjp._id, bedNo: 'OXY-01', type: 'oxygen', ward: 'Respiratory Ward B', status: 'free' },
      { hospitalId: lnjp._id, bedNo: 'OXY-02', type: 'oxygen', ward: 'Respiratory Ward B', status: 'free' },
      { hospitalId: lnjp._id, bedNo: 'VENT-01', type: 'ventilator', ward: 'Trauma ICU', status: 'occupied' },
      { hospitalId: lnjp._id, bedNo: 'VENT-02', type: 'ventilator', ward: 'Trauma ICU', status: 'free' },
      { hospitalId: lnjp._id, bedNo: 'PED-01', type: 'pediatric', ward: 'Child Health Ward', status: 'free' },
    ];
    await Bed.insertMany(beds);

    console.log('[Seed] Opening live OPD session & generating tokens...');
    const session = new OpdSession({
      hospitalId: lnjp._id,
      departmentCode: 'GM',
      date: today,
      status: 'open',
      currentTokenNo: 11,
      lastTokenNo: 14,
      openedBy: staff._id,
    });
    await session.save();

    // Past tokens in session
    await Token.insertMany([
      { sessionId: session._id, hospitalId: lnjp._id, departmentCode: 'GM', patientId: patient._id, tokenNo: 10, displayNo: 'GM-010', status: 'completed' },
      { sessionId: session._id, hospitalId: lnjp._id, departmentCode: 'GM', patientId: patient._id, tokenNo: 11, displayNo: 'GM-011', status: 'in_consultation' },
      { sessionId: session._id, hospitalId: lnjp._id, departmentCode: 'GM', patientId: patient._id, tokenNo: 12, displayNo: 'GM-012', status: 'waiting' },
      { sessionId: session._id, hospitalId: lnjp._id, departmentCode: 'GM', patientId: patient._id, tokenNo: 13, displayNo: 'GM-013', status: 'waiting' },
      { sessionId: session._id, hospitalId: lnjp._id, departmentCode: 'GM', patientId: patient._id, tokenNo: 14, displayNo: 'GM-014', status: 'waiting' },
    ]);

    console.log('[Seed] Adding medicine inventory...');
    await Medicine.insertMany([
      { hospitalId: lnjp._id, name: 'Paracetamol 500mg', quantity: 240, unit: 'tablets', minLevel: 100 },
      { hospitalId: lnjp._id, name: 'Amoxicillin 250mg', quantity: 45, unit: 'strips', minLevel: 50 }, // Low stock
      { hospitalId: lnjp._id, name: 'Normal Saline IV 500ml', quantity: 18, unit: 'bottles', minLevel: 25 }, // Low stock
      { hospitalId: lnjp._id, name: 'Cetirizine 10mg', quantity: 180, unit: 'tablets', minLevel: 60 },
      { hospitalId: lnjp._id, name: 'Oxygen Cylinder Type D', quantity: 12, unit: 'units', minLevel: 8 },
    ]);

    console.log('[Seed] Creating demo admission request...');
    const admission = new Admission({
      patientId: patient._id,
      hospitalId: lnjp._id,
      bedType: 'icu',
      reason: 'Acute respiratory distress with oxygen saturation dropping below 85%',
      urgency: 'critical',
      status: 'admitted',
      bedId: (await Bed.findOne({ bedNo: 'ICU-01' }))._id,
      statusHistory: [
        { status: 'pending', at: new Date(Date.now() - 3600000), by: patient._id },
        { status: 'approved', at: new Date(Date.now() - 2400000), by: staff._id },
        { status: 'admitted', at: new Date(Date.now() - 1200000), by: staff._id },
      ],
    });
    await admission.save();

    // Chat messages on admission
    await Message.insertMany([
      { admissionId: admission._id, senderId: patient._id, text: 'Hello, patient is arriving via Emergency Gate 2.' },
      { admissionId: admission._id, senderId: staff._id, text: 'Bed ICU-01 is sanitized and ready. Triage staff alerted.' },
    ]);

    // Demo notification
    await Notification.create({
      userId: patient._id,
      title: '🔔 Your Turn is Near!',
      body: 'Only 3 patients ahead in General Medicine OPD. Please proceed near Room 104.',
      type: 'queue',
      data: { displayNo: 'GM-014' },
      read: false,
    });

    console.log('\n========================================');
    console.log('🎉 CareQueue Database Seeded Successfully!');
    console.log('========================================');
    console.log('👤 Patient Account:  rahul@carequeue.org        / password123');
    console.log('🩺 Hospital Staff:   staff@lnjp.gov.in          / password123');
    console.log('🏛️ City Admin:       admin@health.delhi.gov.in  / password123');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
