const sgMail = require("@sendgrid/mail");

// Set SendGrid API Key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, text) {
  console.log("Sending email to:", to, "subject:", subject);

  const msg = {
    to,
    from: "myairbnbwanderlust@gmail.com", // verified sender
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully!");
  } catch (err) {
    console.error("SendGrid Error:", err.response ? err.response.body : err);
    throw err; // propagate error to route
  }
}

module.exports = sendEmail;
