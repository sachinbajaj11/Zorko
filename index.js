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

// ─── CHALLENGE SCHEMA ─────────────────────────────────────────────────────
const challengeSchema = new mongoose.Schema({
  key:                { type: String, unique: true },
  name:               { type: String, required: true },
  description:        { type: String, required: true },
  type:               { type: String, required: true },
  difficulty:         { type: String, enum: ["BEGINNER","INTERMEDIATE","ADVANCED","ELITE"], required: true },
  durationDays:       { type: Number, required: true },
  duration:           String,
  maxParticipants:    { type: Number, default: 0 },
  price:              { type: Number, default: 0 },
  benefits:           [String],
  winningReward:      String,
  losingConsequences: String,
  proofInstructions:  [String],
  // What type of proof does the challenge require?
  // e.g. "video", "photo", "video_or_photo"
  requiredProofType:  { type: String, enum: ["video", "photo", "video_or_photo"], default: "video_or_photo" },
  createdAt:          { type: Date, default: Date.now },
});
const Challenge = mongoose.model("Challenge", challengeSchema);

// ─── PROOF SCHEMA ─────────────────────────────────────────────────────────
const proofSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile", required: true },
  phone:            { type: String, required: true },
  userName:         { type: String },
  challengeKey:     { type: String, required: true },
  challengeName:    { type: String },

  // What the challenge actually required (pulled from challenge.requiredProofType at time of submission)
  requiredProofType: { type: String, enum: ["video", "photo", "video_or_photo"], default: "video_or_photo" },

  // What the user actually submitted
  submittedProofType: { type: String, enum: ["video", "photo", "audio", "document", "other"], required: true },

  // WhatsApp media details
  mediaId:          { type: String },   // WhatsApp media ID (use to fetch download URL)
  mediaUrl:         { type: String },   // resolved download URL (optional, cached)
  mimeType:         { type: String },   // e.g. "video/mp4", "image/jpeg"
  caption:          { type: String },   // user's caption text

  // Day number (parsed from caption e.g. "Day 5" or auto-counted)
  dayNumber:        { type: Number, default: 1 },

  // Review status
  status:           { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  reviewNote:       { type: String },   // admin rejection reason
  reviewedAt:       { type: Date },
  reviewedBy:       { type: String, default: "admin" },

  submittedAt:      { type: Date, default: Date.now },
});
const Proof = mongoose.model("Proof", proofSchema);

// ─── SETTINGS SCHEMA ──────────────────────────────────────────────────────
const settingsSchema = new mongoose.Schema({
  key:       { type: String, required: true, unique: true },
  value:     mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now },
});
const Setting = mongoose.model("Setting", settingsSchema);

// ─── SLUG GENERATOR ───────────────────────────────────────────────────────
function toSlug(str) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    + "-" + Date.now().toString(36);
}

// ─── PARSE DAY NUMBER FROM CAPTION ────────────────────────────────────────
function parseDayNumber(caption) {
  if (!caption) return null;
  const match = caption.match(/day[\s\-_#]*(\d+)/i);
  return match ? parseInt(match[1]) : null;
}

// ─── MAP MIME TO PROOF TYPE ────────────────────────────────────────────────
function mimeToProofType(mimeType) {
  if (!mimeType) return "other";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("image/")) return "photo";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

app.get("/admin/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin_dashboard.html"));
});

app.get("/admin/create-challenge", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "create_challenge.html"));
});

app.get("/admin/proofs", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "proof_review.html"));
});

