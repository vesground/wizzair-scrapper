const axios = require('axios');
const {TELEGRAM_SECRET} = require('private/secret');

async function send(msg) {
  try {
    return await axios({
      method: 'post',
      url: `https://api.telegram.org/bot${TELEGRAM_SECRET}/sendMessage`,
      data: {
        // hardcoded @vesground
        chat_id: '140422542',
        text: msg,
      }
    });
  } catch (error) {
    console.error('Send telegram message error', error);
  }
}

module.exports = {
  send,
}