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
      body: `${issueTitle}`,
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

export default router;
