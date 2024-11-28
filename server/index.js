import express from "express";
import { PORT, mongoDbURL } from "./config.js";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./expressRouter.js"; // Default import (no curly braces)

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
app.get('/', (req, res) => {
  res.send('Welcome to the Server!'); // Or any response you want
});
// Routes
app.use('/', router);

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
