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

      const match = userMessage.match(/^(.+?)\s?(\d{1,2}R)$/); // 例：住之江12R
      if (match) {
        const jyo = match[1];
        const race = match[2];
        const time = generateRaceTime();
        const prediction = generatePredictionWithSetup(); // 展開付き予想生成

        const replyText =
`【${jyo}${race} ${time}】
本線: ${prediction.honsen}
狙い目: ${prediction.neraime}
抑え: ${prediction.osae}
穴: ${prediction.ana}
コメント: ${prediction.comment}`;

        await replyMessage(event.replyToken, replyText);
      } else {
        await replyMessage(event.replyToken, '「〇〇12R」って形式で送ってね！ 例：住之江12R');
      }
    }
  }

  res.sendStatus(200);
});

// 展開を考慮した予想生成（簡易ロジック）
function generatePredictionWithSetup() {
  const patterns = [
    {
      type: 'イン逃げ型',
      honsen: '1-23-234',
      neraime: '1-4-23',
      osae: '1-5-234',
      ana: '4-1-流',
      comment: '展示タイム上位の1号艇、逃げ信頼。センター勢の仕掛けには注意。'
    },
    {
      type: 'カドまくり型',
      honsen: '4-15-全',
      neraime: '4-1-56',
      osae: '1-4-全',
      ana: '5-4-流',
      comment: '4号艇のカド一撃に期待。1号艇が残せるかが焦点。'
    },
    {
      type: 'センターまくり型',
      honsen: '3-1-45',
      neraime: '3-5-14',
      osae: '1-3-45',
      ana: '5-3-流',
      comment: 'スローが遅く、3号艇の仕掛けが決まれば波乱も。'
    },
    {
      type: '波乱型（イン不安）',
      honsen: '2-3-45',
      neraime: '3-2-45',
      osae: '1-2-34',
      ana: '6-2-流',
      comment: '1号艇のモーター弱く、差し・まくり差し決まる可能性。'
    }
  ];

  return patterns[Math.floor(Math.random() * patterns.length)];
}

// 時間生成（仮）
function generateRaceTime() {
  const hour = 14 + Math.floor(Math.random() * 3);
  const minute = Math.floor(Math.random() * 60).toString().padStart(2, '0');
  return `${hour}:${minute}`;
}

// LINE返信処理
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
