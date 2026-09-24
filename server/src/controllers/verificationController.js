const fs = require("fs")
const user = require("../models/User")
const { createEnvelope, getEnvelope } = require("../services/docusignService")

const startVerification = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const pwd = await User.findById(userId);
    if(!pwd || pwd.role !== "PwD") {
      return res.status(404).json({
        success: false,
        message: "PwD user not found"
      })
    }
 

    if(pwd.verificationEnvelopeStatus === "Sent") {
      return res.status(400).json({
        success: false,
        message: "Verification aleready sent"
      })
    }

    const pdf = fs.readFileSync(
      "server/templates/pwd-verification.pdf"
    )

    const documentBase64 = pdf.toString("base64")
    const result = await createEnvelope({
      admin: req.user,
      pwd,
      documentBase64
    })

    pwd.verificationEnvelopeId = result.envelopeId
    pwd.verificationEnvelopeStatus = "Sent"
    pwd.verificationStatus = "Pending"
    pwd.udidVerified = false

    await pwd.save();

    res.json({
      success: true,
      message: "Docusign verification started",
      envelopeId: result.envelopId,
      status: result.status,
    });
  }
  catch (error) {
    next(error);
  }
};

const syncVerification = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const pwd = await User.findById(userId)
    
    if(!pwd || !pwd.verificationEnvelopeId) {
      return res.status(404).json({
        success: false,
        message: "Verification not found"
      })
    }
    const envelope = await getEnvelope(
      pwd.verificationEnvelopeId
    )
    pwd.verificationEnvelopeStatus = envelope.status;

    if(envelope.status === "completed") {
      pwd.verificationStatus = "Approved"
      pwd.udidVerified = true
      pwd.verifiedCompletedAt = new Date()
    }

    await pwd.save();

    res.json({
      success: true,
      status: envelope.status,
      verificationStatus: pwd.verificationEnvelopeStatus,
      udidVerified: pwd.udidVerified, 
    });
  }
  catch (error) {
    next(error);
  }
};

const getVerificationStatus = aync (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("verificationStatus verificationEnvelopeStatus verificationEnvelopeId verificationCompletedAt");

    res.json({
      success: true,
      data: user,
    })
  }
  catch (error) {
    next(error);
  }
};

module.exports = {
  startVerification,
  syncVerification,
  getVerificationStatus,
};