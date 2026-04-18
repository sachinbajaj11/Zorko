require("dotenv").config();
const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const app = express();
app.use(express.json());

// ─── CONFIG ────────────────────────────────────────────────────────────────
const {
  VERIFY_TOKEN,
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
  MONGO_URI,
  BASE_URL,
  PORT = 3000,
} = process.env;

// ─── MONGODB ───────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI);
mongoose.connection.on("connected", () => console.log("✅ MongoDB connected"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB:", err));

// ─── SCHEMAS ───────────────────────────────────────────────────────────────
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
  onboardingStep: { type: String, default: "NAME" },
  onboardingData: { type: Object, default: {} },
  activeChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserChallenge" }],
  pendingChallengeKey: { type: String, default: null },
  createdAt:   { type: Date, default: Date.now },
});
const UserProfile = mongoose.model("UserProfile", userSchema);

const userChallengeSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile", required: true },
  phone:        { type: String, required: true },
  challengeKey: { type: String, required: true },
  status:       { type: String, enum: ["ACTIVE", "COMPLETED", "FAILED"], default: "ACTIVE" },
  joinedAt:     { type: Date, default: Date.now },
  completedAt:  Date,
});
const UserChallenge = mongoose.model("UserChallenge", userChallengeSchema);

// ─── CHALLENGES CATALOG ────────────────────────────────────────────────────
const CHALLENGES = {
  "30day-pushup": {
    key:          "30day-pushup",
    name:         "30-Day Push-Up Domination",
    type:         "Strength Endurance",
    difficulty:   "INTERMEDIATE",
    duration:     "30 Days",
    durationDays: 30,
    description:  "Start at 10 push-ups/day. Add 5 every 3 days. Hit 60 by day 30.",
    benefits: [
      "Upper body strength through the roof",
      "Chest, shoulder, and tricep hypertrophy",
      "Mental discipline — showing up every single day",
    ],
    winningReward:       "BeastLife 'Iron Chest' digital badge + featured on leaderboard",
    losingConsequences:  "You restart from Day 1. No shortcuts, no exceptions.",
    proofInstructions: [
      "Record a short video of your reps each day",
      "Send the video to this WhatsApp number with caption: PROOF #30PUSHUP Day-[X]",
      "Submissions accepted until 11:59 PM IST daily",
    ],
  },
  "7day-cut": {
    key:          "7day-cut",
    name:         "7-Day Sugar & Junk Cut",
    type:         "Nutrition",
    difficulty:   "BEGINNER",
    duration:     "7 Days",
    durationDays: 7,
    description:  "Zero sugar, zero processed food, zero alcohol for 7 days straight. Clean whole foods only.",
    benefits: [
      "Detox your gut and reset insulin sensitivity",
      "Visible reduction in bloat within 3-4 days",
      "Break addictive eating patterns for good",
    ],
    winningReward:       "BeastLife 'Clean Machine' digital badge + 7-day meal plan PDF",
    losingConsequences:  "You restart the 7 days from scratch. Your word means nothing if you quit.",
    proofInstructions: [
      "Photo every meal — breakfast, lunch, dinner, and snacks",
      "Send photos daily with caption: PROOF #7DAYCUT Day-[X]",
      "No meal photo = that day doesn't count",
    ],
  },
  "21day-hiit": {
    key:          "21day-hiit",
    name:         "21-Day HIIT Beast Mode",
    type:         "Cardio & Fat Loss",
    difficulty:   "ADVANCED",
    duration:     "21 Days",
    durationDays: 21,
    description:  "3 HIIT sessions per week, minimum 20 minutes each. Heart rate above 75% max. No rest-day skipping.",
    benefits: [
      "Torch fat 3x faster than steady-state cardio",
      "Skyrocket VO2 max and cardiovascular health",
      "Afterburn effect — calories burned for 24hrs post-workout",
    ],
    winningReward:       "BeastLife 'Cardio King/Queen' badge + shoutout in community",
    losingConsequences:  "Miss 2 sessions = challenge voided. You restart from Day 1.",
    proofInstructions: [
      "Screenshot your fitness tracker (heart rate + duration) after each session",
      "Send screenshot with caption: PROOF #21HIIT Day-[X]",
      "Manual submissions without tracker data will NOT be accepted",
    ],
  },
};

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

