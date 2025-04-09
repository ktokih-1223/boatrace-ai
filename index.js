const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

// レースごとの固定予想（ここをどんどん増やせる）
const examplePredictions = {
  "住之江12R": {
    title: "住之江12R 予想",
    formation: "3-1-5 / 1-3-5 / 3-5-1",
    comment: "3号艇のスタートが鋭く、まくり一発に期待！"
  },
  "江戸川12R": {
    title: "江戸川12R 予想",
    formation: "1-2-4 / 2-1-4 / 1-4-2",
    comment: "イン逃げ濃厚！差し切る展開も想定して手広く！"
  },
  "平和島12R": {
    title: "平和島12R 予想",
    formation: "4-1-6 / 4-6-1 / 1-4-6",
    comment: "4号艇のカドまくりが決まれば波乱の展開！"
  }
};

// Webhookエンドポイント
app.post('/webhook', async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;

      // ユーザーのメッセージが予想一覧に含まれているか確認
const match = userMessage.match(/^(.+?)12R$/);
if (match) {
  const jyo = match[1]; // 例：住之江
  const prediction = getPrediction(jyo);

  const replyText = `【${prediction.title}】\n買い目：${prediction.formation}\n\n${prediction.comment}`;
  await replyMessage(event.replyToken, replyText);
} else {
  const replyText = `「〇〇12R」っていう形式で送ってね！例：住之江12R`;
  await replyMessage(event.replyToken, replyText);
}

      if (prediction) {
        const replyText = `【${prediction.title}】\n買い目：${prediction.formation}\n\n${prediction.comment}`;
        await replyMessage(event.replyToken, replyText);
      } else {
        const replyText = `「${userMessage}」にはまだ予想を用意していないよ！\n試せる例：住之江12R、江戸川12R、平和島12R`;
        await replyMessage(event.replyToken, replyText);
      }
    }
  }

  res.sendStatus(200);
});

// 返信用の関数（共通化）
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

// ポート設定
const PORT = process.env.PORT || 3000;
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
