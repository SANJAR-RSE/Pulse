const EmergencyContact = require('../models/EmergencyContact');
const asyncHandler = require('../utils/asyncHandler');

const listEmergencyContacts = asyncHandler(async (req, res) => {
  const contacts = await EmergencyContact.find().sort({ type: 1 });
  res.json({ contacts });
});

module.exports = { listEmergencyContacts };
