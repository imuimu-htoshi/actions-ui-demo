# actions-ui-demo
A minimal Next.js frontend to trigger GitHub Actions (workflow_dispatch) safely via Vercel.  Public UI repo – runs workflows in a private backend repository with a single button.

## 📂 Repository Structure

actions-ui-demo/
├─ README.md # 使い方・Env変数・デプロイ手順
├─ .gitignore # .env* / .vercel / .next など除外
├─ package.json # Next.js最小セット
├─ next.config.ts # 既定でOK（空気）
├─ tsconfig.json # TypeScript設定（最小）
├─ app/
│ ├─ globals.css # 簡単なベースCSS（任意）
│ ├─ page.tsx # 画面：Runボタン＋成功/失敗表示だけ
│ └─ api/
│ └─ dispatch/
│ └─ route.ts # サーバー側：GitHubにworkflow_dispatchを投げる
└─ public/ # （必要なら）faviconや画像

