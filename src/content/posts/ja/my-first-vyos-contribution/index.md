---
title: 'VyOSにコントリビュートした'
publishedAt: '2021-12-06'
---

この記事は [ITRC Advent Calendar 2021](https://adventar.org/calendars/6368) の6日目の記事です．

前の記事は [@waka](https://twitter.com/gamoutatsumi) の [最近のVim事情](https://zenn.dev/gamoutatsumi/articles/26745357cffa44) です．

## はじめに

OSS に初めてコントリビュートしたので，その内容と考えたことを書きます．コントリビュートしたのは VyOS です．コントリビュートの内容は後述しますが，大したことはないのでその内容には期待しないでください．

## PR

私の出した PR はこちらになります．

<https://github.com/vyos/vyatta-cfg-system/pull/170>

`$` がエスケープされず変数としてみなされている部分があったのでそこをエスケープしました．

## どうやってバグを見つけたか

VyOS を使っていたらエラーが出たのでそれでバグに気づきました．

出力されたエラーは次のものです．

```
Global symbol "$generate" requires explicit package name (did you forget to declare "my $generate"?) at /opt/vyatta/sbin/vyatta-load-user-key.pl line 162.
Execution of /opt/vyatta/sbin/vyatta-load-user-key.pl aborted due to compilation errors.
[edit]
```

エラーに `/opt/vyatta/sbin/vyatta-load-user-key.pl` の 162 行目の `"$generate"` がおかしいというようなことが書かれているのでそのとおりコードを確認しました．

## OSS にコントリビュートするには

これを読んだ方は「これくらいの修正なら自分でもできそう」と思ったのではないでしょうか．以下はこのようなレベルのバグが他の OSS にもある前提で書きます．

まずはコントリビュートしたい OSS の最新版を使いましょう．このような比較的修正の簡単なバグはおそらく安定版にはありません．今回の PR も最新版に対して出したものです．最新版 ( いわば不安定版 ) のソフトを使うというのは OSS に貢献したいのなら当たり前かもしれませんが，実際には意識しないとやらないことだと思います．

あとは英語を拒絶しないことです ( これは意外に思う方もいるかもしれませんが，英語のページだとわかった瞬間ブラウザバック刷る人もいるようです )．私は英語が苦手なので DeepL や辞書を頼りました．

## さいごに

この記事が OSS のコントリビュートのきっかけになる方がいれば幸いです．
