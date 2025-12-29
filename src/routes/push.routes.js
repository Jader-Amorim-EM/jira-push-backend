import express from "express";
import {
  addSubscription,
  sendNotification,
  removeSubscription, 
  initWebPush
} from "../services/push.service.js";

const router = express.Router();

/* ==============================
   RECEBER SUBSCRIPTION
================================ */
router.post("/subscribe", (req, res) => {
  initWebPush(); // 👈 AGORA O ENV JÁ EXISTE
  addSubscription(req.body);
  res.status(201).json({ message: "Subscription salva" });
});

/* ==============================
   TESTE DE NOTIFICAÇÃO
================================ */
router.post("/notify", async (req, res) => {
  initWebPush();

  await sendNotification({
    title: "Teste Jira Notifier",
    body: "Push funcionando 🚀",
    url: "/"
  });

  res.json({ message: "Notificação enviada" });
});

export default router;

/* ==============================
   PAUSAR DE NOTIFICAÇÃO
================================ */
router.post("/unsubscribe", async (req, res) => {
  const subscription = req.body;

  if (!subscription?.endpoint) {
    return res.status(400).json({ error: "Subscription inválida" });
  }

  removeSubscription(subscription.endpoint);

  res.json({ success: true });
});
