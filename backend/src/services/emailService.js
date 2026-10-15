const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const getS3Image = require("../utils/getAwss3Image");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Escape dynamic values before inserting them into HTML
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

exports.onboardMail = async ({ gymOwner, gymCenter }) => {
  let templatePath = path.join(__dirname, "../mails/onboardEmail.html");
  let onboardTemplate = fs.readFileSync(templatePath, "utf-8");

  const logoBuffer = await getS3Image("branding/ghub_logo.png");
  const bannerBuffer = await getS3Image("branding/gym_banner.jpg");

  const replacements = {
    "{{OwnerName}}": escapeHtml(gymOwner.firstname + " " + gymOwner.lastname),
    "{{businessEmail}}": escapeHtml(gymCenter.businessEmail),
    "{{GymName}}": escapeHtml(gymCenter.gymName),
    "{{LoginUrl}}": escapeHtml(process.env.FRONTEND_URL),
    "{{SupportEmail}}": escapeHtml(
      process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
    ),
    "{{SupportPhone}}": escapeHtml(
      process.env.SUPPORT_PHONE || "Contact our support team",
    ),
    "{{WebsiteUrl}}": escapeHtml(
      process.env.WEBSITE_URL || process.env.FRONTEND_URL,
    ),
    "{{CurrentYear}}": String(new Date().getFullYear()),
  };

  let html = onboardTemplate;

  for (const [placeholder, value] of Object.entries(replacements)) {
    html = html.split(placeholder).join(value);
  }

  // Send the onboarding email
  const info = await transporter.sendMail({
    from: {
      address: process.env.EMAIL_USER,
      name: "GHub Platform",
    },
    to: gymOwner.email,
    subject: "Welcome to GHub — Your Gym Account Is Ready!",
    html,
    attachments: [
      {
        filename: "ghub_logo.png",
        content: logoBuffer,
        contentType: "image/png",
        cid: "ghub_logo",
        contentDisposition: "inline",
      },
      {
        filename: "gym_banner.jpg",
        content: bannerBuffer,
        contentType: "image/jpg",
        cid: "gym_image",
        contentDisposition: "inline",
      },
    ],
  });
  return info;
};

exports.sendOtpEmail = async ({ email, otp, userName }) => {
  const templatePath = path.join(__dirname, "../mails/otpEmail.html");
  let html = fs.readFileSync(templatePath, "utf-8");

  // Fetch the GHub logo from S3
  const logoBuffer = await getS3Image("branding/ghub_logo.png");

  // Replace template placeholders safely
  const replacements = {
    "{{OwnerName}}": escapeHtml(userName || "User"),
    "{{OTP}}": escapeHtml(otp),
    "{{ExpiryMinutes}}": escapeHtml(process.env.OTP_EXPIRY_MINUTES || "10"),
    "{{SupportEmail}}": escapeHtml(
      process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
    ),
    "{{WebsiteUrl}}": escapeHtml(
      process.env.WEBSITE_URL || process.env.FRONTEND_URL,
    ),
    "{{CurrentYear}}": String(new Date().getFullYear()),
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    html = html.split(placeholder).join(value);
  }

  return transporter.sendMail({
    from: {
      address: process.env.EMAIL_USER,
      name: "GHub Platform",
    },
    to: email,
    subject: "Your GHub Email Verification Code",
    html,
    attachments: [
      {
        filename: "ghub_logo.png",
        content: logoBuffer,
        contentType: "image/png",
        cid: "ghub-logo",
        contentDisposition: "inline",
      },
    ],
  });
};
