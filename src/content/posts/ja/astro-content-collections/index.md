---
title: Astro の Content Collections で記事を管理する
publishedAt: 2026-10-10
---

Content Collections を使うと、記事の frontmatter をスキーマで検証できます。

![オフホワイト一色の長方形](./figure.png)

## 仕組み

- `src/content.config.ts` でコレクションとスキーマを定義する
- `glob()` ローダーが `src/content/posts/<lang>/<slug>/index.md` を読み込む
- 必須項目が欠けているとビルドが失敗する
