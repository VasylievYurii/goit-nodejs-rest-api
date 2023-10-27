const nodemailer = require("nodemailer");
require("dotenv").config();

const { META_EMAIL, META_PASSWORD } = process.env;

const nodemailConfig = {
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: META_EMAIL,
    pass: META_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailConfig);

const sendEmail = (data) => {
  const email = { ...data, from: META_EMAIL };
  return transport.sendMail(email);
};

module.exports = sendEmail;
