import express from "express";
import { sendNotification } from "../services/push.service.js";

const router = express.Router();

router.post("/jira", async (req, res) => {
  try {
    const issue = req.body.issue;
    const changelog = req.body.changelog;

    if (!issue) {
      return res.status(400).json({ error: "Issue não encontrada" });
    }

    const issueKey = issue.key;
    const issueTitle = issue.fields.summary;
    const author =
      changelog?.histories?.[0]?.author?.displayName || "Alguém";

    const changes = [];
    const description = buildChangeDescription(
      webhookEvent.changelog,
      author
    );

    if (changelog?.histories?.length) {
      changelog.histories[0].items.forEach(item => {
        changes.push({
          field: item.field,
          from: item.fromString || "—",
          to: item.toString || "—"
        });
      });
    }

    const payload = {
      title: `Jira: ${issueKey}`,
      body: description,
      issueKey,
      author,
      changes,
      timestamp: Date.now()
    };

    await sendNotification(payload);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Erro webhook Jira:", err);
    res.status(500).json({ error: "Erro interno" });
  }

  
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
