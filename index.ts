import express from 'express';
import cors from "cors";
import connectDB from './config/db';

import authRoutes from "./routes/authRoutes";
import portfolioRoutes from "./routes/portfolioRoutes";

require("dotenv").config();

connectDB();

const app = express();


app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", portfolioRoutes);


app.get('/', (req, res) => {
    res.status(200).json('Welcome to the portfolio builder API');
});
  
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
return console.log(`Server is running at http://localhost:${PORT}`);
});

