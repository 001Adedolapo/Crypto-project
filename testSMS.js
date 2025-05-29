const axios = require('axios');

const apiKey = 'TLzrUkxAvTXpzqpgXCfTgqlGZYTvSxlGZhTrDuXVXfpOWClxunslnMwrKwICiH'; // 🔁 Replace with your actual API key from Termii
const recipientPhoneNumber = '+2348083046264'; // ✅ Use your real phone number

const sendTestSMS = async () => {
  try {
    const response = await axios.post('https://api.ng.termii.com/api/sms/send', {
      to: recipientPhoneNumber,
      from: 'Termii', // ⛔️ DO NOT USE a custom name until your Sender ID is approved
      sms: '📲 Hello from Termii test – This is a test message sent via Node.js!',
      type: 'plain',
      channel: 'generic', // 🔁 try 'dnd' if generic doesn't work
      api_key: apiKey
    });

    console.log('✅ Full Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ SMS Failed:', error.response?.data || error.message);
  }
};

sendTestSMS();

