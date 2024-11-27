import express from "express";
import { PORT, mongoDbURL } from "./config.js";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./expressRouter.js"; // Default import (no curly braces)

const app = express();
app.use(bodyParser.json());
app.use(express.json());

app.use('/uploads', express.static('uploads'));


app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.6:3000'], // Allow requests from your local React app
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow cookies and other credentials
}));



app.use('/', router);

//The server will only start if the mongodb is connected porperly
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
