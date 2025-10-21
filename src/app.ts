import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import routes from "./routes/routes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app: Application = express();

// ✅ Middlewares
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ✅ Request logger (optional)
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Root route
app.get("/", (req: Request, res: Response) => {
  res.send("💰 Digital Wallet API is running...");
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
