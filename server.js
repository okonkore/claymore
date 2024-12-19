const express = require('express');
const QRCode = require('qrcode');
const redis = require('redis');

const app = express();
const port = 8080; // サーバーのポート番号

// Redisクライアントの設定
const client = redis.createClient({
    url: 'redis://localhost:6379', // Redisサーバーがローカルの場合
});

try {
    await client.connect();
    console.log('Connected to Redis');
} catch (err) {
    console.error('Redis connection error:', err);
}

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
    res.setHeader('Content-Type', 'text/html');
    res.send(`<img src="${qrCodeDataUrl}" alt="QR Code"><p>URL: ${queryUrl}</p>`);
  } catch (error) {
    console.error('QR Code generation error:', error);
    res.status(500).send('Error generating QR Code.');
  }
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
