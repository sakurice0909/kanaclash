# マルチプレイヤー対応 + 無料サーバーデプロイ

「あいうえバトル」を各プレイヤーが自分のスマホから参加できるオンラインマルチプレイヤーゲームとして無料ホスティングにデプロイする。

## User Review Required

> [!IMPORTANT]
> **Supabaseアカウント作成が必要です**
> - [supabase.com](https://supabase.com) で無料アカウント作成
> - プロジェクト作成後、API URLとanon keyを取得
> - 環境変数 `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定

> [!WARNING]
> **ゲームフロー変更**
> - 現在: 1台のスマホでパスプレイ
> - 変更後: ホストがルーム作成 → 他プレイヤーがURL/QRで参加 → 各自のスマホで操作

---

## Proposed Changes

### Phase 1: 静的サイトデプロイ（オンライン同期なし）

まず現在のゲームをそのままVercelにデプロイし、ベースラインを確立。

#### [NEW] [vercel.json](file:///c:/Users/suzuk/Documents/ai/aiuebattle/vercel.json)
SPAルーティング設定

---

### Phase 2: Supabase統合 + リアルタイム同期

#### [NEW] [src/lib/supabase.ts](file:///c:/Users/suzuk/Documents/ai/aiuebattle/src/lib/supabase.ts)
Supabaseクライアント初期化

#### [NEW] [src/hooks/useRoom.ts](file:///c:/Users/suzuk/Documents/ai/aiuebattle/src/hooks/useRoom.ts)
ルーム作成・参加・リアルタイム購読フック

#### [MODIFY] [gameStore.ts](file:///c:/Users/suzuk/Documents/ai/aiuebattle/src/store/gameStore.ts)
- 新しいフェーズ `LOBBY` を追加（ルーム待機画面）
- アクションをSupabaseに同期するように変更
- 自分のプレイヤーIDをローカルに保持

---

### Phase 3: UI変更

#### [NEW] [src/components/LobbyScreen.tsx](file:///c:/Users/suzuk/Documents/ai/aiuebattle/src/components/LobbyScreen.tsx)
- ルーム作成/参加UI
- 参加者一覧表示
- QRコード生成（ルームURL）
- ホストのみ「ゲーム開始」ボタン

#### [MODIFY] [SetupScreen.tsx](file:///c:/Users/suzuk/Documents/ai/aiuebattle/src/components/SetupScreen.tsx)
- 「ルームを作成」「ルームに参加」ボタンに変更
- お題設定はLobbyScreenに移動

#### [MODIFY] [InputScreen.tsx](file:///c:/Users/suzuk/Documents/ai/aiuebattle/src/components/InputScreen.tsx)
- パスプレイUI削除（各自が自分のスマホで入力）
- 自分の単語入力のみ表示
- 他プレイヤーの入力完了状態を表示

#### [MODIFY] [BattleScreen.tsx](file:///c:/Users/suzuk/Documents/ai/aiuebattle/src/components/BattleScreen.tsx)
- 自分のターン時のみ攻撃ボタン有効化
- 他プレイヤーのターンは観戦モード
- リアルタイム状態更新

#### [MODIFY] [App.tsx](file:///c:/Users/suzuk/Documents/ai/aiuebattle/src/App.tsx)
- `LOBBY` フェーズ追加
- URLパラメータからルームID取得

---

### Phase 4: 環境変数 + 本番用設定

#### [NEW] [.env.example](file:///c:/Users/suzuk/Documents/ai/aiuebattle/.env.example)
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### [MODIFY] [vite.config.ts](file:///c:/Users/suzuk/Documents/ai/aiuebattle/vite.config.ts)
環境変数読み込みとベースURL設定

---

## DB Schema (Supabase)

```sql
-- ルームテーブル
CREATE TABLE rooms (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  theme TEXT NOT NULL,
  phase TEXT NOT NULL DEFAULT 'LOBBY',
  current_player_index INT DEFAULT 0,
  attack_count INT DEFAULT 0,
  host_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- プレイヤーテーブル
CREATE TABLE players (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  word TEXT, -- 暗号化または非公開
  revealed_indices BOOLEAN[] DEFAULT ARRAY[false,false,false,false,false,false,false],
  is_eliminated BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT NOW()
);

-- RLSポリシー（セキュリティ）
-- プレイヤーは自分の単語のみ読み書き可能
```

---

## Verification Plan

### Phase 1 検証（静的デプロイ）
```bash
# ローカルでビルド確認
npm run build
npm run preview
```
- ブラウザで http://localhost:4173 にアクセス
- 既存のパスプレイ機能が動作することを確認

### Phase 2-4 検証（マルチプレイヤー）

#### 手動テスト手順
1. **ルーム作成テスト**
   - ブラウザAで「ルームを作成」
   - ルームURLとQRコードが表示されることを確認

2. **ルーム参加テスト**
   - ブラウザBでルームURLにアクセス
   - 名前入力後、ロビーに参加できることを確認
   - ブラウザAに参加者リストが更新されることを確認

3. **単語入力テスト**
   - ホストが「ゲーム開始」
   - 各ブラウザで自分の単語を入力
   - 全員入力完了後、バトル画面に遷移

4. **バトル同期テスト**
   - 自分のターンで攻撃ボタンが有効
   - 他プレイヤーのターンでは無効
   - 攻撃結果が全員に反映

> [!NOTE]
> **ユーザーへのお願い**
> Supabaseでのテーブル作成とRLS設定は手動操作が必要です。SQLスクリプトを提供しますので、Supabase SQLエディタで実行してください。
