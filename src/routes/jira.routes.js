import express from "express";
import { sendNotification, initWebPush } from "../services/push.service.js";

const router = express.Router();

router.post("/jira", async (req, res) => {
  try {
    const jiraPayload = req.body;

    const issueKey = jiraPayload.issue?.key;
    const summary = jiraPayload.issue?.fields?.summary;
    const eventType = jiraPayload.webhookEvent;

    if (!issueKey) {
      return res.status(200).json({ message: "Evento ignorado" });
    }

    initWebPush();

    await sendNotification({
      title: `Jira: ${issueKey}`,
      body: `${summary || "Issue atualizada"} (${eventType})`,
      issueKey,
      jiraBaseUrl: "https://escolarmanager.atlassian.net",
      url: `https://escolarmanager.atlassian.net/browse/${issueKey}`
    });

    res.status(200).json({ message: "Notificação enviada" });
  } catch (error) {
    console.error("Erro no webhook Jira:", error);
    res.status(500).json({ error: "Erro ao processar webhook" });
  }
});

export default router;
