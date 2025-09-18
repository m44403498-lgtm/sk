const express = require('express');
const twilio = require('twilio');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// You MUST set these environment variables on your hosting platform.
// DO NOT hard-code them here.
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioNumber) {
    console.error("Missing Twilio environment variables. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.");
    // Exit if the app cannot run without these keys
    process.exit(1);
}

const client = new twilio(accountSid, authToken);

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// API endpoint to send the SMS
app.post('/send-sms', async (req, res) => {
    const { to, body } = req.body;

    // Basic validation
    if (!to || !body) {
        return res.status(400).json({ message: 'Missing phone number or message body.' });
    }

    try {
        await client.messages.create({
            to,
            from: twilioNumber,
            body
        });
        console.log(`SMS sent successfully to ${to}`);
        res.status(200).json({ message: 'SMS sent successfully!' });
    } catch (error) {
        console.error(`Error sending SMS to ${to}:`, error);
        res.status(500).json({ message: 'Failed to send SMS.', error: error.message });
    }
});

// Serve the index.html file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
