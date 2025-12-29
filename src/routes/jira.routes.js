import express from "express";
import { sendNotification } from "../services/push.service.js";

const router = express.Router();

/* ==============================
   WEBHOOK JIRA
================================ */
router.post("/jira", async (req, res) => {
  try {
    const event = req.body;
    const issue = event.issue;
    const changelog = event.changelog;

    if (!issue) {
      return res.status(400).send("Evento inválido");
    }

    const issueKey = issue.key;
    const issueSummary = issue.fields?.summary || "";
    const jiraBaseUrl = process.env.JIRA_BASE_URL;

    /* ==============================
       EXTRAIR DETALHES DA MUDANÇA
    ================================ */
    let changeText = "Atualização na issue";

    if (changelog?.items?.length) {
      const item = changelog.items[0];

      if (item.field === "status") {
        changeText = `Status alterado: ${item.fromString} → ${item.toString}`;
      } else {
        changeText = `Campo "${item.field}" alterado`;
      }
    }

    /* ==============================
       PAYLOAD FINAL
    ================================ */
    const payload = {
      title: `Jira: ${issueKey}`,
      body: changeText,
      issueKey,
      jiraBaseUrl,
      summary: issueSummary,
      timestamp: Date.now()
    };

    await sendNotification(payload);

    res.status(200).send("Notificação enviada");
  } catch (err) {
    console.error("Erro no webhook Jira:", err);
    res.status(500).send("Erro interno");
  }
});

export default router;
