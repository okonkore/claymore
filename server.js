const express = require('express');
const QRCode = require('qrcode');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { cookie } = require('express/lib/response');
const client = require('./services/redisClient'); // Redisクライアントをインポート

const app = express();
const port = 8080; // サーバーのポート番号

app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.json());

const userRoutes = require('./routes/user');
app.use('/user', userRoutes);

// QRコード生成用のエンドポイント
app.get('/qrcode', async (req, res) => {
  try {
    // クエリパラメーターからURLを取得
    const queryUrl = req.query.url;

    // URLが指定されていない場合はエラーを返す
    if (!queryUrl) {
      return res.status(400).send('Error: Missing "url" query parameter.');
    }

    // URLをRedisに保存（key: "url"）
    await client.set('url', queryUrl);
    console.log(`Saved URL to Redis: ${queryUrl}`);

    // QRコードを生成
    const qrCodeDataUrl = await QRCode.toDataURL(queryUrl);

    // QRコードをブラウザに表示
    const filePath = path.join(__dirname, 'qrcode.html');
    res.sendFile(filePath, {
      headers: {
        'Content-Type': 'text/html'
      },
      query: {
        qrCodeDataUrl,
        url: queryUrl
      }
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    res.status(500).send('Error generating QR Code.');
  }
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
