<div class='anchor' id='about'></div>

### About

**RSyntaxTree** is a graphical syntax tree generator written in the Ruby programming language created by <a href="mailto:yohasebe@gmail.com">Yoichiro Hasebe</a>.

Documentation of the input text syntax and markups of RSyntaxTree is avalable in [English](https://yohasebe.github.io/rsyntaxtree/documentation) and [Japanese](https://yohasebe.github.io/rsyntaxtree/documentation_ja). See also [Example Gallery](https://yohasebe.github.io/rsyntaxtree/examples) for different types of sample input and result syntree images.

A [command-line version](http://github.com/yohasebe/rsyntaxtree) of RSyntaxTree is available on GitHub. A web user interface for RSyntaxTree is also available; you can run RSyntaxTree with a web UI locally on your computer using [Docker](https://www.docker.com/products/docker-desktop/).

The original version of RSyntaxTree was inspired by [phpSyntaxTree](http://ironcreek.net/phpsyntaxtree/) by André Esenbach.

### What's new

* Print square brackets with `\[` and `\]` [April 2024]
* Cross-hatch rendering issue fixed [September 2023]
* PDF download feature added [February 2023]
* Line edge rendering improved [February 2023]
* `Line width` option added [February 2023]
* `Traditional` color option added [February 2023]
* `Hide default connectors` option added [February 2023]
* Extra connector drawing feature added [February 2023]
* `Noto Sans Mono` font option added [January 2023]

### Past updates

* The `¥` symbol can be used in place of the backslash `\` to escape certain characters [November 2022]
* Documantation in [日本語 (Japanese)](https://yohasebe.github.io/rsyntaxtree/documentation_ja) has been added [November 2022]
* RSyntaxTree on the Web (UI sourcecode package you can run locally using docker) [June 2022]
* Polyline connector option [February 2022]
* Improved user interface (error message display; image zoom, etc.) [January 2022]
* Comprehensive code rewrite [January 2022]
* Path drawing functionality (non-directional, directional, bidirectional) [January 2022]
* Text markup is more flexibly applicable than before [January 2022]
* New text markup patterns (newlines, brackets, horizontal lines, boxed texts) [January 2022]
* Triangle can be specified in all connector modes (`auto`, `bar`, `none`) [January 2022]
* Superscript (e.g. T<sup>0</sup>) specification is possible [December 2021]
* Newline characters `\n` can be used inside terminal nodes [December 2021]
* Label-less terminal nodes are now allowed (e.g. `[A [B] [C]]`) [November 2021]
* Auto bracket close option [November 2021]
* Math symbol rendering [November 2021]
* Better image quality [November 2021]
* Some decoration symbols have been altered [November 2021]
* System fix (SVG download error) [November 2019]
* Bug fix (SVG color on/off) [April 2019]
* White spaces can be included in node labels with the `<>` notation (e.g. `Modal<>AUX`) [June 2018]
* Various sizes of `margin` to the image [February 2018]
* Better text editor using <a href='https://ace.c9.io/'>Ace</a> [February 2018]
* <em>Connector height</em> option [March 2018]
* Syntax highlighting of input text [March 2018]
* Refined site design and documentation [March 2018]
* Text styles (italic and bold) and decoration (underline, overline, line-through) [March 2018]

### Author

Yoichiro HASEBE &nbsp;&nbsp;
<a href='mailto:yohasebe@gmail.com'><i class="fa fa-envelope" aria-hidden="true"></a></i>&nbsp;&nbsp;
<a href='https://twitter.com/yohasebe'><i class="fab fa-twitter" aria-hidden="true"></a></i>&nbsp;&nbsp;
<a href='https://github.com/yohasebe'><i class="fab fa-github" aria-hidden="true"></a></i>

### License

[The MIT License](http://www.opensource.org/licenses/mit-license.php)
