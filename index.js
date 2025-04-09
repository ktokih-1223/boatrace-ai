const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// 環境変数からアクセストークン取得（Renderの環境変数設定済み）
const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

app.post('/webhook', async (req, res) => {
  const events = req.body.events;

  // LINEからのイベントをすべて処理
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;

      // 自動返信メッセージ
      const replyMessage = `「${userMessage}」って送ってくれてありがとう！`;

      // LINEに返信を送信
      await axios.post('https://api.line.me/v2/bot/message/reply', {
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: replyMessage }],
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        }
      });
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
