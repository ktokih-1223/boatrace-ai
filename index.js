const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(bodyParser.json());

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// LINE Webhookエンドポイント
app.post('/webhook', async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;

      const match = userMessage.match(/^(.+?)12R$/);
      if (match) {
        const jyo = match[1];

        // ChatGPTに予想を依頼
        const prompt = `${jyo}12Rのボートレース予想を教えて。買い目と一言コメントをセットで答えて。`;
        const gptRes = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        });

        const replyText = gptRes.data.choices[0].message.content;
        await replyMessage(event.replyToken, replyText);
      } else {
        const replyText = `「〇〇12R」って送ってね！例：住之江12R`;
        await replyMessage(event.replyToken, replyText);
      }
    }
  }

  res.sendStatus(200);
});

// LINE返信用関数
async function replyMessage(replyToken, text) {
  await axios.post(
    'https://api.line.me/v2/bot/message/reply',
    {
      replyToken,
      messages: [{ type: 'text', text }],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      }
    }
  );
}

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
