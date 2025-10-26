# このシステムに関する説明
- Node.js + TypeScriptで構成された、コマンドライン上で実行できる社員検索ツール

## SetUp
  1. (※Dockerを使用しているため、そちらの設定は済んでいるものとする)
  2. `docker compose build`を実行
  3. `docker compose up -d`を実行
  4. (ホストマシンで)`npm install`を実行して依存関係をインストール
  5. (ホストマシンで)`npm run migrate`を実行し、MySQLにテーブルを作成する
  6. `npm start`を実行するか、`docker compose exec node sh`でコンテナ内に入り`npx tsx index.ts`を実行
  7. 社員検索の案内が表示されるので、そこで検索を実行する
