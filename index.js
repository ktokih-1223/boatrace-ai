const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

// 条件分岐による簡易予想データ（今後ここをAIにしていく）
const predictions = {
  '住之江12R': {
    title: '住之江12R 予想',
    formation: '1-2-3 / 2-1-3 / 1-3-2',
    comment: 'イン逃げ本命。波乱は少なそうなレース。'
  },
  '唐津12R': {
    title: '唐津12R 予想',
    formation: '3-4-5 / 3-5-4 / 4-3-5',
    comment: 'センター勢の攻めに注目。まくり一発あり！'
  }
};

app.post('/webhook', async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;

      if (predictions[userMessage]) {
        const p = predictions[userMessage];
        const replyText = `【${p.title}】\n買い目：${p.formation}\n\n${p.comment}`;
        await replyMessage(event.replyToken, replyText);
      } else {
        const replyText = '「住之江12R」などの形式で送ってね！例：唐津12R';
        await replyMessage(event.replyToken, replyText);
      }
    }
  }

  res.sendStatus(200);
});

async function replyMessage(replyToken, text) {
  await axios.post(
    'https://api.line.me/v2/bot/message/reply',
    {
      replyToken,
      messages: [{ type: 'text', text }]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`
      }
    }
  );
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
