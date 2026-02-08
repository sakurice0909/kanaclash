# kanaclash セットアップガイド

このゲームを無料でオンライン公開し、各プレイヤーが自分のスマホから参加できるようにするための手順です。

---

## 📋 必要なもの

- [ ] GitHubアカウント
- [ ] Vercelアカウント（GitHubでサインイン）
- [ ] Supabaseアカウント（GitHubでサインイン）

---

## Step 1: GitHubリポジトリ作成

### 1-1. GitHubにサインアップ（未登録の場合）
👉 https://github.com/signup

### 1-2. 新規リポジトリ作成
1. https://github.com/new にアクセス
2. **Repository name**: `kanaclash`
3. **Public** を選択
4. 「Create repository」クリック
5. 表示されるコマンドをコピー（後で使用）

### 1-3. コードをプッシュ
PowerShellで以下を実行:
```powershell
cd c:\Users\suzuk\Documents\ai\aiuebattle
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/sakurice0909/kanaclash.git
git push -u origin main
```
> ⚠️ `YOUR_USERNAME` を自分のGitHubユーザー名に置き換えてください

---

## Step 2: Supabaseプロジェクト作成

### 2-1. アカウント作成
1. 👉 https://supabase.com にアクセス
2. 「Start your project」クリック
3. 「Continue with GitHub」でサインイン

### 2-2. 新規プロジェクト作成
1. 「New project」クリック
2. 以下を入力:
   - **Name**: `kanaclash`
   - **Database Password**: 任意の強力なパスワード
   - **Region**: `Northeast Asia (Tokyo)` ⭐
3. 「Create new project」クリック
4. 2-3分待つ（プロビジョニング中）

### 2-3. API認証情報をコピー
1. 左メニュー → ⚙️「Project Settings」
2. 「API」タブを選択
3. 以下をメモ帳にコピー:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...`（長い文字列）

### 2-4. データベーステーブル作成
1. 左メニュー → 「SQL Editor」
2. 「New query」クリック
3. 以下のSQLを貼り付けて「Run」:

```sql
-- ルームテーブル
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  theme TEXT NOT NULL DEFAULT '',
  phase TEXT NOT NULL DEFAULT 'LOBBY',
  current_player_index INT DEFAULT 0,
  attack_count INT DEFAULT 0,
  host_id TEXT NOT NULL,
  attacked_kanas TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- プレイヤーテーブル
CREATE TABLE players (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_word TEXT[] DEFAULT '{}',
  revealed_indices BOOLEAN[] DEFAULT ARRAY[false,false,false,false,false,false,false],
  is_eliminated BOOLEAN DEFAULT false,
  is_winner BOOLEAN DEFAULT false,
  player_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- リアルタイム有効化
ALTER TABLE rooms REPLICA IDENTITY FULL;
ALTER TABLE players REPLICA IDENTITY FULL;

-- RLS有効化
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- アクセスポリシー（匿名ゲーム用）
CREATE POLICY "rooms_all" ON rooms FOR ALL USING (true);
CREATE POLICY "players_all" ON players FOR ALL USING (true);
```

4. ✅ 「Success」と表示されればOK

### 2-5. リアルタイム設定
1. 左メニュー → 「Database」→「Replication」
2. 「supabase_realtime」の横の「0 tables」をクリック
3. `rooms` と `players` にチェック ✅
4. 「Save」

---

## Step 3: Vercelデプロイ

### 3-1. アカウント作成
1. 👉 https://vercel.com にアクセス
2. 「Sign Up」→「Continue with GitHub」

### 3-2. プロジェクトをインポート
1. ダッシュボード → 「Add New...」→「Project」
2. GitHubリポジトリ `kanaclash` を選択
3. 「Import」クリック

### 3-3. 環境変数を設定
「Environment Variables」セクションで以下を追加:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxxxxx.supabase.co`（Step 2-3でコピーしたもの） |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...`（Step 2-3でコピーしたもの） |

### 3-4. デプロイ
1. 「Deploy」クリック
2. 1-2分待つ
3. ✅ デプロイ完了！

### 3-5. URLを確認
- `https://kanaclash.vercel.app` または
- `https://kanaclash-xxxx.vercel.app` のようなURLが発行されます

---

## ✅ セットアップ完了チェックリスト

- [ ] GitHubリポジトリにコードがプッシュされている
- [ ] Supabaseで `rooms` と `players` テーブルが作成済み
- [ ] Supabaseでリアルタイムが有効化されている
- [ ] Vercelに環境変数が設定されている
- [ ] Vercelでデプロイが成功している

---

## 🎮 次のステップ

セットアップ完了後、以下の情報を教えてください:

1. Supabase Project URL
2. Supabase anon key

これらを `.env` に設定し、マルチプレイヤー機能のコード実装を進めます！
