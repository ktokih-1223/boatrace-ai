const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { OpenAI } = require('openai'); // OpenAI SDK (v4以降)

const app = express();
app.use(bodyParser.json());

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// OpenAIインスタンス
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Webhookエンドポイント
app.post('/webhook', async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;

      const match = userMessage.match(/^(.+?)12R$/);
      if (match) {
        const jyo = match[1]; // 例：住之江
        const aiReply = await generatePredictionWithOpenAI(jyo);
        await replyMessage(event.replyToken, aiReply);
      } else {
        const replyText = `「〇〇12R」っていう形式で送ってね！例：住之江12R`;
        await replyMessage(event.replyToken, replyText);
      }
    }
  }

  res.sendStatus(200);
});

// OpenAIから予想生成
async function generatePredictionWithOpenAI(jyo) {
  const prompt = `${jyo}12Rのボートレース予想をしてください。\nおすすめの買い目と展開ポイントも簡潔に教えてください。`;

  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  return chatCompletion.choices[0].message.content;
}

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
      },
    }
  );
}

// ポート設定
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
