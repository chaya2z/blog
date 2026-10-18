---
title: 'eBPFでシステムコールを監視してみた'
description: 'eBPF Summit 2020 の入門セッションで公開されたコードを Ubuntu 20.04 で動かし、clone システムコールの発行回数をユーザー ID ごとに数えた。'
publishedAt: '2020-12-03'
tags: ['Linux']
---

この記事は[ITRC Advent Calendar 2020](https://adventar.org/calendars/5535) の 3 日目の記事です．

前の記事は[@site0801](https://twitter.com/site0801) の [nested 対応してるクラウド事業者リスト](https://www.notion.so/nested-73404cdaa2864d95895969c25b5eaf3e) です．

次の記事は[@bluekey0725](https://twitter.com/bluekey0725) の [TUN モジュールによる Docker のロードエラーと linux カーネル](https://qiita.com/blue_key/items/82facd82e9383c711534) です．

## はじめに

この記事は 2020/10/28 - 29 に開催された、eBPF summit の Day 1 の「A Beginner’s Guide to eBPF Programming」の内容を受けて書いています．

eBPF summit の内容は公開されています．

- <https://ebpf.io/summit-2020/>

実際に自分の環境で公開されているコードを実行してみました．

## 環境

- OS: Gnu/Linux Ubuntu20.04
- Python: 3.8

ソースコードはプレゼンを行った lizrice 氏の GitHub にて公開されています．それを使わせていただきました．\
<https://github.com/lizrice/ebpf-beginners>

## やること

clone システムコールの監視を行います．

ターミナルを２つ開き，１つのターミナルで監視するプログラムを実行，もう１つのターミナルで`ls`コマンドを実行し、clone システムコールを発行します．

## 結果

ID 0 が追加されたところが，root ユーザで`ls`コマンドを実行したところです．

```
$ sudo python3 ebpf.py
No entries yet
No entries yet
ID 1000: 1
ID 1000: 1
ID 1000: 1
ID 1000: 1
ID 1000: 2
ID 1000: 2	ID 0: 1
ID 1000: 2	ID 0: 1
ID 1000: 2	ID 0: 1
ID 1000: 2	ID 0: 1
ID 1000: 3	ID 0: 1
ID 1000: 6	ID 0: 1
ID 1000: 7	ID 0: 1
```
