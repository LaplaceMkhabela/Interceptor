require('dotenv').config();
const mongoose = require('mongoose');
const { Drill, SecurityTip } = require('./models');

const drills = [
  {
    title: "The Urgent Request",
    category: "Phishing",
    scenario: "You receive an email from 'IT-Support@company-secure.com' asking you to click a link to prevent account suspension.",
    options: [
      { text: "Click the link and quickly log in.", isCorrect: false },
      { text: "Verify the sender address and report it to real IT.", isCorrect: true },
      { text: "Reply asking if it's real.", isCorrect: false }
    ],
    explanation: "Always check the actual email domain and never click unverified links in urgent messages."
  },
  {
    title: "Delivery Notification",
    category: "Smishing",
    scenario: "A text message reads: 'USPS: Your package is stuck. Update details here: http://usps-tracking-hub.com/fix'.",
    options: [
      { text: "Click to update, you don't want to lose the package.", isCorrect: false },
      { text: "Ignore and block the number.", isCorrect: true },
      { text: "Text back 'STOP'.", isCorrect: false }
    ],
    explanation: "Scammers use fake URLs (like usps-tracking-hub.com). Legitimate alerts come from official shortcodes or apps."
  },
  {
    title: "Hidden Characters",
    category: "Malicious URLs",
    scenario: "Which of these URLs is safe to log into?",
    options: [
      { text: "https://www.paypaI.com/login (Capital i instead of L)", isCorrect: false },
      { text: "http://paypal.com.secure-login.info", isCorrect: false },
      { text: "https://www.paypal.com", isCorrect: true }
    ],
    explanation: "Homoglyph attacks and sub-domain tricks are common. Always look for the base domain and HTTPS."
  },
  {
    title: "Password Reuse",
    category: "Credential Stuffing",
    scenario: "You hear a forum you use was breached. You use the same password for your email.",
    options: [
      { text: "Change the email password immediately and enable 2FA.", isCorrect: true },
      { text: "Wait to see if someone logs in.", isCorrect: false },
      { text: "Delete the forum account only.", isCorrect: false }
    ],
    explanation: "Credential stuffing relies on reused passwords. A breached password must be changed everywhere it's used."
  },
  {
    title: "The Friendly Contractor",
    category: "Social Engineering",
    scenario: "Someone in a high-vis vest asks you to hold the server room door because their hands are full.",
    options: [
      { text: "Hold the door, be polite.", isCorrect: false },
      { text: "Ask to see their badge and ask them to swipe in.", isCorrect: true },
      { text: "Take their boxes for them.", isCorrect: false }
    ],
    explanation: "Tailgating is a primary physical security breach method. Politeness should never override security protocols."
  }
];

const tips = [
  { title: "Browser Safety", content: "Always keep your browser up to date. Zero-day exploits often target outdated browser engines." },
  { title: "2FA Enforcement", content: "Multi-factor authentication is your final perimeter. Hardware keys (YubiKey) are superior to SMS." },
  { title: "Password Managers", content: "Never memorize passwords. Use a secure password manager to generate and store unique credentials." },
  { title: "HTTPS Everywhere", content: "Ensure 'HTTPS Only' mode is active on your browser to prevent man-in-the-middle downgrade attacks." },
  { title: "Phishing Vigilance", content: "Hover over links before clicking to inspect the true destination URL in the bottom corner of your browser." },
  { title: "Update Routine", content: "Patch Tuesday is a real thing. Don't delay OS updates; they often contain critical security patches." },
  { title: "Public Wi-Fi", content: "Treat all public Wi-Fi as compromised. Use a reputable VPN if you must handle sensitive data off-network." },
  { title: "Principle of Least Privilege", content: "Only run as an Administrator when absolutely necessary. Use standard accounts for daily driving." },
  { title: "Data Backups", content: "Ransomware's worst enemy is an offline, air-gapped backup. Follow the 3-2-1 backup rule." },
  { title: "Social Media Footprint", content: "Limit public personal information. Open Source Intelligence (OSINT) is the first step in a targeted attack." }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB. Clearing old data...');
    await Drill.deleteMany({});
    await SecurityTip.deleteMany({});
    
    console.log('Inserting data...');
    await Drill.insertMany(drills);
    await SecurityTip.insertMany(tips);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });