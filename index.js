const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());
require("dotenv").config();

// ─── CONFIG ────────────────────────────────────────────────────────────────
const {
  VERIFY_TOKEN,           // any string you choose, set in Meta dashboard
  WHATSAPP_TOKEN,         // your Meta permanent access token
  PHONE_NUMBER_ID,        // from Meta App Dashboard
  PORT = 3000,
} = process.env;

// ─── MENU ──────────────────────────────────────────────────────────────────
const MENU = {
  "cold coffee":    { name: "Cold Coffee",       price: 149 },
  "cold brew":      { name: "Cold Brew",          price: 199 },
  "iced latte":     { name: "Iced Latte",         price: 179 },
  "caramel cold":   { name: "Caramel Cold Coffee",price: 189 },
  "espresso tonic": { name: "Espresso Tonic",     price: 219 },
  "mocha frappe":   { name: "Mocha Frappe",       price: 169 },
};

// ─── IN-MEMORY SESSION STORE ────────────────────────────────────────────────
// Key: phone number (e.g. "919876543210")
// Value: { phase, lastItem, lastPrice, collectedName, collectedAddress }
//
// Phases:
//   IDLE → AWAITING_CONFIRM → AWAITING_PAYMENT → AWAITING_NAME → AWAITING_ADDRESS → DONE
const sessions = {};

function getSession(phone) {
  if (!sessions[phone]) {
    sessions[phone] = {
      phase: "IDLE",
      lastItem: null,
      lastPrice: 0,
      collectedName: "",
      collectedAddress: "",
    };
  }
  return sessions[phone];
}

function resetSession(phone) {
  sessions[phone] = {
    phase: "IDLE",
    lastItem: null,
    lastPrice: 0,
    collectedName: "",
    collectedAddress: "",
  };
}

// ─── ORDER LOG (in-memory, replace with DB in prod) ────────────────────────
const orders = [];

// ─── SEND WHATSAPP TEXT ────────────────────────────────────────────────────
async function sendMessage(to, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("❌ sendMessage failed:", err?.response?.data || err.message);
  }
}

// ─── GENERATE DUMMY PAYMENT LINK ───────────────────────────────────────────
function generatePayLink(item, price) {
  const id = Math.random().toString(36).slice(2, 8).toUpperCase();
  // Replace with real Razorpay link generation when ready:
  // const link = await razorpay.paymentLink.create({ amount: price*100, currency:"INR", ... })
  return `https://pay.nbc.coffee/order/${id}?item=${encodeURIComponent(item)}&amount=${price}`;
}

