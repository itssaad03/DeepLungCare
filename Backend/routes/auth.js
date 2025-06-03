// server/server.js

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);

mongoose.connect('mongodb://127.0.0.1:27017/FYP/user', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("MongoDB connected");
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:5000/api/signup`);
  });
})
.catch(err => console.error("MongoDB connection error:", err));
