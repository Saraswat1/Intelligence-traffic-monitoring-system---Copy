const express = require("express");
const twilio = require("twilio");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

app.post("/send-message", async (req, res) => {
  const { phone, message } = req.body;

  try {
    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: phone,
    });

    res.status(200).json({ success: true, message: "Message sent!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
