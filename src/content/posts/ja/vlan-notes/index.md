---
title: 'VLANの設定で学んだこと'
description: 'Native VLAN を、機器で最初から設定されている VLAN 1 のことだと勘違いしていた。Access Port、Trunk Port、Native VLAN がそれぞれどんなフレームを流すのかを整理した。'
publishedAt: '2021-12-23'
tags: ['Network']
---

## はじめに

最近 VLAN の設定を行う機会があったのですが，そこで VLAN について理解不足な部分があることがわかったのでまとめます．

## Access Port

まずは Access Port について．

### Access Port とは

Access Port とは，１つの VLAN にしか所属できないポートのこと．VLAN タグの付かないフレームが流れる．PC は基本的に１つの VLAN にのみ所属するので，PC を繋ぐのに使われることが多い．

## Trunk Port

次に Trunk Port について．

### Trunk port とは

Trunk Port とは，複数の VLAN が所属できるポートのこと．VLAN タグの付くフレームが流れる．この仕様は IEEE802.1Q で定義され，これを実装した機器同士で通信するのに用いられることが多い ( 例外として以下に説明する Native VLAN がある )．

## Native VLAN

最後に Native VLAN について．

### Native VLAN とは

Native VLAN は Trunk Port に設定する VLAN で，Trunk Port にてタグのないフレームを流すことができる仕様のこと．Trunk Port でないポートを接続して利用できる．Native VLAN 同士を接続することもできる．

## おわりに

Native VLAN のことを，そのネットワーク機器でデフォルトで設定される VLAN 番号のことだと勘違いしていました．多くのネットワーク機器では VLAN 1 がデフォルトで設定されていると思うのですが，その VLAN 1 というのは他の VLAN 番号と違い，特別なものだと思ってました．

Native VLAN を全然使っていませんでしたが，便利だと思ったので使っていきたいです．
