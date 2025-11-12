require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const app = express();
const upload = multer({ dest: 'tmp/' });

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PORT = process.env.PORT || 4000;

// Enable CORS for frontend connections
app.use(cors({
  origin: '*', // You can replace '*' with your frontend URL for stricter security
  methods: ['GET', 'POST'],
}));

app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.send('✅ Pinata backend is running and ready for uploads.');
});

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const data = new FormData();
    data.append('file', fs.createReadStream(req.file.path));
    data.append('pinataMetadata', JSON.stringify({ name: req.file.originalname }));

    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
      maxBodyLength: Infinity,
      headers: {
        ...data.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      IpfsHash: response.data.IpfsHash,
      link: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
    });

  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to upload to Pinata' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
