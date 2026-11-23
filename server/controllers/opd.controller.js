const OpdSession = require('../models/OpdSession');
const Token = require('../models/Token');
const Hospital = require('../models/Hospital');

// Helper to get today's date formatted as YYYY-MM-DD
const getTodayDateString = () => new Date().toISOString().split('T')[0];

// @desc Open today's OPD session for a department (Staff only)
// @route POST /api/opd/sessions
const openSession = async (req, res) => {
  try {
    const { departmentCode, hospitalId } = req.body;
    const targetHospitalId = hospitalId || req.user.hospitalId;

    if (!departmentCode || !targetHospitalId) {
      return res.status(400).json({ message: 'Department code and hospital ID are required.' });
    }

    const today = getTodayDateString();

    // Check if session already exists for today
    let session = await OpdSession.findOne({
      hospitalId: targetHospitalId,
      departmentCode: departmentCode.toUpperCase(),
      date: today,
    });

    if (session) {
      session.status = 'open';
      await session.save();
    } else {
      session = new OpdSession({
        hospitalId: targetHospitalId,
        departmentCode: departmentCode.toUpperCase(),
        date: today,
        status: 'open',
        openedBy: req.user._id,
      });
      await session.save();
    }

    // Emit live socket event if socket available
    if (req.io) {
      req.io.to(`hospital:${targetHospitalId}`).emit('session:opened', session);
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error opening OPD session' });
  }
};

// @desc Close an active OPD session
// @route PUT /api/opd/sessions/:id/close
const closeSession = async (req, res) => {
  try {
    const session = await OpdSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.status = 'closed';
    await session.save();

    if (req.io) {
      req.io.to(`session:${session._id}`).emit('queue:updated', {
        sessionId: session._id,
        status: 'closed',
      });
    }

    res.status(200).json({ message: 'OPD session closed successfully', session });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error closing OPD session' });
  }
};

// @desc Get session info with waiting count
// @route GET /api/opd/sessions/:id
const getSessionById = async (req, res) => {
  try {
    const session = await OpdSession.findById(req.params.id).populate('hospitalId', 'name address');
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const waitingCount = await Token.countDocuments({
      sessionId: session._id,
      status: 'waiting',
    });

    res.status(200).json({
      session,
      waitingCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching session' });
  }
};

// @desc Call next waiting token in the session (Staff only)
// @route POST /api/opd/sessions/:id/next
const callNextToken = async (req, res) => {
  try {
    const session = await OpdSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Find next token in FIFO queue
    const nextToken = await Token.findOne({
      sessionId: session._id,
      status: 'waiting',
    }).sort({ tokenNo: 1 });

    if (!nextToken) {
      return res.status(200).json({
        message: 'No more waiting patients in this session',
        session,
        currentToken: null,
      });
    }

    // Update token to called / in_consultation
    nextToken.status = 'in_consultation';
    nextToken.calledAt = new Date();
    await nextToken.save();

    // Advance session current token pointer
    session.currentTokenNo = nextToken.tokenNo;
    await session.save();

    const waitingCount = await Token.countDocuments({
      sessionId: session._id,
      status: 'waiting',
    });

    // Real-Time Socket Emissions
    if (req.io) {
      // Broadcast to all devices viewing this session
      req.io.to(`session:${session._id}`).emit('queue:updated', {
        sessionId: session._id,
        currentTokenNo: session.currentTokenNo,
        waitingCount,
      });

      // Direct alert to the called patient's private user room
      req.io.to(`user:${nextToken.patientId}`).emit('token:called', {
        tokenId: nextToken._id,
        displayNo: nextToken.displayNo,
      });
    }

    res.status(200).json({
      message: `Called token ${nextToken.displayNo}`,
      currentToken: nextToken,
      session,
      waitingCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error calling next token' });
  }
};

module.exports = {
  openSession,
  closeSession,
  getSessionById,
  callNextToken,
};
