const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const db = require('./db');
const app = express();
const port = 3000;

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yourcompanyemail@gmail.com',
    pass: 'yourapppassword'
  }
});

// GET route to test the server
app.get('/', (req, res) => {
  res.send('Hello, Crypto World!');
});

// POST route to handle form submissions
app.post('/submit', upload.single('paymentProof'), (req, res) => {
  // Validation: Ensure name, email, and amount are provided
  if (!req.body.name || !req.body.email || !req.body.amount) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  console.log('Received form data:', req.body);

  console.log('Name:', req.body.name);
  console.log('Email:', req.body.email);
  console.log('Coin:', req.body.coin);
  console.log('Amount:', req.body.amount);
  console.log('Wallet:', req.body.wallet);
  console.log('Type:', req.body.type);
  console.log('Bank Info:', req.body.bankInfo);
  console.log('Confirmed:', req.body.confirmTransaction);
  console.log('Payment Proof:', req.file ? req.file.path : 'No file uploaded');

  // Save transaction to MySQL
  const { name, email, coin, amount, wallet, type, bankInfo, confirmTransaction } = req.body;
  const paymentProofPath = req.file ? req.file.path : null;

  db.execute(
    'INSERT INTO transactions (name, email, coin, amount, wallet, type, bankInfo, confirmTransaction, paymentProofPath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, email, coin, amount, wallet, type, bankInfo, confirmTransaction === 'on', paymentProofPath]
  ).then(() => {
    console.log('Transaction saved to database.');
  }).catch(err => {
    console.error('DB error:', err);
  });

  const emailContent = `
    <h2>New ${req.body.type.toUpperCase()} Transaction</h2>
    <p><strong>Name:</strong> ${req.body.name}</p>
    <p><strong>Email:</strong> ${req.body.email}</p>
    <p><strong>Coin:</strong> ${req.body.coin}</p>
    <p><strong>Amount:</strong> ${req.body.amount}</p>
    <p><strong>Wallet Address:</strong> ${req.body.wallet}</p>
    <p><strong>Bank Info:</strong> ${req.body.bankInfo || 'N/A'}</p>
    <p><strong>Confirmed:</strong> ${req.body.confirmTransaction ? 'Yes' : 'No'}</p>
    ${req.file ? `<p><strong>Payment Proof:</strong> <a href="http://localhost:${port}/${req.file.path}" target="_blank">View File</a></p>` : ''}
  `;

  const mailOptions = {
    from: 'yourcompanyemail@gmail.com',
    to: 'yourcompanyemail@gmail.com',
    subject: `New ${req.body.type} transaction - ${req.body.coin}`,
    html: emailContent
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email error:', error);
      return res.status(500).json({ message: 'Error sending email' });
    }
    console.log('Email sent:', info.response);
    res.status(200).json({ message: 'Form submitted successfully and email sent!' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