// ─── FORMAT CHALLENGE MESSAGE ──────────────────────────────────────────────
function formatChallengeMessage(c) {
  return (
    `🔥 *${c.name}*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📌 *Type:* ${c.type}\n` +
    `⏳ *Duration:* ${c.duration}\n\n` +
    `📋 *What it is:*\n${c.description}\n\n` +
    `💪 *Benefits:*\n${c.benefits.map((b) => `• ${b}`).join("\n")}\n\n` +
    `🏆 *Win Reward:*\n${c.winningReward}\n\n` +
    `💀 *Lose Consequences:*\n${c.losingConsequences}\n\n` +
    `📸 *How to Submit Proof:*\n${c.proofInstructions.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `Reply *JOIN* to accept this challenge.\nReply *SKIP* to back out.`
  );
}

// ─── CORE HANDLER ──────────────────────────────────────────────────────────
async function handleMessage(phone, text) {
  const input = text.trim();

  let user = await UserProfile.findOne({ phone });

  if (input.toUpperCase() === "RESTART") {
    if (user) {
      await UserChallenge.deleteMany({ userId: user._id });
      await UserProfile.deleteOne({ phone });
    }
    await sendMessage(phone,
      `🔄 Your data has been wiped completely.\n\nYou're a new user now. Let's start fresh.\n\nWhat's your *name*?`
    );
    await UserProfile.create({
      phone,
      profileId: uuidv4(),
      profileLink: `${BASE_URL || "http://localhost:3000"}/profile/${uuidv4()}`,
      onboardingStep: "NAME",
      onboardingData: {},
    });
    return;
  }

  if (!user) {
    user = await UserProfile.create({
      phone,
      profileId: uuidv4(),
      profileLink: `${BASE_URL || "http://localhost:3000"}/profile/${uuidv4()}`,
      onboardingStep: "NAME",
      onboardingData: {},
    });
    await sendMessage(phone,
      `Hey! 👋 Welcome to BeastLife.\nLet's build your fitness profile.\n\nWhat's your *name*?`
    );
    return;
  }

  // ── Challenge confirm flow ────────────────────────────────────────────────
  if (user.pendingChallengeKey) {
    const upper = input.toUpperCase();
    const challenge = CHALLENGES[user.pendingChallengeKey];

    if (upper === "JOIN") {
      const existing = await UserChallenge.findOne({
        userId: user._id,
        challengeKey: challenge.key,
        status: "ACTIVE",
      });

      if (existing) {
        await UserProfile.findByIdAndUpdate(user._id, { pendingChallengeKey: null });
        await sendMessage(phone, `You're already running *${challenge.name}*. No double-dipping. Finish what you started. 💪`);
        return;
      }

      const entry = await UserChallenge.create({
        userId:       user._id,
        phone,
        challengeKey: challenge.key,
        status:       "ACTIVE",
      });

      await UserProfile.findByIdAndUpdate(user._id, {
        pendingChallengeKey: null,
        $push: { activeChallenges: entry._id },
      });

      await sendMessage(phone,
        `✅ You're IN, ${user.name}.\n\n` +
        `*${challenge.name}* starts NOW.\n\n` +
        `No excuses. No days off. Submit your proof daily or you restart.\n\nLet's see if you're built different. 🔥`
      );
      return;
    }

    if (upper === "SKIP") {
      await UserProfile.findByIdAndUpdate(user._id, { pendingChallengeKey: null });
      await sendMessage(phone, "Challenge skipped. Come back when you're ready to commit. 💪");
      return;
    }

    await sendMessage(phone, "Reply *JOIN* to accept the challenge or *SKIP* to cancel.");
    return;
  }

  // ── Onboarding flow ───────────────────────────────────────────────────────
  const step = user.onboardingStep;

  if (!step) {
    // Onboarding complete — send profile link
    await sendMessage(phone,
      `Your profile is already set up! 🏆\n👉 ${user.profileLink}\n\nVisit your profile to browse and join challenges.`
    );
    return;
  }

  switch (step) {
    case "NAME": {
      if (input.length < 2) {
        await sendMessage(phone, "That doesn't look right. Enter your *name*:");
        return;
      }
      await UserProfile.findByIdAndUpdate(user._id, {
        name: input,
        onboardingStep: "DOB",
      });
      await sendMessage(phone, `Nice, ${input}! 🔥\n\nWhat's your *Date of Birth*? (DD/MM/YYYY)`);
      break;
    }

    case "DOB": {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
        await sendMessage(phone, "Use DD/MM/YYYY format. Example: 15/08/2000");
        return;
      }
      await UserProfile.findByIdAndUpdate(user._id, {
        dob: input,
        onboardingStep: "WEIGHT",
      });
      await sendMessage(phone, `What's your current *weight*? (e.g. 72kg or 158lbs)`);
      break;
    }

    case "WEIGHT": {
      if (input.length < 2) {
        await sendMessage(phone, "Enter your weight (e.g. 75kg):");
        return;
      }
      await UserProfile.findByIdAndUpdate(user._id, {
        weight: input,
        onboardingStep: "GOAL",
      });
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
      await UserProfile.findByIdAndUpdate(user._id, {
        goal: input,
        onboardingStep: "ACTIVE_LEVEL",
      });
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
      await UserProfile.findByIdAndUpdate(user._id, {
        activeLevel: level,
        onboardingStep: "GYM_SINCE",
      });
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

      const profileId = uuidv4();
      const profileLink = `${BASE_URL || "http://localhost:3000"}/profile/${profileId}`;

      await UserProfile.findByIdAndUpdate(user._id, {
        gymSince: input,
        profileId,
        profileLink,
        onboardingStep: null, // onboarding complete
      });

      // ── SEND PROFILE LINK — this is where user first gets their URL ──────
      await sendMessage(phone,
        `✅ Profile saved, ${user.name}!\n\n` +
        `Your BeastLife profile is live:\n👉 ${profileLink}\n\n` +
        `Open the link to browse all challenges and join one. 🔥\n\n` +
        `You'll get the full challenge brief on WhatsApp the moment you hit JOIN on the site.`
      );
      break;
    }
  }
}

