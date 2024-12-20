const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const client = require('../services/redisClient'); // Redisクライアントをインポート

// ユーザー情報取得エンドポイント
router.get('/', async (req, res) => {
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

// ユーザー登録エンドポイント
router.post('/', async (req, res) => {
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
    res.cookie('session_id', sessionId, { maxAge: 3600000, path: '/' });
  
    console.log(`User registered with name: ${name}, session_id: ${sessionId}`);
  
    // 登録成功
    res.status(200).json({ message: "Registration successful" });
});

// ログアウト処理
router.delete('/', async (req, res) => {
    try {
      // クッキーから session_id を取得
      const sessionId = req.cookies.session_id;
  
      if (sessionId) {
        await client.del(sessionId); // Redisからセッションデータを削除
        res.clearCookie('session_id', { path: '/' }); // session_idクッキーをクリア
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
      }
    } catch (error) {
      console.error('Error logging out:', error);
      res.sendStatus(500);
    }
});

module.exports = router;