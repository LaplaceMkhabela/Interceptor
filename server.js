require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const Groq = require('groq-sdk');
const { Drill, SecurityTip, ScanReport } = require('./models');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Helper: Extract text from uploaded files
async function extractText(file) {
  if (file.mimetype === 'application/pdf') {
    const data = await pdfParse(file.buffer);
    return data.text;
  } else if (file.mimetype.startsWith('image/')) {
    const { data: { text } } = await Tesseract.recognize(file.buffer, 'eng');
    return text;
  }
  return file.buffer.toString('utf-8'); // Fallback for txt
}

// Routes
app.post('/api/scan', upload.single('payloadFile'), async (req, res) => {
  try {
    let payloadText = req.body.payloadText || '';
    
    if (req.file) {
      payloadText = await extractText(req.file);
    }

    if (!payloadText.trim()) {
      return res.status(400).json({ error: 'No payload provided' });
    }

    // Call Groq LLM
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are INTERCEPTOR, an elite cybersecurity analyzer. Analyze the provided text, URL, or code. You must respond ONLY with a strict JSON object matching this schema: { \"status\": \"Clear\" | \"Medium\" | \"Critical\", \"report\": \"Brief technical analysis of the threat or safety.\", \"score\": 1-10 }."
        },
        {
          role: "user",
          content: payloadText
        }
      ],
      model: "llama-3.1-70b-versatile",
      response_format: { type: "json_object" }
    });

    const llmResponse = JSON.parse(completion.choices[0].message.content);

    // Save to database
    const report = new ScanReport({
      payload: payloadText.substring(0, 500), // Store up to 500 chars for history
      status: llmResponse.status,
      report: llmResponse.report,
      score: llmResponse.score
    });
    await report.save();

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error during scan.' });
  }
});

app.get('/api/drills', async (req, res) => {
  const drills = await Drill.find();
  res.json(drills);
});

app.get('/api/history', async (req, res) => {
  const reports = await ScanReport.find().sort({ timestamp: -1 }).limit(20);
  res.json(reports);
});

app.get('/api/tip', async (req, res) => {
  const count = await SecurityTip.countDocuments();
  const random = Math.floor(Math.random() * count);
  const tip = await SecurityTip.findOne().skip(random);
  res.json(tip);
});

app.get('/api/stats', async (req, res) => {
  const totalScans = await ScanReport.countDocuments();
  const threats = await ScanReport.countDocuments({ status: { $in: ['Medium', 'Critical'] } });
  res.json({ totalScans, threatsNeutralized: threats });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`INTERCEPTOR Backend running on port ${PORT}`));