app.post("/admin/challenges", async (req, res) => {
  try {
    const {
      name, description, type, durationDays,
      difficulty, maxParticipants, price,
      benefits, winningReward, losingConsequences,
      proofInstructions, requiredProofType,
    } = req.body;

    if (!name || !description || !type || !durationDays || !difficulty) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    if (!["BEGINNER","INTERMEDIATE","ADVANCED","ELITE"].includes(difficulty)) {
      return res.status(400).json({ error: "Invalid difficulty value." });
    }

    const key = toSlug(name);
    const duration = `${durationDays} ${durationDays === 1 ? "Day" : "Days"}`;

    const challenge = await Challenge.create({
      key, name, description, type,
      durationDays: parseInt(durationDays),
      duration,
      difficulty,
      maxParticipants: parseInt(maxParticipants) || 0,
      price: parseFloat(price) || 0,
      benefits: Array.isArray(benefits) ? benefits.filter(Boolean) : [],
      winningReward: winningReward || "",
      losingConsequences: losingConsequences || "",
      proofInstructions: Array.isArray(proofInstructions) ? proofInstructions.filter(Boolean) : [],
      requiredProofType: requiredProofType || "video_or_photo",
    });

    res.status(201).json({ success: true, challenge });
  } catch (err) {
    console.error("❌ Create challenge error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Get all challenges ───────────────────────────────────────────
app.get("/admin/api/challenges", async (req, res) => {
  try {
    const list = await Challenge.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Delete a challenge ───────────────────────────────────────────
app.delete("/admin/challenges/:id", async (req, res) => {
  try {
    const result = await Challenge.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Challenge not found." });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Get all users ────────────────────────────────────────────────
app.get("/admin/api/users", async (req, res) => {
  try {
    const users = await UserProfile.find().select("-__v").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Get all challenge entries ───────────────────────────────────
app.get("/admin/api/entries", async (req, res) => {
  try {
    const entries = await UserChallenge.find()
      .populate("userId", "name phone")
      .sort({ joinedAt: -1 });

    const challengeMap = {};
    const challenges = await Challenge.find().select("key name");
    challenges.forEach(c => { challengeMap[c.key] = c.name; });

    const result = entries.map(e => ({
      _id:           e._id,
      userId:        e.userId?._id,
      userName:      e.userId?.name || "—",
      phone:         e.phone,
      challengeKey:  e.challengeKey,
      challengeName: challengeMap[e.challengeKey] || e.challengeKey,
      status:        e.status,
      joinedAt:      e.joinedAt,
      completedAt:   e.completedAt || null,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// PROOF API ROUTES
// ══════════════════════════════════════════════════════════════════════════

// ─── GET all proofs (with challenge + user info merged) ────────────────
app.get("/admin/api/proofs", async (req, res) => {
  try {
    const { status, challengeKey, phone } = req.query;
    const filter = {};
    if (status)       filter.status       = status;
    if (challengeKey) filter.challengeKey = challengeKey;
    if (phone)        filter.phone        = phone;

    const proofs = await Proof.find(filter).sort({ submittedAt: -1 });

    // For each proof, attach per-challenge stats for that user
    const enriched = await Promise.all(proofs.map(async p => {
      const [total, approved, rejected, pending] = await Promise.all([
        Proof.countDocuments({ phone: p.phone, challengeKey: p.challengeKey }),
        Proof.countDocuments({ phone: p.phone, challengeKey: p.challengeKey, status: "APPROVED" }),
        Proof.countDocuments({ phone: p.phone, challengeKey: p.challengeKey, status: "REJECTED" }),
        Proof.countDocuments({ phone: p.phone, challengeKey: p.challengeKey, status: "PENDING" }),
      ]);
      return {
        _id:               p._id,
        userId:            p.userId,
        phone:             p.phone,
        userName:          p.userName,
        challengeKey:      p.challengeKey,
        challengeName:     p.challengeName,
        requiredProofType: p.requiredProofType,
        submittedProofType:p.submittedProofType,
        mediaId:           p.mediaId,
        mediaUrl:          p.mediaUrl,
        mimeType:          p.mimeType,
        caption:           p.caption,
        dayNumber:         p.dayNumber,
        status:            p.status,
        reviewNote:        p.reviewNote,
        reviewedAt:        p.reviewedAt,
        submittedAt:       p.submittedAt,
        // Per-user per-challenge stats
        stats: { total, approved, rejected, pending },
      };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET proof stats summary (for dashboard badges) ───────────────────
app.get("/admin/api/proofs/stats", async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      Proof.countDocuments(),
      Proof.countDocuments({ status: "PENDING" }),
      Proof.countDocuments({ status: "APPROVED" }),
      Proof.countDocuments({ status: "REJECTED" }),
    ]);
    res.json({ total, pending, approved, rejected });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REVIEW a proof ────────────────────────────────────────────────────
app.post("/admin/proofs/:id/review", async (req, res) => {
  try {
    const { action, reason } = req.body; // action: "APPROVED" | "REJECTED"
    if (!["APPROVED", "REJECTED"].includes(action)) {
      return res.status(400).json({ error: "action must be APPROVED or REJECTED" });
    }

    const proof = await Proof.findByIdAndUpdate(
      req.params.id,
      {
        status:     action,
        reviewNote: reason || "",
        reviewedAt: new Date(),
      },
      { new: true }
    );
    if (!proof) return res.status(404).json({ error: "Proof not found." });

    // Notify user via WhatsApp
    const msg = action === "APPROVED"
      ? `✅ Proof APPROVED!\n\nDay ${proof.dayNumber} for *${proof.challengeName}* has been verified.\n\nKeep going, ${proof.userName}! You're doing amazing. 💪🔥`
      : `❌ Proof REJECTED.\n\nDay ${proof.dayNumber} for *${proof.challengeName}* was not approved.\n\n${reason ? `Reason: ${reason}\n\n` : ""}Please re-submit with a clear video/photo. You have until 11:59 PM.`;

    await sendMessage(proof.phone, msg);
    res.json({ success: true, proof });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET proofs for a specific user+challenge ─────────────────────────
app.get("/admin/api/proofs/user/:phone/challenge/:key", async (req, res) => {
  try {
    const proofs = await Proof.find({
      phone: req.params.phone,
      challengeKey: req.params.key,
    }).sort({ submittedAt: -1 });

    const stats = {
      total:    proofs.length,
      approved: proofs.filter(p => p.status === "APPROVED").length,
      rejected: proofs.filter(p => p.status === "REJECTED").length,
      pending:  proofs.filter(p => p.status === "PENDING").length,
    };

    res.json({ proofs, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/challenges", async (req, res) => {
  try {
    const list = await Challenge.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/challenge/:challengeKey", async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ key: req.params.challengeKey });
    if (!challenge) return res.status(404).json({ error: "Challenge not found." });

    const phone = req.query.phone;

    if (phone) {
      const user = await UserProfile.findOne({ phone });
      if (user && !user.onboardingStep) {
        await UserProfile.findByIdAndUpdate(user._id, {
          pendingChallengeKey: challenge.key,
        });
        await sendMessage(phone, formatChallengeMessage(challenge));
      } else if (!user) {
        return res.status(404).json({ error: "User not found. Complete onboarding first." });
      } else if (user.onboardingStep) {
        return res.status(400).json({ error: "User has not completed onboarding." });
      }
    }

    return res.json({
      ...challenge.toObject(),
      message: phone
        ? "Challenge brief sent to your WhatsApp. Reply JOIN or SKIP."
        : "Add ?phone=YOUR_WHATSAPP_NUMBER to receive this challenge on WhatsApp.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
      await Proof.deleteMany({ userId: user._id });
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

  // ─── CHALLENGE CONFIRM FLOW (Already good, but slightly improved) ─────────────
if (user.pendingChallengeKey) {
  const upper = input.toUpperCase();
  const challenge = await Challenge.findOne({ key: user.pendingChallengeKey });

  if (!challenge) {
    await UserProfile.findByIdAndUpdate(user._id, { pendingChallengeKey: null });
    await sendMessage(phone, "❌ That challenge no longer exists.");
    return;
  }

  if (upper === "JOIN") {
    // === ONE CHALLENGE AT A TIME CHECK ===
    const activeEntry = await UserChallenge.findOne({
      userId: user._id,
      status: "ACTIVE",
    });

    if (activeEntry) {
      await UserProfile.findByIdAndUpdate(user._id, { pendingChallengeKey: null });

      const activeChallenge = await Challenge.findOne({ key: activeEntry.challengeKey });
      await sendMessage(phone,
        `⚠️ You are already participating in:\n\n` +
        `*${activeChallenge?.name || activeEntry.challengeKey}*\n\n` +
        `BeastLife allows **only one active challenge at a time**.\n\n` +
        `Complete your current challenge before joining a new one. 💪`
      );
      return;
    }

    // Create new challenge entry
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
      `🎉 Welcome to the challenge, ${user.name || 'Beast'}!\n\n` +
      `*${challenge.name}* is now ACTIVE.\n\n` +
      `📸 Submit your daily proof with caption like:\n` +
      `*PROOF Day 1*  or  *Day-1*\n\n` +
      `No excuses. Consistency wins. 🔥`
    );
    return;
  }

  if (upper === "SKIP") {
    await UserProfile.findByIdAndUpdate(user._id, { pendingChallengeKey: null });
    await sendMessage(phone, "Challenge skipped. Come back when you're ready. 💪");
    return;
  }

  await sendMessage(phone, "Please reply with *JOIN* or *SKIP* only.");
  return;
}

  // ── Onboarding flow ───────────────────────────────────────────────────────
  const step = user.onboardingStep;

  if (!step) {
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
      await UserProfile.findByIdAndUpdate(user._id, { dob: input, onboardingStep: "WEIGHT" });
      await sendMessage(phone, `What's your current *weight*? (e.g. 72kg or 158lbs)`);
      break;
    }
    case "WEIGHT": {
      if (input.length < 2) {
        await sendMessage(phone, "Enter your weight (e.g. 75kg):");
        return;
      }
      await UserProfile.findByIdAndUpdate(user._id, { weight: input, onboardingStep: "GOAL" });
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
      await UserProfile.findByIdAndUpdate(user._id, { goal: input, onboardingStep: "ACTIVE_LEVEL" });
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
      await UserProfile.findByIdAndUpdate(user._id, { activeLevel: level, onboardingStep: "GYM_SINCE" });
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
        onboardingStep: null,
      });
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

// ─── HANDLE MEDIA MESSAGE (PROOF SUBMISSION) ───────────────────────────────
async function handleMediaMessage(phone, msg) {
  try {
    const user = await UserProfile.findOne({ phone });
    if (!user || user.onboardingStep) {
      // User not fully onboarded
      if (user?.onboardingStep) {
        await sendMessage(phone, "Please complete your profile setup first.");
      }
      return;
    }

    // Find active challenge
    const activeEntry = await UserChallenge.findOne({
      userId: user._id,
      status: "ACTIVE"
    });

    if (!activeEntry) {
      await sendMessage(phone,
        `You don't have any active challenge right now.\n\n` +
        `Visit your profile to join one:\n👉 ${user.profileLink}`
      );
      return;
    }

    // Get full challenge details
    const challenge = await Challenge.findOne({ key: activeEntry.challengeKey });
    if (!challenge) {
      await sendMessage(phone, "Challenge data not found. Contact admin.");
      return;
    }

    // Extract media object
    let mediaObj = null;
    if (msg.type === "image") mediaObj = msg.image;
    else if (msg.type === "video") mediaObj = msg.video;
    else if (msg.type === "audio") mediaObj = msg.audio;
    else if (msg.type === "document") mediaObj = msg.document;
    else return; // Ignore other types

    if (!mediaObj?.id) {
      await sendMessage(phone, "Media not received properly. Please try again.");
      return;
    }

    const submittedProofType = mimeToProofType(mediaObj.mime_type || "");
    const caption = mediaObj.caption || msg.caption || "";
    const dayNumber = parseDayNumber(caption) || await getNextDayNumber(user._id, activeEntry.challengeKey);

    // === SAVE PROOF WITH CORRECT CHALLENGE DETAILS ===
    const proof = await Proof.create({
      userId:            user._id,
      phone,
      userName:          user.name || "User",
      challengeKey:      challenge.key,
      challengeName:     challenge.name,
      requiredProofType: challenge.requiredProofType,
      submittedProofType,
      mediaId:           mediaObj.id,
      mediaUrl:          null,           // You can resolve URL later if needed
      mimeType:          mediaObj.mime_type,
      caption:           caption,
      dayNumber,
      status:            "PENDING",
    });

    const totalProofs = await Proof.countDocuments({
      userId: user._id,
      challengeKey: challenge.key
    });

    const typeMatch = checkProofTypeMatch(challenge.requiredProofType, submittedProofType);

    if (!typeMatch) {
      await sendMessage(phone,
        `⚠️ Proof received but type mismatch!\n\n` +
        `Required: ${formatProofType(challenge.requiredProofType)}\n` +
        `Submitted: ${submittedProofType}\n\n` +
        `Still logged as Day ${dayNumber} (under review).\n\n` +
        `Total submissions: ${totalProofs}`
      );
    } else {
      await sendMessage(phone,
        `✅ Proof for *Day ${dayNumber}* received!\n\n` +
        `Challenge: *${challenge.name}*\n` +
        `Status: PENDING (Admin review)\n\n` +
        `Total proofs: ${totalProofs} 🔥`
      );
    }

    console.log(`📸 Proof saved → ${user.name} | ${challenge.name} | Day ${dayNumber} | ${submittedProofType}`);

  } catch (err) {
    console.error("❌ handleMediaMessage error:", err);
    await sendMessage(phone, "Something went wrong while saving your proof. Please try again.");
  }
}

// Helper: get next day number for user+challenge
async function getNextDayNumber(userId, challengeKey) {
  const count = await Proof.countDocuments({ userId, challengeKey });
  return count + 1;
}

// Helper: check if submitted type matches required type
function checkProofTypeMatch(required, submitted) {
  if (required === "video_or_photo") return submitted === "video" || submitted === "photo";
  return required === submitted;
}

// Helper: format proof type for display
function formatProofType(t) {
  const map = { video: "Video 🎥", photo: "Photo 📷", video_or_photo: "Video or Photo 🎥📷" };
  return map[t] || t;
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
    const phone = msg.from;

    if (msg.type === "text") {
      await handleMessage(phone, msg.text.body);
    } else if (["image", "video", "audio", "document"].includes(msg.type)) {
      // It's a media message — handle as proof submission
      await handleMediaMessage(phone, msg);
    }
  } catch (err) {
    console.error("❌ Webhook error:", err);
  }
});

// ─── PROFILE ROUTE ────────────────────────────────────────────────────────
app.get("/profile/:profileId", async (req, res) => {
  const acceptsHtml = req.headers.accept?.includes("text/html");
  if (acceptsHtml) {
    return res.sendFile(path.join(__dirname, "public", "profile.html"));
  }

  try {
    const user = await UserProfile.findOne({ profileId: req.params.profileId })
      .populate("activeChallenges");
    if (!user) return res.status(404).json({ error: "Profile not found." });

    const keys = (user.activeChallenges || []).map(uc => uc.challengeKey);
    const dbChallenges = await Challenge.find({ key: { $in: keys } });
    const cMap = {};
    dbChallenges.forEach(c => { cMap[c.key] = c; });

    const challenges = (user.activeChallenges || []).map((uc) => {
      const cat = cMap[uc.challengeKey] || {};
      return {
        _id:         uc._id,
        challengeId: uc._id,
        key:         uc.challengeKey,
        name:        cat.name        || uc.challengeKey,
        type:        cat.type        || "",
        difficulty:  cat.difficulty  || "",
        duration:    cat.duration    || "",
        status:      uc.status,
        joinedAt:    uc.joinedAt,
        completedAt: uc.completedAt,
      };
    });

    res.json({
      name: user.name, phone: user.phone, dob: user.dob,
      weight: user.weight, goal: user.goal, activeLevel: user.activeLevel,
      gymSince: user.gymSince, profileId: user.profileId,
      challenges, createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// BROADCAST / SETTINGS / CONFIG (unchanged)
// ══════════════════════════════════════════════════════════════════════════

app.post("/admin/send-message", async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) return res.status(400).json({ error: "phone and message are required." });
    await sendMessage(phone, message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/broadcast", async (req, res) => {
  try {
    const { audience, message, challengeKey, phone } = req.body;
    if (!message) return res.status(400).json({ error: "message is required." });

    let targets = [];
    if (audience === "single") {
      if (!phone) return res.status(400).json({ error: "phone is required." });
      targets = [phone];
    } else if (audience === "challenge") {
      if (!challengeKey) return res.status(400).json({ error: "challengeKey is required." });
      const entries = await UserChallenge.find({ challengeKey }).select("phone");
      targets = [...new Set(entries.map(e => e.phone))];
    } else if (audience === "active") {
      const entries = await UserChallenge.find({ status: "ACTIVE" }).select("phone");
      targets = [...new Set(entries.map(e => e.phone))];
    } else if (audience === "completed") {
      const entries = await UserChallenge.find({ status: "COMPLETED" }).select("phone");
      targets = [...new Set(entries.map(e => e.phone))];
    } else {
      const users = await UserProfile.find({ onboardingStep: null }).select("phone");
      targets = users.map(u => u.phone);
    }

    if (!targets.length) return res.json({ success: true, count: 0, message: "No users matched." });

    let sent = 0;
    for (const t of targets) {
      try {
        await sendMessage(t, message);
        sent++;
        if (targets.length > 1) await new Promise(r => setTimeout(r, 300));
      } catch (e) {
        console.error(`❌ Broadcast to ${t} failed:`, e.message);
      }
    }
    res.json({ success: true, count: sent, total: targets.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/settings", async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: "key is required." });
    await Setting.findOneAndUpdate({ key }, { key, value, updatedAt: new Date() }, { upsert: true, new: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/config", async (req, res) => {
  try {
    const fields = ['phoneNumberId','verifyToken','baseUrl','proofWindow','maxChallenges'];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        await Setting.findOneAndUpdate(
          { key: `config_${field}` },
          { key: `config_${field}`, value: req.body[field], updatedAt: new Date() },
          { upsert: true, new: true }
        );
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/api/settings", async (req, res) => {
  try {
    const settings = await Setting.find();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/api/users/:userId", async (req, res) => {
  try {
    const user = await UserProfile.findById(req.params.userId).select("-__v");
    if (!user) return res.status(404).json({ error: "User not found." });

    const entries = await UserChallenge.find({ userId: user._id }).sort({ joinedAt: -1 });
    const keys = [...new Set(entries.map(e => e.challengeKey))];
    const challenges = await Challenge.find({ key: { $in: keys } }).select("key name type difficulty duration");
    const cMap = {};
    challenges.forEach(c => { cMap[c.key] = c; });

    const enrichedEntries = entries.map(e => ({
      _id:           e._id,
      challengeKey:  e.challengeKey,
      challengeName: cMap[e.challengeKey]?.name || e.challengeKey,
      type:          cMap[e.challengeKey]?.type || "",
      difficulty:    cMap[e.challengeKey]?.difficulty || "",
      duration:      cMap[e.challengeKey]?.duration || "",
      status:        e.status,
      joinedAt:      e.joinedAt,
      completedAt:   e.completedAt || null,
    }));

    res.json({ ...user.toObject(), entries: enrichedEntries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SERVE STATIC FILES ────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ─── START ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 BeastLife running on port ${PORT}`));