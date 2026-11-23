const Token = require('../models/Token');
const OpdSession = require('../models/OpdSession');
const Hospital = require('../models/Hospital');

// Format display number: e.g. GM-014
const formatDisplayNo = (deptCode, tokenNo) => {
  return `${deptCode.toUpperCase()}-${String(tokenNo).padStart(3, '0')}`;
};

// @desc Book an OPD Token (Patient)
// @route POST /api/tokens
const bookToken = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const patientId = req.user._id;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required.' });
    }

    // Verify session is active and open
    const session = await OpdSession.findById(sessionId);
    if (!session || session.status !== 'open') {
      return res.status(400).json({ message: 'This OPD session is currently closed or invalid.' });
    }

    // Rule: One active token per patient per session
    const existingActive = await Token.findOne({
      sessionId,
      patientId,
      status: { $in: ['waiting', 'called', 'in_consultation'] },
    });

    if (existingActive) {
      return res.status(400).json({
        message: `You already hold active token ${existingActive.displayNo} in this department session.`,
        token: existingActive,
      });
    }

    // Atomically increment lastTokenNo on the session
    const updatedSession = await OpdSession.findOneAndUpdate(
      { _id: sessionId },
      { $inc: { lastTokenNo: 1 } },
      { new: true }
    );

    const tokenNo = updatedSession.lastTokenNo;
    const displayNo = formatDisplayNo(session.departmentCode, tokenNo);

    const token = new Token({
      sessionId,
      hospitalId: session.hospitalId,
      departmentCode: session.departmentCode,
      patientId,
      tokenNo,
      displayNo,
      status: 'waiting',
    });

    await token.save();

    // Calculate queue position ahead
    const positionAhead = await Token.countDocuments({
      sessionId,
      status: 'waiting',
      tokenNo: { $lt: tokenNo },
    });

    // Real-Time Socket Broadcast
    if (req.io) {
      const waitingCount = await Token.countDocuments({ sessionId, status: 'waiting' });
      req.io.to(`session:${sessionId}`).emit('queue:updated', {
        sessionId,
        currentTokenNo: updatedSession.currentTokenNo,
        waitingCount,
      });
    }

    res.status(201).json({
      token,
      positionAhead,
      currentTokenNo: updatedSession.currentTokenNo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error booking token' });
  }
};

// @desc Get current patient's active and past tokens
// @route GET /api/tokens/mine
const getMyTokens = async (req, res) => {
  try {
    const tokens = await Token.find({ patientId: req.user._id })
      .populate('hospitalId', 'name address phone')
      .populate('sessionId', 'currentTokenNo status date')
      .sort({ createdAt: -1 })
      .lean();

    // Dynamically calculate live queue position and estimated wait time
    const enriched = await Promise.all(
      tokens.map(async (t) => {
        if (t.status === 'waiting') {
          const positionAhead = await Token.countDocuments({
            sessionId: t.sessionId?._id || t.sessionId,
            status: 'waiting',
            tokenNo: { $lt: t.tokenNo },
          });

          // Fetch average consultation minutes for department
          const hospital = await Hospital.findById(t.hospitalId?._id || t.hospitalId);
          const dept = hospital?.departments?.find((d) => d.code === t.departmentCode);
          const avgMins = dept?.avgConsultMins || 8;

          return {
            ...t,
            positionAhead,
            estimatedWaitMins: positionAhead * avgMins,
            nowServing: t.sessionId?.currentTokenNo || 0,
          };
        }

        return {
          ...t,
          positionAhead: 0,
          estimatedWaitMins: 0,
          nowServing: t.sessionId?.currentTokenNo || 0,
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching user tokens' });
  }
};

// @desc Get all tokens in a session (Staff only)
// @route GET /api/tokens/session/:sessionId
const getSessionTokens = async (req, res) => {
  try {
    const tokens = await Token.find({ sessionId: req.params.sessionId })
      .populate('patientId', 'name phone age gender bloodGroup')
      .sort({ tokenNo: 1 });

    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching session tokens' });
  }
};

// @desc Update token status (complete, skip, cancel)
// @route PUT /api/tokens/:id/status
const updateTokenStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    // Patient can only cancel their own waiting token
    if (req.user.role === 'patient') {
      if (String(token.patientId) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Unauthorized to modify this token.' });
      }
      if (status !== 'cancelled') {
        return res.status(400).json({ message: 'Patients can only cancel tokens.' });
      }
    }

    token.status = status;
    if (status === 'completed') {
      token.completedAt = new Date();
    }
    await token.save();

    // Broadcast queue update
    if (req.io) {
      const waitingCount = await Token.countDocuments({ sessionId: token.sessionId, status: 'waiting' });
      const session = await OpdSession.findById(token.sessionId);

      req.io.to(`session:${token.sessionId}`).emit('queue:updated', {
        sessionId: token.sessionId,
        currentTokenNo: session?.currentTokenNo || 0,
        waitingCount,
      });
    }

    res.status(200).json(token);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating token status' });
  }
};

module.exports = {
  bookToken,
  getMyTokens,
  getSessionTokens,
  updateTokenStatus,
  formatDisplayNo,
};
