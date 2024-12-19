# EC2 インスタンス設定と作業内容まとめ

## **EC2 インスタンス構成と OS 選択**

### **1. インスタンスタイプ**
- **選択したインスタンスタイプ**: `t4g.nano`
  - Arm ベースのインスタンスで低コスト。
  - 軽量なアプリケーションや学習目的に適している。

### **2. OS**
- **選択した OS**: Amazon Linux 2
  - AWS が提供する軽量で安定した Linux ディストリビューション。
  - Yum パッケージマネージャーを使用。

---

## **作業内容と手順**

### **1. 初期セットアップ**
- システムを最新状態に更新：
  ```bash
  sudo yum update -y
  ```

---

### **2. Git のインストール**
Git をインストールしてバージョン管理を有効化。
```bash
sudo yum install git -y
git --version
```

---

### **3. Node.js と npm のセットアップ（nvm 使用）**
nvm（Node Version Manager）を使用して Node.js をインストール。

#### **手順**
1. **nvm をインストール**:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash source ~/.bashrc
   ```

2. **Node.js をインストール**:
   ```bash
   nvm install --lts
   nvm use --lts
   ```

3. **インストール確認**:
   ```bash
   node -v
   npm -v
   ```

---

### **4. Redis のインストール**
Redis をソースからインストールして、インメモリデータベースを構築。

#### **手順**
1. 必要なパッケージをインストール：
   ```bash
   sudo yum groupinstall "Development Tools" -y
   sudo yum install gcc wget tcl -y
   ```

2. Redis ソースをダウンロードしてビルド：
   ```bash
   wget https://download.redis.io/releases/redis-7.0.12.tar.gz
   tar xzf redis-7.0.12.tar.gz
   cd redis-7.0.12
   make
   sudo make install
   ```

3. Redis をサービスとして登録：
   ```bash
   sudo nano /etc/systemd/system/redis.service
   ```

   **サービスファイル内容**：
   ```plaintext
   [Unit]
   Description=Redis In-Memory Data Store
   After=network.target

   [Service]
   ExecStart=/usr/local/bin/redis-server /etc/redis/redis.conf
   ExecStop=/usr/local/bin/redis-cli shutdown
   Restart=always
   User=root
   Group=root

   [Install]
   WantedBy=multi-user.target
   ```

4. サービス起動：
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start redis
   sudo systemctl enable redis
   ```

---

### **5. QR コード API の構築**
- **使用したモジュール**:
  - Express.js
  - QRCode
  - Redis

#### **セットアップ手順**
1. 必要なモジュールをインストール：
   ```bash
   npm install express qrcode redis
   ```

2. サーバーコード（`server.js`）を作成。

3. Redis 接続と QR コード生成 API を実装。

4. サーバーを起動してブラウザから確認。

---

## **動作確認**

### **1. QR コード API**
- URL: `http://<your-ec2-ip>:8080/qrcode?url=<target-url>`
- Redis に保存されたデータを `redis-cli` で確認。

### **2. Redis の動作確認**
- データ保存と取得：
  ```bash
  redis-cli
  set testkey "Hello"
  get testkey
  ```

---

## **改善・追加できる内容**
- HTTPS 対応（SSL 証明書の設定）。
- ログの管理やエラーハンドリングの改善。
- 永続的なデータ保存のための Redis バックアップ設定。

---

これが今日の作業の要約です！
