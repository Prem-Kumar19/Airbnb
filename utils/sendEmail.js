const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, text) {
  const msg = {
    to,
    from: "myairbnbwanderlust@gmail.com", // your verified sender
    subject,
    text,
  };

  await sgMail.send(msg);
}

module.exports = sendEmail;
