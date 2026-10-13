const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

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

exports.onboardMail = async (gymOwner, gymCenter) => {
  let templatePath = path.join(__dirname, "../mails/onboardMail.html");
  let onboardTemplate = fs.readFileSync(templatePath, "utf-8");

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
  });
  return info;
};
