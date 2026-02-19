import "dotenv/config";
import express from "express";
import cors from "cors";
import registrationRoutes from "./routes/registration.js";
import feedbackRoutes from "./routes/feedback.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
  : undefined;

app.use(
  cors(
    corsOrigins
      ? { origin: corsOrigins }
      : { origin: true }
  )
);
app.use(express.json());

app.use("/api/registration", registrationRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Backend API: http://localhost:${PORT}`);
});