// ─── WEBHOOK VERIFICATION ──────────────────────────────────────────────────
app.get("/webhook", (req, res) => {
  const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ─── INCOMING MESSAGES ─────────────────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    if (!value?.messages) return;

    const msg = value.messages[0];
    if (msg.type !== "text") return;

    await handleMessage(msg.from, msg.text.body);
  } catch (err) {
    console.error("❌ Webhook error:", err);
  }
});

// ─── GET ALL CHALLENGES (for frontend) ────────────────────────────────────
// Returns the full catalog as an array, keyed by _id = challenge key
app.get("/challenges", (req, res) => {
  const list = Object.values(CHALLENGES).map((c) => ({
    _id:                c.key,          // use key as _id so frontend can reference it
    key:                c.key,
    name:               c.name,
    type:               c.type,
    difficulty:         c.difficulty,
    duration:           c.duration,
    durationDays:       c.durationDays,
    description:        c.description,
    benefits:           c.benefits,
    winningReward:      c.winningReward,
    losingConsequences: c.losingConsequences,
    proofInstructions:  c.proofInstructions,
  }));
  res.json(list);
});

// ─── CHALLENGE PAGE — triggers WhatsApp message if phone provided ──────────
// Frontend calls: GET /challenge/:challengeKey?phone=PHONENUMBER
app.get("/challenge/:challengeKey", async (req, res) => {
  const challenge = CHALLENGES[req.params.challengeKey];
  if (!challenge) return res.status(404).json({ error: "Challenge not found." });

  const phone = req.query.phone;

  if (phone) {
    const user = await UserProfile.findOne({ phone });
    if (user && !user.onboardingStep) {
      // Set pendingChallengeKey so next WhatsApp reply (JOIN/SKIP) works
      await UserProfile.findByIdAndUpdate(user._id, {
        pendingChallengeKey: challenge.key,
      });
      // Send full challenge brief on WhatsApp
      await sendMessage(phone, formatChallengeMessage(challenge));
    } else if (!user) {
      return res.status(404).json({ error: "User not found. Complete onboarding first." });
    } else if (user.onboardingStep) {
      return res.status(400).json({ error: "User has not completed onboarding." });
    }
  }

  return res.json({
    _id:                challenge.key,
    key:                challenge.key,
    name:               challenge.name,
    type:               challenge.type,
    difficulty:         challenge.difficulty,
    duration:           challenge.duration,
    durationDays:       challenge.durationDays,
    description:        challenge.description,
    benefits:           challenge.benefits,
    winningReward:      challenge.winningReward,
    losingConsequences: challenge.losingConsequences,
    proofInstructions:  challenge.proofInstructions,
    message: phone
      ? "Challenge brief sent to your WhatsApp. Reply JOIN or SKIP."
      : "Add ?phone=YOUR_WHATSAPP_NUMBER to receive this challenge on WhatsApp.",
  });
});

// ─── PROFILE ROUTE (API — returns JSON) ───────────────────────────────────
app.get("/profile/:profileId", async (req, res) => {
  // Serve HTML page if request is from a browser (Accept: text/html)
  const acceptsHtml = req.headers.accept?.includes("text/html");
  if (acceptsHtml) {
    return res.sendFile(path.join(__dirname, "public", "profile.html"));
  }

  // Otherwise return JSON for the frontend JS fetch()
  const user = await UserProfile.findOne({ profileId: req.params.profileId })
    .populate("activeChallenges");
  if (!user) return res.status(404).json({ error: "Profile not found." });

  // Build challenges array with full catalog details merged in
  const challenges = (user.activeChallenges || []).map((uc) => {
    const catalogEntry = CHALLENGES[uc.challengeKey] || {};
    return {
      _id:         uc._id,
      challengeId: uc._id,
      key:         uc.challengeKey,
      name:        catalogEntry.name        || uc.challengeKey,
      type:        catalogEntry.type        || "",
      difficulty:  catalogEntry.difficulty  || "",
      duration:    catalogEntry.duration    || "",
      status:      uc.status,
      joinedAt:    uc.joinedAt,
      completedAt: uc.completedAt,
    };
  });

  res.json({
    name:        user.name,
    phone:       user.phone,
    dob:         user.dob,
    weight:      user.weight,
    goal:        user.goal,
    activeLevel: user.activeLevel,
    gymSince:    user.gymSince,
    profileId:   user.profileId,
    challenges,
    createdAt:   user.createdAt,
  });
});

// ─── SERVE STATIC FILES (HTML/CSS/JS in /public) ──────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ─── START ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 BeastLife running on port ${PORT}`));