const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

const examplePredictions = [
  {
    title: "住之江12R 予想",
    formation: "3-1-5 / 1-3-5 / 3-5-1",
    comment: "3号艇のスタートが鋭く、まくり一発に期待！"
  },
  {
    title: "江戸川12R 予想",
    formation: "1-2-4 / 2-1-4 / 1-4-2",
    comment: "イン逃げ濃厚！差し切る展開も想定して手広く！"
  },
  {
    title: "平和島12R 予想",
    formation: "4-1-6 / 4-6-1 / 1-4-6",
    comment: "4号艇のカドまくりが決まれば波乱の展開！"
  }
];

app.post('/webhook', async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;

      // 「〇〇場12R」のようなメッセージか確認
      const match = userMessage.match(/^(.+?)\d{1,2}R$/);
      if (match) {
        const prediction = examplePredictions[Math.floor(Math.random() * examplePredictions.length)];

        const replyText = `【${prediction.title}】\n買い目：${prediction.formation}\n\n${prediction.comment}`;

        await axios.post(
          'https://api.line.me/v2/bot/message/reply',
          {
            replyToken: event.replyToken,
            messages: [{ type: 'text', text: replyText }],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
            }
          }
        );
      } else {
        // それ以外は「フォーマットを教える返信」
        await axios.post(
          'https://api.line.me/v2/bot/message/reply',
          {
            replyToken: event.replyToken,
            messages: [
              {
                type: 'text',
                text: `「〇〇場12R」などの形式で送ってね！例：住之江12R`,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
            }
          }
        );
      }
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
