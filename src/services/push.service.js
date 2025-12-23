import fs from "fs";
import path from "path";
import webpush from "web-push";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho do arquivo
const DATA_FILE = path.resolve(__dirname, "../../data/subscriptions.json");

// ==============================
// VAPID
// ==============================
let initialized = false;

export function initWebPush() {
  if (initialized) return;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  initialized = true;
}

// ==============================
// SUBSCRIPTIONS (PERSISTENTES)
// ==============================
function loadSubscriptions() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, "[]");
    }

    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Erro ao carregar subscriptions:", err);
    return [];
  }
}

function saveSubscriptions(subscriptions) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(subscriptions, null, 2));
}

export function addSubscription(subscription) {
  const subscriptions = loadSubscriptions();

  const exists = subscriptions.find(
    s => s.endpoint === subscription.endpoint
  );

  if (!exists) {
    subscriptions.push(subscription);
    saveSubscriptions(subscriptions);
    console.log("Subscription salva no disco");
  }
}

export async function sendPushNotification(subscription, payload) {
  if (!payload?.issueKey || !payload?.jiraBaseUrl) {
    console.warn("Push ignorado: payload incompleto", payload);
    return;
  }

  const message = JSON.stringify({
    title: payload.title ?? "Jira",
    body: payload.body ?? "",
    issueKey: payload.issueKey,
    jiraBaseUrl: payload.jiraBaseUrl
  });

  await webpush.sendNotification(subscription, message);
}

export async function sendPush(subscription, issue) {
  const payload = {
    title: `Jira: ${issue.key}`,
    body: `${issue.summary} (${issue.eventType})`,
    issueKey: issue.key,
    jiraBaseUrl: "https://escolarmanager.atlassian.net"
  };

  await webpush.sendNotification(
    subscription,
    JSON.stringify(payload)
  );
}

