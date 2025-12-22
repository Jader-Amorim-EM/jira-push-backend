import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


/* ==============================
   RESOLVER PATH DA RAIZ
================================ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env")
});

/* ==============================
   DEBUG (TEMPORÁRIO)
================================ */
console.log("VAPID_SUBJECT =>", process.env.VAPID_SUBJECT);

import express from "express";
import cors from "cors";
import pushRoutes from "./routes/push.routes.js";
import jiraRoutes from "./routes/jira.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/push", pushRoutes);

app.use("/webhook", jiraRoutes);

app.get("/health", (_, res) => res.send("OK"));

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando na porta", process.env.PORT);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

