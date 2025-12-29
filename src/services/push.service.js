import webpush from "web-push";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* ==============================
   PATH
================================ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SUBSCRIPTIONS_FILE = path.join(__dirname, "../../data/subscriptions.json");

let vapidInitialized = false;

/* ==============================
   INIT WEB PUSH
================================ */
export function initWebPush() {
  if (vapidInitialized) return;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  vapidInitialized = true;
}

/* ==============================
   SUBSCRIPTIONS
================================ */
export function addSubscription(subscription) {
  let subs = [];

  if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
    subs = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE));
  }

  subs.push(subscription);
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2));
}

/* ==============================
   SEND NOTIFICATION
================================ */
export async function sendNotification(payload) {
  if (!fs.existsSync(SUBSCRIPTIONS_FILE)) return;

  const subs = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE));

  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload));
    } catch (err) {
      console.error("Erro ao enviar push:", err.message);
    }
  }
}

export function removeSubscription(subscription) {
  // Exemplo: se estiver em memória
  subscriptions = subscriptions.filter(
    sub => sub.endpoint !== subscription.endpoint
  );
}

