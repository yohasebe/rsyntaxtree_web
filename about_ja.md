<div class='anchor' id='about'></div>

### 概要

**RSyntaxTree**はRubyプログラミング言語で書かれたグラフィカルな樹形図画像生成ツールです．

RSyntaxTreeの入力テキストの構文とマークアップに関するドキュメントは[英語](https://yohasebe.github.io/rsyntaxtree/documentation)と[日本語](https://yohasebe.github.io/rsyntaxtree/documentation_ja)で利用可能です．また，様々な種類のサンプル入力と結果の樹形図画像については[ギャラリー](https://yohasebe.github.io/rsyntaxtree/examples)をご覧ください．

RSyntaxTreeの[コマンドライン版](http://github.com/yohasebe/rsyntaxtree)はGitHubで利用可能です．[Docker](https://www.docker.com/products/docker-desktop/)を使用してローカルコンピュータ上でWeb版を実行することもできます．

RSyntaxTreeのオリジナルバージョンは，André Esenbachによる[phpSyntaxTree](http://ironcreek.net/phpsyntaxtree/)をもとに開発されました．

### 最新の情報

**2.0.0** 時点（2026 年 8 月）．各リリースの日付と詳細は
[changelog](https://yohasebe.github.io/rsyntaxtree/changelog) にあります．

* シアー：`シアー` で仕上がった図を指定した角度だけ傾け，`シアー平面` がその図が
  載る平面を描きます．傾きが「描き損じ」ではなく「斜めから見た面」として読めます．
  図は一枚の板として傾くので，中の領域シェードはひとりでに平行四辺形になります
* `ラベル間隔`：ラベルとコネクタの間の空きを上下同量で指定します．すべての図で
  この空きが揃いました．従来はラベルを囲む見えない箱から測っており，その箱の縁が
  活字に対して上下で不揃いだったためです
* JPG・GIF 出力を廃止しました．これに伴い ImageMagick への依存も無くなり，
  gem の導入時に要求されなくなりました．PNG をお使いください
* `symmetrize`・`tidy_spacing`・`tidy_nest` の各オプションも廃止しました．
  `Tidy レイアウト` と `横間隔` が同じことを表します．古い名前を指定した場合は
  黙って無視するのではなく，その旨を告げます
* 導出図：`導出` をオンにすると各ノードと娘が 1 本の罫で結ばれ，`方向: btt` で
  語が先頭に来ます．圏論的文法の書式で，規則名も書けます
* 素性構造（AVM）：`	` でラベルの列を揃え，`#(` … `#)` で行列を入れ子にできます．
  HPSG・SBCG・LFG の素性構造のための機能です
* 記法の 1 ページリファレンス — 特別な意味を持つ文字と全機能の一覧 — を
  [notation.txt](https://yohasebe.github.io/rsyntaxtree/notation.txt) に置きました．
  `rsyntaxtree --notation` の出力と同じもので，AI モデルに渡す資料として作られています
* 入力中に，誤りのある行へ印が付きます．原因と直し方が一行で表示されます
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
