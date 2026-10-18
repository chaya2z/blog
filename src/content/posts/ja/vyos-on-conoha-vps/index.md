---
title: 'ConoHa-VPSにVyOSをインストールする'
description: 'ConoHa VPS は ISO イメージを http でしか取得できないので、nginx で VyOS の ISO を公開し、conoha-iso でダウンロードしてインストールした。この手順なら任意の ISO イメージでサーバを作れる。'
publishedAt: '2021-12-04'
tags: ['Homelab', 'Network', 'VyOS']
---

この記事は [ITRC Advent Calendar 2021](https://adventar.org/calendars/6368) の4日目の記事です．

前日は [@saba](https://twitter.com/saba383810) の [【Unity】重い処理はメインスレッド以外の別スレッドで動かそう！！【非同期処理】](https://sabanogames.com/tips/305/) でした．

次は [@waka](https://twitter.com/gamoutatsumi) の [最近のVim事情](https://zenn.dev/gamoutatsumi/articles/26745357cffa44) です．

## 1. ConoHa の VPS を契約しサーバを建てる

OS は何でもいい[^1] のでサーバを契約します．

[^1]: Ubuntu 20.04 で確認済み．ウェブサーバが建てられればなんでもいい．

## 2. ウェブサーバを建てて ISO イメージを公開する

<https://qiita.com/marukei/items/6b6ccee3e7a553f64f1e>

この記事によると ConoHa の VPS では ISO イメージのダウンロードに http 接続しか使えないみたいです．

VyOS の ISO イメージは https で配布されているので，http 接続のためにウェブサーバを建てる必要があります．自分でビルドする場合も同じです．

### 2.1 nginxでウェブサーバを建てる

1. nginx のインストール

```bash
sudo apt update
sudo apt install nginx -y
```

2. ISO イメージファイルの公開

```bash
cd /var/www/html
sudo wget https://downloads.vyos.io/rolling/current/amd64/vyos-rolling-latest.iso
```

3. ISO イメージファイルにアクセスできるようにする

Nginx のデフォルト設定では，ブラウザから `/vyos*.iso` にアクセスしても ISO イメージファイルにアクセスできません．

`/etc/nginx/nginx.conf` を編集します．

`http` ディレクティブに `server` ディレクティブを追加します．

```
http {

    ...

    server {
        location / {
            try_files $uri $uri/ =404;
        }
    }
}
```

こうすると，ブラウザから `/vyos*.iso` にアクセスしたときにそのファイルがあるか探し，存在しなければ404を返すようになります．

## 3. ConoHaにISO イメージをダウンロードする

### 3.1 conoha-iso を使う

conoha-iso は，ISO イメージのダウンロードを簡単に行えるツールです．ツールのダウンロードは以下のページの手順を参考にします．

<https://support.conoha.jp/v/clitools/>

### 3.2 conoha-iso の確認

```
./conoha-iso list -u [APIユーザ名] \
                  -p [APIパスワード] \
                  -n [テナント名] \
                  -r [リージョン]
```

ISO イメージのダウンロードが初めてなら，ISO イメージは空なので `No ISO images` と返ってきます．

### 3.3 ISO イメージのダウンロード

(2) で建てたウェブサーバからISOイメージをダウンロードします．

```
./conoha-iso download -i http://{ConoHaのサーバのIP}/{vyosのISOイメージのファイル名} \
                      -u [APIユーザ名] \
                      -p [APIパスワード] \
                      -n [テナント名] \
                      -r [リージョン]
```

もう一度上記の `./conoha-iso list` コマンドを使い，ISO イメージが追加されたか確認します．

## 4. ( 1 ) で建てたサーバに ISO イメージを挿入する

`./conoha-iso insert` コマンドで ISO イメージを挿入します．これは，ISO を焼いた USB メモリをサーバに挿した状態と同じです．

## 5. VyOS をインストールする

VyOS のインストーラが立ち上がるのでインストールします．

```
install image
poweroff
```

## 6. ISO イメージを排出する

`./conoha-iso eject` コマンドで ISO イメージを排出します．

## まとめ

この手順でなら任意の ISO イメージを使ったサーバ作成が可能です。

ただ，ここまでするなら別の VPS 使ったほうがいいですね... 無料お試しサービスがあればそれを使いましょう．

## 参考

ConoHaのドキュメント．全体の流れはここを参照．\
<https://support.conoha.jp/v/clitools/>

ウェブサーバを建ててISOイメージをダウンロードするアイデアはここから．\
<https://himakan.net/program/conoha-vps-install-rancheros>

nginxの公式ドキュメント．locationの書き方はここを参照．\
<https://www.nginx.com/resources/wiki/start/topics/tutorials/config_pitfalls/>
