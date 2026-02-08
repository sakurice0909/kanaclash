# マルチプレイヤー対応 + Vercelデプロイ タスク

## Phase 1: 静的サイトデプロイ
- [ ] `vercel.json` 作成（SPA設定）
- [ ] ビルド確認 (`npm run build`)
- [ ] ローカルプレビュー確認

## Phase 2: Supabase統合
- [ ] Supabaseクライアント (`src/lib/supabase.ts`)
- [ ] ルームフック (`src/hooks/useRoom.ts`)
- [ ] `gameStore.ts` にLOBBYフェーズ追加
- [ ] Supabaseリアルタイム同期

## Phase 3: UI変更
- [ ] `LobbyScreen.tsx` 新規作成
  - [ ] ルーム作成UI
  - [ ] ルーム参加UI  
  - [ ] QRコード生成
  - [ ] 参加者リスト
- [ ] `SetupScreen.tsx` 変更（ルーム作成/参加ボタン）
- [ ] `InputScreen.tsx` 変更（自分専用入力）
- [ ] `BattleScreen.tsx` 変更（ターン制御）
- [ ] `App.tsx` 変更（LOBBYフェーズ追加）

## Phase 4: 環境変数 + 設定
- [ ] `.env.example` 作成
- [ ] `vite.config.ts` 更新

## Phase 5: 検証
- [ ] ローカルビルド確認
- [ ] 2ブラウザでのマルチプレイテスト
- [ ] Vercelデプロイ
