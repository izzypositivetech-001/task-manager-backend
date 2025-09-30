import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import connectDB from "./config/db.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Load environment variables
dotenv.config();

// Connect Database

connectDB()

const app = express();

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
  

// Routes
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/userRoutes.js";
// import tasksRoutes from "./routes/tasks.js";
// import reportsRoutes from "./routes/reports.js";


app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
// app.use("/api/tasks", tasksRoutes);
// app.use("/api/reports", reportsRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`server is running on port ${PORT} 😁😒`)
);
