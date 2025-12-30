import express from "express";
import { sendNotification, initWebPush } from "../services/push.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  
  try {
  
const body = req.body || {};

const webhookEvent = body.webhookEvent;
const issue = body.issue;
const user = body.user;
const changelog = body.changelog;

if (!webhookEvent || !issue) {
  console.warn("Webhook inválido recebido");
  return res.status(400).send("Payload inválido");
}

  const issueKey = issue.key;
  const summary = issue.fields?.summary || "Sem resumo";
  const author = user?.displayName || "Alguém";

  // ✅ Usa função centralizada
  const description =
    webhookEvent === "jira:issue_updated"
      ? buildChangeDescription(changelog, author)
      : `${author} realizou uma ação na issue`;

  const payload = {
    title: `Jira: ${issueKey}`,
    body: summary,
    description,
    issueKey,
    timestamp: Date.now()
  };

  await sendNotification(payload);

  res.sendStatus(200);
  } catch (err) {
    console.error("Erro ao processar webhook Jira:", err);
    res.sendStatus(500);
  }

  console.log("Webhook Jira recebido:", req.body?.webhookEvent);
});

/* ======================================================
   FUNÇÃO CENTRALIZADA PARA DESCREVER ALTERAÇÕES
====================================================== */
function buildChangeDescription(changelog, author) {
  if (!changelog?.items?.length) {
    return `${author} realizou uma atualização (sem detalhes)`;
  }

  return changelog.items
    .map(item => {
      switch (item.field) {
        case "status":
          return `${author} alterou o status: ${item.fromString} → ${item.toString}`;

        case "assignee":
          return `${author} alterou o responsável: ${item.fromString || "Ninguém"} → ${item.toString || "Ninguém"}`;

        case "priority":
          return `${author} alterou a prioridade: ${item.fromString} → ${item.toString}`;

        default:
          return `${author} alterou ${item.field}: ${item.fromString || "-"} → ${item.toString || "-"}`;
      }
    })
    .join(" | ");
}

export default router;
