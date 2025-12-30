import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";

import pushRoutes from "./routes/push.routes.js";
import jiraRoutes from "./routes/jira.routes.js";
import { initWebPush } from "./services/push.service.js";



/* ==============================
   RESOLVER PATH DA RAIZ
================================ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env")
});


initWebPush();

/* ==============================
   DEBUG (TEMPORÁRIO)
================================ */
console.log("VAPID_SUBJECT =>", process.env.VAPID_SUBJECT);

/* ==============================
   APP
================================ */
const app = express();

/* ==============================
   CORS
================================ */
app.use(cors({
  origin: [
    "https://jader-amorim-em.github.io",
    "https://jader-amorim-em.github.io/jira-notifier-frontend"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

/* ==============================
   MIDDLEWARES
================================ */
app.use(express.json());

/* ==============================
   ROTAS
================================ */
app.use("/push", pushRoutes);
app.use("/webhook", jiraRoutes);

app.get("/health", (_, res) => res.send("OK"));

/* ==============================
   START SERVER
================================ */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
