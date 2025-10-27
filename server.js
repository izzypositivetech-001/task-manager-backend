import express from "express";
import compression from "compression";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect Database

connectDB();

const app = express();

// Compression middleware to reduce response payload sizes
app.use(compression());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware to handle CORS

const allowedOrigins = [
  "https://task-manager-client-virid.vercel.app", // ✅ your frontend
  "http://localhost:5173" // ✅ for local dev (optional)
];

app.use(
  cors({
    origin: [
      "http://localhost:5173", // local dev
      "https://task-manager-client-virid.vercel.app", // ✅ deployed frontend
    ],
    credentials: true, // allow cookies / tokens
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
// Cookie parser (required to read cookies like the refresh token)
app.use(cookieParser());

// Routes
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/userRoutes.js";
import tasksRoutes from "./routes/taskRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/reports", reportRoutes);

//Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server is running on port ${PORT} 😁😒`));