// ─── CORE BOT LOGIC ────────────────────────────────────────────────────────
async function handleMessage(phone, rawText) {
  const text = rawText.trim().toLowerCase();
  const session = getSession(phone);

  console.log(`📩 [${phone}] phase=${session.phase} | msg="${rawText}"`);

  // ── AWAITING NAME ──────────────────────────────────────────────────────
  if (session.phase === "AWAITING_NAME") {
    session.collectedName = rawText.trim();
    session.phase = "AWAITING_ADDRESS";
    await sendMessage(phone, `Got it, ${session.collectedName}! 📍 Please share your full delivery address.`);
    return;
  }

  // ── AWAITING ADDRESS ───────────────────────────────────────────────────
  if (session.phase === "AWAITING_ADDRESS") {
    session.collectedAddress = rawText.trim();

    const order = {
      id: "NBC" + Date.now().toString().slice(-6),
      phone,
      name: session.collectedName,
      address: session.collectedAddress,
      item: MENU[session.lastItem].name,
      price: session.lastPrice,
      timestamp: new Date().toISOString(),
    };
    orders.push(order);

    console.log("✅ NEW ORDER:", JSON.stringify(order, null, 2));

    await sendMessage(
      phone,
      `✅ Order Confirmed!\n\n` +
      `📦 ${order.item}\n` +
      `💰 ₹${order.price}\n` +
      `👤 ${order.name}\n` +
      `📍 ${order.address}\n` +
      `🆔 Order ID: ${order.id}\n\n` +
      `Your order is being prepared! Ready in 10–15 mins ☕`
    );

    resetSession(phone);
    return;
  }

  // ── AWAITING PAYMENT CONFIRMATION ─────────────────────────────────────
  if (session.phase === "AWAITING_PAYMENT") {
    if (["paid", "done", "payment done", "pay done"].includes(text)) {
      session.phase = "AWAITING_NAME";
      await sendMessage(phone, `🎉 Payment received! \n\nTo deliver your order, please tell me your *name*.`);
    } else {
      await sendMessage(phone, `Waiting for your payment. Tap the link above to pay ₹${session.lastPrice}.\n\nReply *paid* once done.`);
    }
    return;
  }

  // ── AWAITING CONFIRM ──────────────────────────────────────────────────
  if (session.phase === "AWAITING_CONFIRM") {
    if (["confirm", "yes", "ok", "okay", "haan", "ha"].includes(text)) {
      const link = generatePayLink(session.lastItem, session.lastPrice);
      session.phase = "AWAITING_PAYMENT";
      await sendMessage(
        phone,
        `💳 Complete your payment here:\n\n${link}\n\n` +
        `Amount: ₹${session.lastPrice}\n` +
        `Item: ${MENU[session.lastItem].name}\n\n` +
        `Reply *paid* once payment is done.`
      );
    } else if (["cancel", "no", "nahi", "nope"].includes(text)) {
      resetSession(phone);
      await sendMessage(phone, `Order cancelled. No problem!\n\nType *hi* to start a new order. ☕`);
    } else {
      await sendMessage(
        phone,
        `Reply *confirm* to proceed or *cancel* to go back.\n\nItem: ${MENU[session.lastItem].name} – ₹${session.lastPrice}`
      );
    }
    return;
  }

  // ── IDLE — check for menu item or greeting ────────────────────────────
  const matchedKey = Object.keys(MENU).find((k) => text.includes(k));

  if (matchedKey) {
    session.lastItem = matchedKey;
    session.lastPrice = MENU[matchedKey].price;
    session.phase = "AWAITING_CONFIRM";

    await sendMessage(
      phone,
      `☕ *${MENU[matchedKey].name}*\n\n` +
      `Price: *₹${MENU[matchedKey].price}*\n` +
      `Size: Regular (300ml)\n\n` +
      `Reply *confirm* to order or *cancel* to go back.`
    );
    return;
  }

  if (["hi", "hello", "hey", "hii", "start", "menu"].includes(text)) {
    await sendMessage(
      phone,
      `👋 Welcome to *Nothing Before Coffee*!\n\n` +
      `Here's our menu:\n\n` +
      `☕ Cold Coffee – ₹149\n` +
      `🧊 Cold Brew – ₹199\n` +
      `🥛 Iced Latte – ₹179\n` +
      `🍮 Caramel Cold – ₹189\n` +
      `🍋 Espresso Tonic – ₹219\n` +
      `🍫 Mocha Frappe – ₹169\n\n` +
      `Just type the name of your order!`
    );
    return;
  }

  // Fallback
  await sendMessage(
    phone,
    `Sorry, I didn't get that 🤔\n\nType *hi* to see the menu or just type a coffee name like "cold coffee".`
  );
}

// ─── WEBHOOK VERIFICATION (Meta requires this) ─────────────────────────────
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];


  console.log("Meta sent token:", token);
  console.log("Our token:", VERIFY_TOKEN);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified by Meta");
    res.status(200).send(challenge);
  } else {
    console.warn("❌ Webhook verification failed");
    res.sendStatus(403);
  }
});

// ─── INCOMING MESSAGES ─────────────────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  // Always ack immediately — Meta will retry if you take too long
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages) return; // status updates, ignore

    const msg = value.messages[0];
    if (msg.type !== "text") return; // ignore media for now

    const phone = msg.from;           // e.g. "919876543210"
    const text = msg.text.body;

    await handleMessage(phone, text);
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
  }
});

// ─── ADMIN: VIEW ALL ORDERS ────────────────────────────────────────────────
app.get("/orders", (req, res) => {
  res.json({ total: orders.length, orders });
});

// ─── ADMIN: VIEW ACTIVE SESSIONS ──────────────────────────────────────────
app.get("/sessions", (req, res) => {
  res.json(sessions);
});

// ─── START ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 NBC WhatsApp Bot running on port ${PORT}`);
  console.log(`📡 Webhook: POST /webhook`);
  console.log(`📋 Orders:  GET  /orders`);
});