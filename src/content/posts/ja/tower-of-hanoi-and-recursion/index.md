---
title: 'ハノイの塔と再帰について考えた'
publishedAt: '2020-04-28'
---

『入門 データ構造とアルゴリズム』[^1] の 2 章「再帰と後戻り」の課題を Python で書いてみました．ハノイの塔が例として出てくるのですが，私にはそれが初見だと難しかったので残します．

[ハノイの塔とは（Wikipedia）](https://ja.wikipedia.org/wiki/%E3%83%8F%E3%83%8E%E3%82%A4%E3%81%AE%E5%A1%94)

[^1]: 『入門データ構造とアルゴリズム』 ( Narasimha Karumanchi 著 黒川 利明・木下 哲也 訳 ) オライリージャパン

## 再帰の問題

### 問題 2-1 ハノイの塔を論ぜよ

Python でハノイの塔の最小移動回数の手順を求めるプログラムを書いてみます．コード自体は短いですが，理解するのが難しかったので順を追って説明します．

この記事では本に従って以下のように用語を使います．

![用語](./hanoi-terms.png)

「Source にある円盤を Destination に移動させよ．その際に Auxiliary を用いてよい．」という感じです．

### 最小移動回数を求める

ハノイの塔の解説を読むと，「 $n$ 番目の円盤を Source から Destination に移す．」「 $n-1$枚の円盤を，Auxiliary から Destination に移す．」という説明が出てきます．しかし，どういうきっかけでそれを思いつけばいいのかわからなかったので書きます．

最初に，漸化式を使って最小移動回数を求めます．

まず，円盤の枚数が $1$ 枚， $2$ 枚，$3$ 枚 $\dots$ $n-1$ 枚， $n$ 枚のときの最小移動回数からなる数列を，数列 $\lbrace a_n \rbrace$ とします．初項 $a_1$ は 1 枚の円盤を Destination に移すだけなので，$a_1 = 1$ となります．

以下の図のように $n$ 段円盤があるときには，その最小移動回数は　$a_n = n$ 回ということですね．

![n段の最小移動回数](./minimum-moves-formula.png)

まず，円盤が 1 枚のときは最小移動回数は $a_1 = 1$ 回です．

![1枚のとき](./move-one-disk.png)

次に $a_{n + 1}$ の時を考えます．$a_{n + 1}$ を Destination に移動させるには，最終的に以下の作業が必要になります．

- $n$ 段の円盤を Auxiliary に移動する．
- $n + 1$ 枚目 ( Source にある一番下の段 ) を Destination に移動する．
- Auxiliary に移動した n 段の円盤を $n + 1$ の上に載せるように Destination に移動する．
- $n + 1$ の山が完成する．

つまり，$a_{n + 1} = a_n + 1 + a_n = 2a_n + 1$ となります． これについて図で考えてみます．

まず， $n$ 段を Auxiliary へ移動する最小移動回数は $a_n$ です．

![n段をAuxiliaryへ](./move-n-disks-to-auxiliary.png)

次に， $n + 1$ 段を移動する最小移動回数は 1 です．

![n+1段目をDestinationへ](./move-largest-disk-to-destination.png)

最後に， $n$ 段を Destination へ移動する最小移動回数は $a_n$ です．

![n段をDestinationへ](./move-n-disks-to-destination.png)

これが $a_{n + 1} = a_n + 1 + a_n = 2a_n + 1$ の意味です．

$a_{n + 1} = 2a_n + 1$ を変形すると\
$a_{n + 1} - 1 = 2(a_n + 1)$

ここで， $a_n + 1 = b_n$ とおくと\
$b_{n + 1} = 2b_n，b_1 = a_1 + 1 = 1 + 1 = 2$

よって数列 $\lbrace b_n \rbrace$ は初項 $2$ ，公比 $2$ の等比数列であるから\
$b_n = 2 \bullet 2^{n-1} = 2^n$

したがって $a_n = b_n - 1 = 2^n - 1$

というわけで円盤 n 枚のときのハノイの塔の最小移動回数は $2^n - 1$ とわかりました．\
その過程で $n$ 枚目の円盤と $n-1$ 枚の円盤に分ける考え方が理解できたと思います．

### なぜ再帰関数か

なぜ再帰関数で求められるのかを考えます．再帰であるということは，繰り返されている処理と入れ子になっている処理があるはずなので，それを見つけます．

#### 繰り返されている部分

私は以下の図のイメージで繰り返されている部分に気づきました．再帰に気づくヒントになると思います．この図では $n = 4$ の場合までしか載っていませんが，それ以上の場合も変わりません．

![再帰のイメージ](./tower-of-hanoi.gif)

繰り返されているのは以下の処理です．

- $n - 1$ 段を真ん中に作る．
- $n - 1$ 段を Auxiliary に移動する．
- $n$ 段目を Destination に移動する．
- $n - 1$ 段を Auxiliary から Destination に移動する．

これは何段であっても同じです．

次に上の図では省略されている $n - 1$ 段を Destination から Auxiliary に移動する部分を考えてみます．

例えば， $n = 4$ のとき Destination に積まれた 3 段の円盤を Auxiliary にスライドしています．ここは $n = 3$ のときに Source から Destination に移動するのと使う場所が違うだけでやることは変わりません．ただ移動元と移動先が変わるだけです．

![やっていることは変わらない](./move-three-disks.png)

では，そもそも $n = 1$ 段を Source から Destination に移動するにはどうすればいいでしょうか．上の GIF 画像を見ながら考えてみてください．\
$n = 2$ で作れる円盤を利用して $n = 3$ を作っています．そして $n = 2$ を作るのに $n = 1$ を利用しています．\
$n$ 段を移動するのに $n - 1$ 段を利用し，$n - 1$ 段を作るのに $n - 2$ 段を利用し，$n - 2$ 段を作るのに $n - 3$ を $\cdots$ と入れ子になっているのです．

### 手順を求める

それでは，どのような手順で円盤を操作すれば最小移動回数でハノイの塔の目標を達成できるか，再帰関数を使ってコードを書いていきます．

まず， $1$ 段目（一番上）を移動します．1 段目を利用して $2$ 段の山を Destination に作ることができます．そして同じように 3 段目を作ることができ $\cdots\ n$ 段目が完成します．

```python
def towers_of_Hanoi(n, frompeg, topeg, auxpeg):
    # First, move disk 1.
    if n == 1:
        print("Move disk 1 from peg", frompeg, "to peg", topeg)
        return

    # move n - 1 pegs from source to auxiliary.
    towers_of_Hanoi(n - 1, frompeg, auxpeg, topeg)

    print("Move disk", n, "from peg", frompeg, "to peg", topeg)

    # move n - 1 pegs from auxiliary to destination
    towers_of_Hanoi(n - 1, auxpeg, topeg, frompeg)


towers_of_Hanoi(3, "A", "B", "C")

```

## 後戻りの問題

### 問題 2-2 n ビットのすべての列を生成せよ．A[0..n-1]をサイズが n の配列と仮定せよ．

例えば， $n = 2$ なら $00，01，10，11$ を出力するということです．やり方はいろいろありますがここでは本に載っているやり方と同じような考え方でやります．

コードを追うと 0 と 1 で分岐する図が想像できると思います．

```python
bit: int = int(input())

A = [0] * bit


def binary(n):
    if n < 1:
        print(A)
    else:
        A[n - 1] = 0
        binary(n - 1)
        A[n - 1] = 1
        binary(n - 1)


binary(bit)

```

### 問題 2-3 0..k-1 を要素とする長さ n の列をすべて生成せよ．

問題 2-2 では 2 進数の場合を考えましたが，今度は $k$ 進数の場合を考えます．こちらも本に載っているやり方と同じような考え方でやります．

```python
digit, nary = map(int, input().split())

A = [0] * digit


def k_string(n, k):
    if n < 1:
        print(A)
    else:
        for i in range(k):
            A[n - 1] = i
            k_string(n - 1, k)


k_string(digit, nary)

```

例えば，3 桁の $k$ 進数と言われれば 3 重に for 文でループを回せばすべての列を生成できます．しかし今回のような列の長さがわからない場合に再帰がうまく使えます．

## おわりに

ハノイの塔が難しかったです．階乗を再帰で計算するのとはやっていることが全然違うものに思えて理解するのに時間がかかりました．再帰は遅くて実際のコード中ではほとんど使われない（大抵が反復を使う）イメージがあるので，解きながら問題の難易度と実用性が見合わないのではないかと感じていました．本によると再帰の問題が後のページで出てくるようなので，今回の勉強が役に立つといいです．
