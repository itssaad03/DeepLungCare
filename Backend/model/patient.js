const mongoose = require('mongoose');

// Schema for patient registration
const patientSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true },
  patientName: { type: String, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  opd: { type: String },
  smoker: { type: String, required: true },
  previousLungDisease: { type: String, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link patient to the doctor

  // New fields for report integration
  summary: { type: String },
  lastVisitDate: { type: Date },
  recommendedDisease: { type: String },
  history: [{
    disease: { type: String },
    summary: { type: String },
    lastVisitDate: { type: Date }
  }]
});

// Create and export the Patient model
const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
