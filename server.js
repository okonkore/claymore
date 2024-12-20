const express = require('express');
const QRCode = require('qrcode');
const redis = require('redis');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { cookie } = require('express/lib/response');

const app = express();
const port = 8080; // サーバーのポート番号

app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.json());

// Redisクライアントの設定
const client = redis.createClient({
    url: 'redis://localhost:6379', // Redisサーバーがローカルの場合
});

(async () => {
    try {
      await client.connect(); // Redisに接続
      console.log('Connected to Redis');
    } catch (err) {
      console.error('Redis connection error:', err);
    }
})();

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

// ユーザー登録エンドポイント
app.post('/user', async (req, res) => {
  const { name } = req.body;

  if (!name) {
      return res.status(400).json({ message: "Name is required" });
  }

  // 新しい session_id を生成
  const sessionId = uuidv4();

  // ユーザー情報を Redis に保存（有効期限: 1時間）
  await client.set(sessionId, JSON.stringify({ name }), {
    EX: 3600, // 1時間
  });

  // session_id をクッキーに設定（有効期限: 1時間）
  res.cookie('session_id', sessionId, { httpOnly: true, maxAge: 3600000 });

  console.log(`User registered with name: ${name}, session_id: ${sessionId}`);

  // 登録成功
  res.status(200).json({ message: "Registration successful" });
});

// ユーザー情報取得エンドポイント
app.get('/user', async (req, res) => {
    const sessionId = req.cookies.session_id;

    if (!sessionId) {
        return res.status(401).json({ message: "Session not found" });
    }

    try {
        // Redis からユーザー情報を取得
        const userData = await client.get(sessionId);

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        // ユーザー情報をレスポンス
        res.status(200).json(JSON.parse(userData));
    } catch (error) {
        console.error("Error retrieving user data from Redis:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
