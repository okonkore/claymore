const express = require('express');
const QRCode = require('qrcode');

const app = express();
const port = 8080; // サーバーのポート番号

// QRコード生成用のエンドポイント
app.get('/qrcode', async (req, res) => {
  try {
    // クエリパラメーターからURLを取得
    const queryUrl = req.query.url;

    // URLが指定されていない場合はエラーを返す
    if (!queryUrl) {
      return res.status(400).send('Error: Missing "url" query parameter.');
    }

    // 自身のホスト名を取得して完全なURLを生成
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    console.log(`Requested QR Code for URL: ${queryUrl}`);
    console.log(`Full server URL: ${fullUrl}`);

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
