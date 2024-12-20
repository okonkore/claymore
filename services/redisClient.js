const redis = require('redis');

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

module.exports = client;