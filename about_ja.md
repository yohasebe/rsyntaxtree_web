<div class='anchor' id='about'></div>

### 概要

**RSyntaxTree**はRubyプログラミング言語で書かれたグラフィカルな樹形図画像生成ツールです．

RSyntaxTreeの入力テキストの構文とマークアップに関するドキュメントは[英語](https://yohasebe.github.io/rsyntaxtree/documentation)と[日本語](https://yohasebe.github.io/rsyntaxtree/documentation_ja)で利用可能です．また，様々な種類のサンプル入力と結果の樹形図画像については[ギャラリー](https://yohasebe.github.io/rsyntaxtree/examples)をご覧ください．

RSyntaxTreeの[コマンドライン版](http://github.com/yohasebe/rsyntaxtree)はGitHubで利用可能です．[Docker](https://www.docker.com/products/docker-desktop/)を使用してローカルコンピュータ上でWeb版を実行することもできます．

RSyntaxTreeのオリジナルバージョンは，André Esenbachによる[phpSyntaxTree](http://ironcreek.net/phpsyntaxtree/)をもとに開発されました．

### 最新の情報

**2.2.0** 時点（2026 年 9 月）．各リリースの日付と詳細は
[changelog](https://yohasebe.github.io/rsyntaxtree/changelog) にあります．

* 誤りの一括表示：最初の 1 件だけでなく，すべての誤りを直し方とともに表示
* 入力中の検査：誤りをエディタの余白に表示
* JSON 出力の形式名を `lsif` から `json` に変更（`lsif` は 3.0 まで使用可）
* 素性行列を JSON で行とセルとして出力
* シアー：図全体を傾け，`シアー平面` で背後の面を描画
* `ラベル間隔`：すべてのラベルの上下に同じ空きを確保
* JPG・GIF 出力を廃止（PNG をお使いください）
* `symmetrize`・`tidy_spacing`・`tidy_nest` を廃止（`Tidy レイアウト` と `横間隔` で代替）
* 導出図：各ノードと娘を 1 本の罫で結び，`方向: btt` で語を上に配置
* 素性構造（AVM）：`\t` で列を揃え，`#(` … `#)` で行列を入れ子に
* 記法の 1 ページリファレンス：[notation.txt](https://yohasebe.github.io/rsyntaxtree/notation.txt)（`rsyntaxtree --notation` でも出力）
* 領域シェード：`%` でノードが支配する部分木全体に面を敷けます．`%@blue:` で色つき
* 左右反転オプション：アラビア語・ヘブライ語のための右から左のツリー
* Tidy レイアウト：symmetric から high までの一つの尺度で木を詰められます
* `@color:` によるノードごとの色，`方向` による左から右のレイアウト，IPA 仮想キーボード

### 引用方法

研究や教材で RSyntaxTree をご利用の際は，ぜひ引用してください．以下の BibTeX エントリが利用できます（`version` はページ上部に表示されているものに合わせてください）．

```
@software{hasebe_rsyntaxtree,
  author  = {Hasebe, Yoichiro},
  title   = {RSyntaxTree: A graphical syntax tree image generator},
  url     = {https://yohasebe.com/rsyntaxtree},
  doi     = {10.5281/zenodo.21916150},
  version = {1.9.0},
  year    = {2026}
}
```

### 関連ブログ記事

[yohasebe.com の RSyntaxTree タグ](https://yohasebe.com/tags/rsyntaxtree/)

### 開発者

長谷部陽一郎 (Yoichiro HASEBE) &nbsp;&nbsp;
<a href='mailto:yohasebe@gmail.com'><i class="fa fa-envelope" aria-hidden="true"></a></i>&nbsp;&nbsp;
<a href='https://twitter.com/yohasebe'><i class="fab fa-twitter" aria-hidden="true"></a></i>&nbsp;&nbsp;
<a href='https://github.com/yohasebe'><i class="fab fa-github" aria-hidden="true"></a></i>

### ライセンス

[The MIT License](http://www.opensource.org/licenses/mit-license.php)
