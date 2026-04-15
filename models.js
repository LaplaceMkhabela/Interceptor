const mongoose = require('mongoose');

const DrillSchema = new mongoose.Schema({
  title: String,
  category: String,
  scenario: String,
  options: [{ text: String, isCorrect: Boolean }],
  explanation: String
});

const SecurityTipSchema = new mongoose.Schema({
  title: String,
  content: String
});

const ScanReportSchema = new mongoose.Schema({
  payload: String, // The text, URL, or extracted OCR text
  status: { type: String, enum: ['Clear', 'Medium', 'Critical'] },
  report: String,
  score: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = {
  Drill: mongoose.model('Drill', DrillSchema),
  SecurityTip: mongoose.model('SecurityTip', SecurityTipSchema),
  ScanReport: mongoose.model('ScanReport', ScanReportSchema)
};