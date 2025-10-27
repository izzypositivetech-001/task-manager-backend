import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Connect to DB
connectDB();

const app = express();

// ✅ Updated CORS setup
const allowedOrigins = [
  "https://task-manager-client-virid.vercel.app", // Frontend (Vercel)
  "http://localhost:5173", // Local development
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow tools like Postman or mobile
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`❌ Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Import routes
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/userRoutes.js";
import tasksRoutes from "./routes/taskRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/reports", reportRoutes);

// ✅ Health route for testing
app.get("/", (req, res) => {
  res.json({ message: "✅ Task Manager Backend running fine on Vercel!" });
});

// ❌ Remove app.listen() — Vercel handles this automatically
export default app;
