import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/routes"; // ✅ import master router
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

// Root test route
app.get("/", (req: Request, res: Response) => {
  res.send("💰 Digital Wallet API is running...");
});

// ✅ Use your master route file
app.use("/api", routes);
app.use(errorHandler);

export default app;
