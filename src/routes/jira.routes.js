import express from "express";
import { sendNotification } from "../services/push.service.js";

const router = express.Router();

router.post("/webhook", async (req, res) => {
  const { webhookEvent, issue, changelog, user } = req.body;

  if (!issue) {
    return res.status(400).send("Payload inválido");
  }

  const issueKey = issue.key;
  const summary = issue.fields?.summary || "Sem resumo";
  const author = user?.displayName || "Alguém";

  let description = "Atualização sem detalhes";

  // 🔹 Se for update e tiver changelog
  if (webhookEvent === "jira:issue_updated" && changelog?.items?.length) {
    const changes = changelog.items.map(item => {
      if (item.field === "status") {
        return `Status: ${item.fromString} → ${item.toString}`;
      }

      if (item.field === "assignee") {
        return `Responsável: ${item.fromString || "Ninguém"} → ${item.toString || "Ninguém"}`;
      }

      return `${item.field}: ${item.fromString} → ${item.toString}`;
    });

    description = changes.join(" | ");
  }

  const payload = {
    title: `Jira: ${issueKey}`,
    body: `${author} atualizou a issue`,
    description,              // 👈 agora o histórico fica rico
    issueKey,
    timestamp: Date.now()
  };

  await sendNotification(payload);

  res.sendStatus(200);
});


function buildChangeDescription(changelog, author) {
  if (!changelog?.items?.length) {
    return `${author} realizou uma atualização (sem detalhes)`;
  }

  return changelog.items.map(item => {
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
  }).join(" | ");
}


export default router;
