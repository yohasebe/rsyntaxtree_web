<div class='anchor' id='about'></div>

### 概要

**RSyntaxTree**はRubyプログラミング言語で書かれたグラフィカルな樹形図画像生成ツールです．

RSyntaxTreeの入力テキストの構文とマークアップに関するドキュメントは[英語](https://yohasebe.github.io/rsyntaxtree/documentation)と[日本語](https://yohasebe.github.io/rsyntaxtree/documentation_ja)で利用可能です．また，様々な種類のサンプル入力と結果の樹形図画像については[ギャラリー](https://yohasebe.github.io/rsyntaxtree/examples)をご覧ください．

RSyntaxTreeの[コマンドライン版](http://github.com/yohasebe/rsyntaxtree)はGitHubで利用可能です．[Docker](https://www.docker.com/products/docker-desktop/)を使用してローカルコンピュータ上でWeb版を実行することもできます．

RSyntaxTreeのオリジナルバージョンは，André Esenbachによる[phpSyntaxTree](http://ironcreek.net/phpsyntaxtree/)をもとに開発されました．

### 最新の情報

* Web UIの操作性向上; 日本語版UIを追加 [2025年2月]
* 角括弧を`\[`と`\]`でエスケープ可能に [2024年10月]
* クロスハッチのレンダリングの問題を修正 [2023年9月]
* PDFダウンロード機能を追加 [2023年2月]
* ライン端のレンダリングを改善 [2023年2月]
* `線の太さ`オプションを追加 [2023年2月]
* `Traditional`カラーオプションを追加 [2023年2月]
* `デフォルトコネクタを非表示`オプションを追加 [2023年2月]
* 追加コネクタ描画機能を追加 [2023年2月]
* `Noto Sans Mono`フォントオプションを追加 [2023年1月]

### 過去の更新履歴

* バックスラッシュ`\`の代わりに`¥`記号を使用して特定の文字をエスケープ可能に [2022年11月]
* [日本語](https://yohasebe.github.io/rsyntaxtree/documentation_ja)のドキュメントを追加 [2022年11月]
* RSyntaxTree on the Web（dockerを使用してローカルで実行可能なUIソースコードパッケージ）[2022年6月]
* `折れ線コネクタ`オプション [2022年2月]
* ユーザーインターフェースの改善（エラーメッセージ表示，画像ズームなど）[2022年1月]
* コードの包括的な書き直し [2022年1月]
* パス描画機能（無方向，有方向，双方向）[2022年1月]
* テキストマークアップの柔軟性向上 [2022年1月]
* 新しいテキストマークアップパターン（改行，括弧，水平線，ボックステキスト）[2022年1月]
* 三角形をすべてのコネクタモード（`auto`，`bar`，`none`）で指定可能に [2022年1月]
* 上付き文字（例：T<sup>0</sup>）の指定が可能に [2021年12月]
* 終端ノード内で改行文字`\n`が使用可能に [2021年12月]
* ラベルなしの終端ノードが可能に（例：`[A [B] [C]]`）[2021年11月]
* `自動括弧閉じ`オプション [2021年11月]
* 数学記号のレンダリング [2021年11月]
* 画質の向上 [2021年11月]
* 一部の装飾記号を変更 [2021年11月]
* システム修正（SVGダウンロードエラー）[2019年11月]
* バグ修正（SVGカラーのオン/オフ）[2019年4月]
* `<>`表記でノードラベルに空白を含めることが可能に（例：`Modal<>AUX`）[2018年6月]
* 画像に様々なサイズの`マージン`を設定可能に [2018年2月]
* <a href='https://ace.c9.io/'>Ace</a>を使用したより良いテキストエディタ [2018年2月]
* `コネクタの高さ`オプション [2018年3月]
* 入力テキストの構文ハイライト [2018年3月]
* サイトデザインとドキュメントの改良 [2018年3月]
* テキストスタイル（イタリックと太字）と装飾（下線，上線，取り消し線）[2018年3月]

### 開発者

長谷部陽一郎 (Yoichiro HASEBE) &nbsp;&nbsp;
<a href='mailto:yohasebe@gmail.com'><i class="fa fa-envelope" aria-hidden="true"></a></i>&nbsp;&nbsp;
<a href='https://twitter.com/yohasebe'><i class="fab fa-twitter" aria-hidden="true"></a></i>&nbsp;&nbsp;
<a href='https://github.com/yohasebe'><i class="fab fa-github" aria-hidden="true"></a></i>

### ライセンス

[The MIT License](http://www.opensource.org/licenses/mit-license.php)
