import logger from "../utils/appLogger.js";
import {
  S3Client,
  CopyObjectCommand,
  PutObjectTaggingCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
} from "@aws-sdk/client-rekognition";

const s3 = new S3Client({});
const rekognition = new RekognitionClient({});

// CONFIG
const QUARANTINE_BUCKET =
  process.env.QUARANTINE_BUCKET || "grocery-service-quarantine-s3-bucket";
const MIN_CONFIDENCE = parseFloat(process.env.MIN_CONFIDENCE || "75.0");
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png"]);

const prohibitedLabels = new Set([
  // 🔞 Sexual / Adult Content
  "explicit nudity",
  "suggestive",
  "sexual activity",
  "sexual situations",
  "sexual content",
  "partial nudity",
  "full nudity",
  "female swimwear or underwear",
  "male swimwear or underwear",
  "exposed buttocks or anus",
  "exposed breasts",
  "genitals",
  "intimate body parts",
  "obstructed intimate parts",
  "graphic sexual activity",
  "simulated sexual activity",
  "pornography",
  "erotic",
  "lewd",
  "fetish",
  "sexual fetishism",
  "seductive pose",
  "provocative clothing",
  "lingerie",
  "sex toy",
  "sexually suggestive",
  "sexual exploitation",
  "child exploitation",
  "child nudity",
  "minor sexual content",
  "inappropriate for children",
  "explicit adult content",

  // ⚔️ Violence / Gore
  "violence",
  "graphic violence",
  "graphic violence or gore",
  "weapon violence",
  "weapons",
  "weapon",
  "guns",
  "knife",
  "sword",
  "explosion",
  "firearm",
  "blood",
  "gore",
  "severed body parts",
  "torture",
  "beating",
  "murder",
  "dead body",
  "corpse",
  "killing",
  "shooting",
  "war imagery",
  "terrorism",
  "extremist violence",
  "riot",
  "fight",
  "physical assault",
  "execution",
  "massacre",
  "suicide",
  "self harm",
  "hanging",
  "injury",
  "graphic death",
  "violent protest",

  // ☠️ Hate / Extremism
  "hate symbols",
  "hate symbol",
  "nazi party",
  "swastika",
  "white supremacy",
  "white supremacist",
  "kkk",
  "confederate flag",
  "extremist organization",
  "terrorist organization",
  "terrorism imagery",
  "racial hatred",
  "ethnic violence",
  "hate crime",
  "offensive gesture",
  "rude gestures",
  "rude gesture",
  "middle finger",
  "offensive hand sign",

  // 💊 Drugs / Alcohol / Smoking
  "drugs",
  "drug",
  "illegal drugs",
  "drug use",
  "drug abuse",
  "drug paraphernalia",
  "substance abuse",
  "cocaine",
  "heroin",
  "marijuana",
  "cannabis",
  "weed",
  "meth",
  "pill",
  "narcotic",
  "tobacco",
  "smoking",
  "cigarette",
  "vape",
  "e-cigarette",
  "alcohol",
  "liquor",
  "beer",
  "wine",
  "vodka",
  "whiskey",
  "drinking alcohol",
  "drunkenness",
  "intoxication",

  // 🎰 Gambling / Money
  "gambling",
  "casino",
  "cards",
  "poker",
  "slot machine",
  "roulette",
  "betting",
  "money laundering",
  "lottery",
  "dice gambling",

  // ⚠️ Other Restricted / Sensitive
  "graphic gore",
  "self harm",
  "medical gore",
  "surgery scene",
  "autopsy",
  "injury depiction",
  "corpse handling",
  "funeral body",
  "accident victim",
  "animal abuse",
  "animal cruelty",
  "animal slaughter",
  "blood sport",
  "human trafficking",
  "slavery",
  "torture instruments",
  "execution imagery",
  "death",
  "gruesome",
  "disturbing content",
  "disturbing imagery",
  "dead animal",
  "car crash",
  "disfigurement",
  "child abuse",
  "bullying",
  "hate speech",
  "offensive symbol",
  "profanity",
  "obscene gesture",
  "vulgar expression",
  "derogatory sign",
  "inflammatory content",

  // 🧨 Political / Extremist Imagery (optional, if you filter such)
  "propaganda",
  "military insignia",
  "terrorist propaganda",
  "extremist flag",
  "insurrection",
  "civil unrest",
  "armed conflict",
  "militant group",
  "war scene",
  "political violence",
]);

// --- Utilities ---
function isAllowedImage(key) {
  const lower = key.toLowerCase().split("?")[0];
  return Array.from(ALLOWED_EXTENSIONS).some((ext) =>
    lower.endsWith(`.${ext}`)
  );
}

async function analyzeImage(bucket, key) {
  if (!isAllowedImage(key)) {
    return { action: "skipped", reason: "non-image-extension" };
  }

  const response = await rekognition.send(
    new DetectModerationLabelsCommand({
      Image: { S3Object: { Bucket: bucket, Name: key } },
      MinConfidence: MIN_CONFIDENCE,
    })
  );

  const labels = response.ModerationLabels || [];

  for (const label of labels) {
    const name = (label.Name || "").toLowerCase();
    const parent = (label.ParentName || "").toLowerCase();
    if (prohibitedLabels.has(name) || prohibitedLabels.has(parent)) {
      return {
        action: "quarantined",
        reason: `${label.Name} - ${label.Confidence.toFixed(1)}`,
      };
    }
  }

  return { action: "allowed", reason: "no-prohibited-labels-found" };
}

async function quarantineObject(bucket, key, reason) {
  const quarantineKey = `${bucket}/${Date.now()}-${key}`; // avoid collisions
  await s3.send(
    new CopyObjectCommand({
      CopySource: `${bucket}/${key}`,
      Bucket: QUARANTINE_BUCKET,
      Key: quarantineKey,
    })
  );
  await s3.send(
    new PutObjectTaggingCommand({
      Bucket: QUARANTINE_BUCKET,
      Key: quarantineKey,
      Tagging: { TagSet: [{ Key: "quarantine_reason", Value: reason }] },
    })
  );
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
  return quarantineKey;
}

// --- Main Utility ---
export async function moderateContentFromUrl(url) {
  try {
    // URL format: https://s3.amazonaws.com/bucket/key OR https://bucket.s3.amazonaws.com/key
    const match = url.match(/^https?:\/\/([^/]+)\/(.+)$/);
    if (!match) throw new Error("Invalid S3 URL format.");

    let bucket, key;
    if (match[1].includes(".s3")) {
      // format: bucket.s3.amazonaws.com/key
      bucket = match[1].split(".s3")[0];
      key = decodeURIComponent(match[2]);
    } else {
      // format: s3.amazonaws.com/bucket/key
      const parts = match[2].split("/");
      bucket = parts.shift();
      key = decodeURIComponent(parts.join("/"));
    }

    const { action, reason } = await analyzeImage(bucket, key);

    if (action === "quarantined") {
      const quarantineKey = await quarantineObject(bucket, key, reason);
      return {
        status: "quarantined",
        bucket: QUARANTINE_BUCKET,
        key: quarantineKey,
        reason,
      };
    }

    if (action === "allowed") {
      return { status: "allowed", bucket, key, reason };
    }

    return { status: "skipped", bucket, key, reason };
  } catch (err) {
    logger.error("Moderation failed", "S3-Moderator", err);
    return { status: "error", reason: err.message };
  }
}
