<div class='anchor' id='about'></div>

### About

**RSyntaxTree** is a graphical syntax tree generator written in the Ruby programming language.

Documentation of the input text syntax and markups of RSyntaxTree is available in [English](https://yohasebe.github.io/rsyntaxtree/documentation) and [Japanese](https://yohasebe.github.io/rsyntaxtree/documentation_ja). See also [Example Gallery](https://yohasebe.github.io/rsyntaxtree/examples) for different types of sample input and result syntree images.

A [command-line version](http://github.com/yohasebe/rsyntaxtree) of RSyntaxTree is available on GitHub. A web user interface for RSyntaxTree is also available; you can run RSyntaxTree with a web UI locally on your computer using [Docker](https://www.docker.com/products/docker-desktop/).

The original version of RSyntaxTree was inspired by [phpSyntaxTree](http://ironcreek.net/phpsyntaxtree/) by André Esenbach.

### What's new

As of **2.0.0** (August 2026). Dates and details for every release are in the
[changelog](https://yohasebe.github.io/rsyntaxtree/changelog).

* Shear: `Shear` tilts the finished figure by so many degrees and `Shear
  plane` draws the plane it lies on, so the lean reads as a surface seen at
  an angle. The whole picture leans as one piece — a region shade inside it
  comes out a parallelogram of its own accord
* `Label air` sets the space a label keeps from its connectors, the same
  above as below. Every figure now has that space equal: it used to be
  measured from the invisible box around a label, whose edges sit unevenly
  around the type
* JPG and GIF output are gone, and with them the ImageMagick dependency —
  installing the gem no longer asks a machine for it. Use PNG
* The options `symmetrize`, `tidy_spacing` and `tidy_nest` are gone too;
  `Tidy layout` and `H spacing` say what they said, and asking for one of
  the old names now says so rather than passing over it in silence
* Derivations: `Derivation` joins each node to its daughters with one rule
  across them, and `Direction: btt` puts the words first — the format
  categorial grammar is written in, rule names included
* Attribute-value matrices: `	` aligns columns down a label and `#(` … `#)`
  nests one matrix inside another, for the feature structures of HPSG, SBCG
  and LFG
* A one-page reference for the notation — the characters that already mean
  something, then every feature at a line each — at
  [notation.txt](https://yohasebe.github.io/rsyntaxtree/notation.txt), also
  what `rsyntaxtree --notation` prints; made for handing to an AI model
* The editor marks the line where the input is wrong while you write, with the
  cause and a one-line fix
* Region shade with `%`: shade the whole subtree a node governs, in colour
  with `%@blue:`
* Mirror option: right-to-left trees for Arabic and Hebrew syntax
* Tidy layout: one scale from symmetric to high that packs the tree
* Per-node colour with `@color:`, left-to-right layout with `Direction`, and
  an IPA virtual keyboard

### How to cite

If you use RSyntaxTree in your research or teaching materials, please cite it. You can use the following BibTeX entry (adjust `version` to the one shown at the top of this page):

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

### Related blog posts

[RSyntaxTree tag on yohasebe.com](https://yohasebe.com/tags/rsyntaxtree/)

### Author

Yoichiro HASEBE &nbsp;&nbsp;
<a href='mailto:yohasebe@gmail.com'><i class="fa fa-envelope" aria-hidden="true"></a></i>&nbsp;&nbsp;
<a href='https://twitter.com/yohasebe'><i class="fab fa-twitter" aria-hidden="true"></a></i>&nbsp;&nbsp;
<a href='https://github.com/yohasebe'><i class="fab fa-github" aria-hidden="true"></a></i>

### License

[The MIT License](http://www.opensource.org/licenses/mit-license.php)
