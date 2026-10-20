const dns = require("dns");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

// Prefer IPv4 where DNS returns both IPv4 and IPv6 addresses.
dns.setDefaultResultOrder("ipv4first");

const getS3Image = require("../utils/getAwss3Image");

const EMAIL_USER = process.env.EMAIL_USER?.trim();
const EMAIL_FROM = process.env.EMAIL_FROM?.trim() || EMAIL_USER;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL?.trim() || EMAIL_USER;

const EMAIL_HOST = process.env.EMAIL_HOST?.trim() || "smtp.gmail.com";
const EMAIL_PORT = Number(process.env.EMAIL_PORT || 587);
const EMAIL_PASSWORD = process.env.EMAIL_PASS?.trim();
const SMTP_PASSWORD = EMAIL_PASSWORD;

const FRONTEND_URL = process.env.FRONTEND_URL || "";
const WEBSITE_URL = process.env.WEBSITE_URL || FRONTEND_URL;

// Configure SMTP.
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: SMTP_PASSWORD,
  },
});

// Escape dynamic values before inserting them into HTML.
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

// Replace all occurrences of each template placeholder.
const renderTemplate = (templatePath, replacements) => {
  let html = fs.readFileSync(templatePath, "utf8");

  for (const [placeholder, value] of Object.entries(replacements)) {
    html = html.split(placeholder).join(String(value ?? ""));
  }

  return html;
};

// Validate required SMTP configuration before attempting to send.
const validateEmailConfig = () => {
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    throw new Error(
      "Email configuration is incomplete. Set EMAIL_USER and EMAIL_PASS.",
    );
  }

  if (!Number.isInteger(EMAIL_PORT) || EMAIL_PORT < 1 || EMAIL_PORT > 65535) {
    throw new Error("EMAIL_PORT must be a valid port number.");
  }
};

// Load inline images without making the entire email depend on S3.
// If an image cannot be loaded, the email can still be sent.
const loadInlineImages = async (images) => {
  const results = await Promise.allSettled(
    images.map(async (image) => ({
      filename: image.filename,
      content: await getS3Image(image.key),
      contentType: image.contentType,
      cid: image.cid,
      contentDisposition: "inline",
    })),
  );

  return results.flatMap((result, index) => {
    if (result.status === "fulfilled") {
      return [result.value];
    }

    console.error(
      `Could not load email image "${images[index].key}":`,
      result.reason?.message || result.reason,
    );

    return [];
  });
};

// Verify SMTP credentials and connection when needed.
exports.verifyEmailConnection = async () => {
  validateEmailConfig();
  return transporter.verify();
};

// Send a gym owner's onboarding email.
exports.onboardMail = async ({ gymOwner, gymCenter }) => {
  validateEmailConfig();

  if (!gymOwner?.email) {
    throw new Error("Gym owner's email address is missing.");
  }

  const templatePath = path.join(__dirname, "../mails/onboardEmail.html");

  const replacements = {
    "{{OwnerName}}": escapeHtml(
      `${gymOwner.firstname || ""} ${gymOwner.lastname || ""}`.trim() ||
        "Gym Owner",
    ),
    "{{BusinessEmail}}": escapeHtml(gymCenter?.businessEmail || ""),
    "{{GymName}}": escapeHtml(gymCenter?.gymName || "Your Gym"),
    "{{LoginUrl}}": escapeHtml(FRONTEND_URL),
    "{{SupportEmail}}": escapeHtml(SUPPORT_EMAIL),
    "{{SupportPhone}}": escapeHtml(
      process.env.SUPPORT_PHONE || "Contact our support team",
    ),
    "{{WebsiteUrl}}": escapeHtml(WEBSITE_URL),
    "{{CurrentYear}}": String(new Date().getFullYear()),
  };

  const html = renderTemplate(templatePath, replacements);

  const attachments = await loadInlineImages([
    {
      key: "branding/ghub_logo.png",
      filename: "ghub_logo.png",
      contentType: "image/png",
      cid: "ghub_logo",
    },
    {
      key: "branding/gym_banner.jpg",
      filename: "gym_banner.jpg",
      contentType: "image/jpg",
      cid: "gym_banner",
    },
  ]);

  return transporter.sendMail({
    from: {
      address: EMAIL_FROM,
      name: "GHub Platform",
    },
    to: gymOwner.email,
    subject: "Welcome to GHub — Your Gym Account Is Ready!",
    html,
    attachments,
  });
};

// Send an email verification OTP.
exports.sendOtpEmail = async ({ email, otp, userName }) => {
  validateEmailConfig();

  if (!email) {
    throw new Error("Recipient email address is missing.");
  }

  if (otp === undefined || otp === null || String(otp).trim() === "") {
    throw new Error("OTP is missing.");
  }

  const templatePath = path.join(__dirname, "../mails/otpEmail.html");

  const replacements = {
    "{{OwnerName}}": escapeHtml(userName || "User"),
    "{{OTP}}": escapeHtml(otp),
    "{{ExpiryMinutes}}": escapeHtml(process.env.OTP_EXPIRY_MINUTES || "10"),
    "{{SupportEmail}}": escapeHtml(SUPPORT_EMAIL),
    "{{WebsiteUrl}}": escapeHtml(WEBSITE_URL),
    "{{CurrentYear}}": String(new Date().getFullYear()),
  };

  const html = renderTemplate(templatePath, replacements);

  const attachments = await loadInlineImages([
    {
      key: "branding/ghub_logo.png",
      filename: "ghub_logo.png",
      contentType: "image/png",
      cid: "ghub_logo",
    },
  ]);

  return transporter.sendMail({
    from: {
      address: EMAIL_FROM,
      name: "GHub Platform",
    },
    to: email,
    subject: "Your GHub Email Verification Code",
    html,
    attachments,
  });
};
