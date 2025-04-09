const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

// Webhookエンドポイント
app.post('/webhook', async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;

      const match = userMessage.match(/^(.+?)12R$/);
      if (match) {
        const jyo = match[1];
        const prediction = getPrediction(jyo);

        const replyText = `【${prediction.title}】\n買い目：${prediction.formation}\n\n${prediction.comment}`;
        await replyMessage(event.replyToken, replyText);
      } else {
        const replyText = `「〇〇12R」って形式で送ってね！例：住之江12R`;
        await replyMessage(event.replyToken, replyText);
      }
    }
  }

  res.sendStatus(200);
});

// 返信処理（共通化）
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

// ランダム予想生成
function getPrediction(jyo) {
  const formations = [
    "1-2-3 / 1-3-2 / 2-1-3",
    "3-1-5 / 3-5-1 / 1-3-5",
    "4-1-6 / 4-6-1 / 1-4-6",
    "2-1-4 / 1-2-4 / 2-4-1"
  ];
  const comments = [
    "イン逃げ有利な展開！",
    "センター勢のまくり差しに注意！",
    "4号艇のカド一撃に期待！",
    "波乱の展開もありそう！"
  ];

  const formation = formations[Math.floor(Math.random() * formations.length)];
  const comment = comments[Math.floor(Math.random() * comments.length)];

  return {
    title: `${jyo}12R 予想`,
    formation,
    comment
  };
}

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
