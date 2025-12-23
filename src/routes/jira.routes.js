import express from "express";
import { sendNotification, initWebPush } from "../services/push.service.js";

const router = express.Router();

router.post("/jira", async (req, res) => {
  try {

    const issueKey = payload.issue?.key;
    const summary = payload.issue?.fields?.summary;
    const eventType = payload.webhookEvent;
    
    const payload = {
      title: `Jira: ${issueKey}`,
      body: `${summary} (${eventType})`,
      issueKey,
      jiraBaseUrl: "https://escolarmanager.atlassian.net"
    }; 

    if (!issueKey) {
      return res.status(200).json({ message: "Evento ignorado" });
    }

    initWebPush();

    await sendNotification({
      title: `Jira: ${issueKey}`,
      body: `${summary || "Issue atualizada"} (${eventType})`,
      url: `https://SEU_DOMINIO.atlassian.net/browse/${issueKey}`
    });

    res.status(200).json({ message: "Notificação enviada" });
  } catch (error) {
    console.error("Erro no webhook Jira:", error);
    res.status(500).json({ error: "Erro ao processar webhook" });
  }
});

export default router;   // 👈 ESSA LINHA É OBRIGATÓRIA
