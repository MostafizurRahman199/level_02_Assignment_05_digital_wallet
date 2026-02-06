// app.ts
import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import routes from "./routes/routes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app: Application = express();

// ✅ Middlewares - Update CORS for production
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// ✅ Request logger
app.use((req, _res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Root route
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "💰 Digital Wallet API is running...",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// ✅ Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// ✅ API routes
app.use("/api", routes);

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ✅ Global error handler
app.use(errorHandler);

export default app;
