const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
  res.send('API is working!');
});

app.use(cors({
  origin: 'https://mv-livid-iota.vercel.app',
  credentials: true,
}));


app.use(express.json());

app.use('/api/auth', require('./routes/auth'));


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
