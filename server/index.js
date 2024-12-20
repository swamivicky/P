import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./expressRouter.js"; // Default import (no curly braces)
import dotenv from 'dotenv';
dotenv.config();
const app = express();

// Apply CORS middleware first
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's address
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle OPTIONS requests
app.options('*', cors());

app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/', router);

const PORT = process.env.PORT || 5555;
const mongoDbURL = process.env.MONGO_DB_URL;

// Connect to MongoDB and start server
mongoose.connect(mongoDbURL)
  .then(() => {
    console.log("Connected to DataBase");
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
