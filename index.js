const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const app = express();
app.use(express.json());
require("dotenv").config();

// ─── CONFIG ────────────────────────────────────────────────────────────────
const {
  VERIFY_TOKEN,
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
  MONGO_URI,
  BASE_URL,       // e.g. https://yourdomain.com — used to build profile link
  PORT = 3000,
} = process.env;

// ─── MONGODB ───────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI || "mongodb://localhost:27017/beastlife");
mongoose.connection.on("connected", () => console.log("✅ MongoDB connected"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB:", err));

const userSchema = new mongoose.Schema({
  phone:       { type: String, required: true, unique: true },
  profileId:   { type: String, required: true, unique: true },
  name:        String,
  dob:         String,
  weight:      String,
  goal:        String,
  activeLevel: { type: String, enum: ["BEG", "INTER", "PRO"] },
  gymSince:    String,
  profileLink: String,
  createdAt:   { type: Date, default: Date.now },
});
const UserProfile = mongoose.model("UserProfile", userSchema);

// ─── SESSION STORE ─────────────────────────────────────────────────────────
// step: IDLE | NAME | DOB | WEIGHT | GOAL | ACTIVE_LEVEL | GYM_SINCE | DONE
const sessions = {};

function getSession(phone) {
  if (!sessions[phone]) {
    sessions[phone] = { step: "IDLE", data: {} };
  }
  return sessions[phone];
}

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

// ─── CORE HANDLER ──────────────────────────────────────────────────────────
async function handleMessage(phone, text) {
  const session = getSession(phone);
  const input = text.trim();

  switch (session.step) {

    // Any first message kicks off the flow
    case "IDLE": {
      // Check if user already completed onboarding
      const existing = await UserProfile.findOne({ phone });
      if (existing) {
        await sendMessage(phone,
          `Welcome back! 💪\nYour profile: ${existing.profileLink}`
        );
        return;
      }
      session.step = "NAME";
      await sendMessage(phone,
        `Hey! 👋 Welcome to BeastLife.\nLet's build your fitness profile.\n\nWhat's your *name*?`
      );
      break;
    }

    case "NAME": {
      if (input.length < 2) {
        await sendMessage(phone, "That doesn't look right. Enter your *name*:");
        return;
      }
      session.data.name = input;
      session.step = "DOB";
      await sendMessage(phone,
        `Nice, ${session.data.name}! 🔥\n\nWhat's your *Date of Birth*? (DD/MM/YYYY)`
      );
      break;
    }

    case "DOB": {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
        await sendMessage(phone, "Use DD/MM/YYYY format. Example: 15/08/2000");
        return;
      }
      session.data.dob = input;
      session.step = "WEIGHT";
      await sendMessage(phone, `What's your current *weight*? (e.g. 72kg or 158lbs)`);
      break;
    }

    case "WEIGHT": {
      if (input.length < 2) {
        await sendMessage(phone, "Enter your weight (e.g. 75kg):");
        return;
      }
      session.data.weight = input;
      session.step = "GOAL";
      await sendMessage(phone,
        `What's your *fitness goal*?\n\nExamples:\n• Fat Loss\n• Muscle Gain\n• Endurance\n• General Fitness`
      );
      break;
    }

    case "GOAL": {
      if (input.length < 3) {
        await sendMessage(phone, "Give a proper goal (e.g. Fat Loss, Muscle Gain):");
        return;
      }
      session.data.goal = input;
      session.step = "ACTIVE_LEVEL";
      await sendMessage(phone,
        `What's your *activity level*?\n\nReply with exactly:\n*BEG* — Beginner\n*INTER* — Intermediate\n*PRO* — Advanced`
      );
      break;
    }

    case "ACTIVE_LEVEL": {
      const level = input.toUpperCase();
      if (!["BEG", "INTER", "PRO"].includes(level)) {
        await sendMessage(phone, "Reply with *BEG*, *INTER*, or *PRO* only.");
        return;
      }
      session.data.activeLevel = level;
      session.step = "GYM_SINCE";
      await sendMessage(phone,
        `Last one 💪\n\nHow long have you been going to the gym?\n(e.g. 3 months, 1 year, just starting, never)`
      );
      break;
    }

    case "GYM_SINCE": {
      if (input.length < 2) {
        await sendMessage(phone, "How long have you been going to the gym? (e.g. 6 months, never):");
        return;
      }
      session.data.gymSince = input;

      // ── Save to MongoDB ─────────────────────────────────────────────────
      const profileId = uuidv4();
      const profileLink = `${BASE_URL || "http://localhost:3000"}/profile/${profileId}`;

      try {
        await UserProfile.create({
          phone,
          profileId,
          ...session.data,
          profileLink,
        });

        session.step = "DONE";

        await sendMessage(phone,
          `✅ Profile saved, ${session.data.name}!\n\nYour BeastLife profile:\n👉 ${profileLink}\n\nNow let's get to work. 💪`
        );
      } catch (err) {
        if (err.code === 11000) {
          // Race condition — profile somehow already exists
          const existing = await UserProfile.findOne({ phone });
          await sendMessage(phone, `Profile already exists!\n👉 ${existing.profileLink}`);
        } else {
          console.error("❌ DB save error:", err);
          await sendMessage(phone, "Something went wrong saving your profile. Try sending any message again.");
          // Reset so they can retry
          sessions[phone] = { step: "IDLE", data: {} };
        }
      }
      break;
    }

    case "DONE": {
      const user = await UserProfile.findOne({ phone });
      await sendMessage(phone,
        `Your profile is already set up! 🏆\n👉 ${user?.profileLink || "Check your earlier messages."}`
      );
      break;
    }
  }
}

// ─── WEBHOOK VERIFICATION ──────────────────────────────────────────────────
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
  res.sendStatus(200); // Always ack immediately

  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages) return;

    const msg = value.messages[0];
    if (msg.type !== "text") return;

    const phone = msg.from;
    const text = msg.text.body;

    await handleMessage(phone, text);
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
  }
});

// ─── GET PROFILE (for the link you send users) ─────────────────────────────
app.get("/profile/:profileId", async (req, res) => {
  const user = await UserProfile.findOne({ profileId: req.params.profileId });
  if (!user) return res.status(404).json({ error: "Profile not found." });

  res.json({
    name:        user.name,
    dob:         user.dob,
    weight:      user.weight,
    goal:        user.goal,
    activeLevel: user.activeLevel,
    gymSince:    user.gymSince,
    createdAt:   user.createdAt,
  });
});

// ─── ADMIN: VIEW SESSIONS ──────────────────────────────────────────────────
app.get("/sessions", (req, res) => res.json(sessions));

// ─── START ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 BeastLife bot running on port ${PORT}`));